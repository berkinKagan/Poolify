import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Table,
  message,
  Tabs
} from 'antd';
import apiClient from '../apiClient';
import { getUserFromLocalStorage } from '../Auth';

const { Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

function CoachDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [sessionType, setSessionType] = useState('');

  // We’ll keep two separate lists: one for Class Sessions, one for Training Sessions
  const [classSessions, setClassSessions] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);

  // We'll store available lanes here (used by the modal)
  const [lanes, setLanes] = useState([]);

  // Get the logged-in user (assumes user is a coach)
  const [user] = useState(getUserFromLocalStorage());

  /**
   * 1) Fetch class sessions for this coach
   */
  useEffect(() => {
    const fetchCoachClasses = async () => {
      try {
        if (!user?.userID) return;
        // Example endpoint: GET /api/classes/coach/:coach_id
        const response = await apiClient.get(`/api/classes/coach/${user.userID}`);
        const transformedData = response.data.map((session) => ({
          key: session.classID,
          classID: session.classID,
          classType: session.classType,
          classLevel: session.classLevel,
          courseDescription: session.courseDescription,
          classDate: session.classDate,
          timeRange: `${session.startTime} - ${session.endTime}`,
          price: session.price,
          coachName: session.coach
            ? session.coach.firstName + ' ' + session.coach.lastName
            : '',
          poolId: session.pool?.poolID,
          genderRestriction: session.genderRestriction,
        }));
        console.log('Class sessions:', transformedData);
        setClassSessions(transformedData);
      } catch (error) {
        console.error('Failed to fetch coach classes', error);
        message.error('Could not load coach classes');
      }
    };
    fetchCoachClasses();
  }, [user?.userID]);

  /**
   * 2) Fetch training sessions for this coach
   */
  useEffect(() => {
    const fetchCoachTraining = async () => {
      try {
        if (!user?.userID) return;
        // Example endpoint: GET /api/classes/coachtraining/:coach_id
        const response = await apiClient.get(`/api/classes/coachtraining/${user.userID}`);
        const transformedData = response.data.map((session) => ({
          key: session.trainingID, // Ensure trainingID is defined
          trainingID: session.trainingID,
          trainingType: session.trainingType,
          trainingLevel: session.trainingLevel,
          trainingDate: session.trainingDate, // Use correct key
          timeRange: `${session.startTime} - ${session.endTime}`,
          coachName: session.coach
            ? `${session.coach.firstName} ${session.coach.lastName}`
            : '',
          poolId: session.pool?.poolID || 'N/A', // Provide a default value
        }));
        console.log('Training sessions:', transformedData);
        setTrainingSessions(transformedData);
      } catch (error) {
        console.error('Failed to fetch coach trainings', error);
        message.error('Could not load coach training sessions');
      }
    };
    fetchCoachTraining();
  }, [user?.userID]);
  

  /**
   * 3) Watch form fields (date, startTime, endTime) and fetch available lanes
   */
  const dateValue = Form.useWatch('date', form);
  const startTimeValue = Form.useWatch('startTime', form);
  const endTimeValue = Form.useWatch('endTime', form);

  useEffect(() => {
    if (!dateValue || !startTimeValue || !endTimeValue) return;

    const fetchAvailableLanes = async () => {
      try {
        const query = `?date=${encodeURIComponent(dateValue)}&startTime=${encodeURIComponent(startTimeValue)}&endTime=${encodeURIComponent(endTimeValue)}`;
        const response = await apiClient.get(`/api/classes/lanes/available${query}`);
        setLanes(response.data);
      } catch (error) {
        console.error('Failed to fetch lanes', error);
        message.error('Could not load lanes');
      }
    };

    fetchAvailableLanes();
  }, [dateValue, startTimeValue, endTimeValue]);

  /**
   * 4) Show/Hide the Modal
   */
  const openModal = () => setIsModalOpen(true);
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setSessionType('');
  };

  /**
   * 5) On session type change
   */
  const onTypeChange = (value) => {
    setSessionType(value);
  };

  /**
   * 6) If user selects a lane from the dropdown, fill poolID
   */
  const onLaneChange = (value) => {
    const laneInfo = lanes.find((lane) => lane.laneID === value);
    if (laneInfo) {
      form.setFieldsValue({ poolID: laneInfo.poolID });
      form.setFieldsValue({ laneID: laneInfo.laneID });
    }
  };

  /**
   * 7) Submit the form -> create class or training
   */
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const processedValues = { ...values };

      // Numeric conversions
      if (processedValues.price) {
        processedValues.price = parseFloat(processedValues.price);
      }
      if (processedValues.ageLimit) {
        processedValues.ageLimit = parseInt(processedValues.ageLimit, 10);
      }
      if (processedValues.classCapacity) {
        processedValues.capacity = parseInt(processedValues.classCapacity, 10);
        delete processedValues.classCapacity;
      }

      // Rename 'date' -> 'classDate' if ClassSession
      if ( processedValues.date) {
        processedValues.classDate = processedValues.date;
        delete processedValues.date;
      }

      // For TrainingSession, you might rename 'date' to something else
      // or keep it as 'date' if your backend expects that.

      // Fill additional required fields
      processedValues.laneID = form.getFieldValue('laneID');
      processedValues.poolID = form.getFieldValue('poolID');
      processedValues.lifeguardID = 1;               // placeholder
      processedValues.coachID = user.userID || 1;    // logged in coach

      // Decide which endpoint:
      const endpoint = sessionType === 'ClassSession'
        ? '/api/classes/'
        : '/api/classes/training';

      console.log('Final processedValues:', processedValues);

      // Post
      const response = await apiClient.post(endpoint, processedValues);

      // On success, you might want to re-fetch or locally append to
      // classSessions/trainingSessions. For now, let's just show a success message.
      message.success('Session created successfully');
      form.resetFields();
      setIsModalOpen(false);
      setSessionType('');

      // Refresh the session lists
      if (sessionType === 'ClassSession') {
        // Fetch Class Sessions again
        const refreshedClasses = await apiClient.get(`/api/classes/coach/${user.userID}`);
        const transformedClasses = refreshedClasses.data.map((session) => ({
          key: session.classID,
          classID: session.classID,
          classType: session.classType,
          classLevel: session.classLevel,
          courseDescription: session.courseDescription,
          classDate: session.classDate,
          timeRange: `${session.startTime} - ${session.endTime}`,
          price: session.price,
          coachName: session.coach
            ? `${session.coach.firstName} ${session.coach.lastName}`
            : '',
          poolId: session.pool?.poolID || '',
          genderRestriction: session.genderRestriction
        }));
        setClassSessions(transformedClasses);
      } else if (sessionType === 'TrainingSession') {
        // Fetch Training Sessions again
        const refreshedTrainings = await apiClient.get(`/api/classes/coachtraining/${user.userID}`);
        const transformedTrainings = refreshedTrainings.data.map((session) => ({
          key: session.trainingID,
          trainingID: session.trainingID,
          trainingType: session.trainingType,
          trainingLevel: session.trainingLevel,
          courseDescription: session.courseDescription || '',
          trainingDate: session.trainingDate,
          timeRange: `${session.startTime} - ${session.endTime}`,
          coachName: session.coach
            ? `${session.coach.firstName} ${session.coach.lastName}`
            : '',
          poolId: session.pool?.poolID || '',

        }));
        setTrainingSessions(transformedTrainings);
      }

      // Reset form and close modal
      form.resetFields();
      setIsModalOpen(false);
      setSessionType('');


    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to create session');
      }
    }
  };

  /**
   * 8) Columns for Class Sessions table
   */
  const classColumns = [
    {
      title: 'Class Type',
      dataIndex: 'classType',
      key: 'classType',
    },
    {
      title: 'Level',
      dataIndex: 'classLevel',
      key: 'classLevel',
    },
    {
      title: 'Description',
      dataIndex: 'courseDescription',
      key: 'courseDescription',
    },
    {
      title: 'Date',
      dataIndex: 'classDate',
      key: 'classDate',
      width: 120,
    },
    {
      title: 'Time',
      dataIndex: 'timeRange',
      key: 'timeRange',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Coach',
      dataIndex: 'coachName',
      key: 'coachName',
    },
    {
      title: "Gender Restriction",
      dataIndex: "genderRestriction",
      key: "genderRestriction",
    },
    {
      title: 'Pool ID',
      dataIndex: 'poolId',
      key: 'poolId',
    },
  ];

  /**
   * 9) Columns for Training Sessions table
   *    (If your backend returns different fields, adapt them below)
   */
  const trainingColumns = [
    {
      title: 'Training ID',
      dataIndex: 'trainingID',
      key: 'trainingID',
    },
    {
      title: 'Training Type',
      dataIndex: 'trainingType',
      key: 'trainingType',
    },
    {
      title: 'Training Level',
      dataIndex: 'trainingLevel',
      key: 'trainingLevel',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: 'Time',
      dataIndex: 'timeRange',
      key: 'timeRange',
    },
    {
      title: 'Coach',
      dataIndex: 'coachName',
      key: 'coachName',
    },
    {
      title: 'Pool ID',
      dataIndex: 'poolId',
      key: 'poolId',
    },
  ];

  /**
   * 10) Render additional fields based on sessionType
   */
  const renderAdditionalFields = () => {
    switch (sessionType) {
      case 'TrainingSession':
        return (
          <>
            <Form.Item
              label="Training Level"
              name="trainingLevel"
              rules={[{ required: true, message: 'Please select the training level' }]}
            >
              <Select placeholder="Select Training Level">
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Training Type"
              name="trainingType"
              rules={[{ required: true, message: 'Please enter the training type' }]}
            >
              <Input />
            </Form.Item>
          </>
        );

      case 'ClassSession':
        return (
          <>
            <Form.Item
              label="Capacity"
              name="classCapacity"
              rules={[{ required: true, message: 'Please enter the class capacity' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Class Level"
              name="classLevel"
              rules={[{ required: true, message: 'Please select the class level' }]}
            >
              <Select placeholder="Select Class Level">
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Class Type"
              name="classType"
              rules={[{ required: true, message: 'Please enter the class type' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Age Limit"
              name="ageLimit"
              rules={[{ required: false }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Registration Deadline"
              name="registrationDeadline"
              rules={[{ required: true, message: 'Please enter the registration deadline' }]}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: 'Please enter the price' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Description"
              name="courseDescription"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Gender Restriction"
              name="genderRestriction"
              rules={[{ required: true, message: 'Please specify gender restriction' }]}
            >
              <Select placeholder="Specify Restriction">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="all">All</Option>
              </Select>
            </Form.Item>
          </>
        );

      
      default:
        return null;
    }
  };

  return (
    <Card title="Coach Dashboard" style={{ width: 1000, margin: 'auto', marginTop: 50 }}>
      <Typography.Title level={4}>Welcome, Coach!</Typography.Title>
      <Paragraph>Here you can manage your Classes and Training Sessions.</Paragraph>

      <Button type="primary" onClick={openModal}>
        Create Session
      </Button>

      {/* TABS: one for Class Sessions, one for Training Sessions */}
      <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
        <Tabs.TabPane tab="Class Sessions" key="1">
          <Table dataSource={classSessions} columns={classColumns} pagination={{ pageSize: 5 }} />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Training Sessions" key="2">
          <Table dataSource={trainingSessions} columns={trainingColumns} pagination={{ pageSize: 5 }} />
        </Tabs.TabPane>
      </Tabs>

      {/* The modal for creating new sessions */}
      <Modal
        title="Create New Session"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          {/* 1. Common session name */}
          <Form.Item
            label="Session Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the session name' }]}
          >
            <Input />
          </Form.Item>

          {/* 2. Session type (Training, Class, Swimming, etc.) */}
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: 'Please select a session type' }]}
          >
            <Select placeholder="Select a session type" onChange={onTypeChange}>
              <Option value="TrainingSession">Training Session</Option>
              <Option value="ClassSession">Class Session</Option>
            </Select>
          </Form.Item>

          {/* Additional fields specific to each session type */}
          {renderAdditionalFields()}

          {/*  Date/time fields */}
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please enter the date' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            label="Start Time"
            name="startTime"
            rules={[{ required: true, message: 'Please enter the start time' }]}
          >
            <Input type="time" />
          </Form.Item>

          <Form.Item
            label="End Time"
            name="endTime"
            rules={[
              { required: true, message: 'Please enter the end time' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value > getFieldValue('startTime')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('End time must be after start time'));
                },
              }),
            ]}
          >
            <Input type="time" />
          </Form.Item>

          {/* Lanes dropdown if date/time are filled */}
          {lanes.length > 0 && (
            <Form.Item
              label="Select Lane"
              name="laneID"
              rules={[{ required: true, message: 'Please select a lane' }]}
            >
              <Select placeholder="Available lanes based on selected date/time" onChange={onLaneChange}>
                {lanes.map((lane) => (
                  <Option key={lane.laneID} value={lane.laneID}>
                    Lane #{lane.laneID} (Pool #{lane.poolID})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Hidden (or auto-filled) fields for poolID, lifeguardID, etc. */}
          <Form.Item name="poolID" style={{ display: 'none' }}>
            <Input type="hidden" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default CoachDashboard;
