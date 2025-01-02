import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Modal, Form, Input, Select, Table, message } from 'antd';
import apiClient from '../apiClient';
import { getUserFromLocalStorage } from '../Auth';

const { Paragraph } = Typography;
const { Option } = Select;

function CoachDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [form] = Form.useForm();
  const [sessionType, setSessionType] = useState('');

  // Assume we have a user object with userID if the user is a coach
  const [user] = useState(getUserFromLocalStorage());

  // We'll store available lanes here (ADDED)
  const [lanes, setLanes] = useState([]);

  // Example table columns for local display
  const columns = [
    { title: 'Class ID', dataIndex: 'classID', key: 'classID' },
    { title: 'Type', dataIndex: 'classType', key: 'classType' },
    { title: 'Level', dataIndex: 'classLevel', key: 'classLevel' },
    { title: 'Date', dataIndex: 'classDate', key: 'classDate', width: 120 },
    { title: 'Time', dataIndex: 'timeRange', key: 'timeRange' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Coach', dataIndex: 'coachName', key: 'coachName' },
    { title: 'Pool ID', dataIndex: 'poolID', key: 'poolID' },
  ];

  // 1) On mount, fetch existing classes for this coach
  useEffect(() => {
    const fetchCoachClasses = async () => {
      try {
        if (!user?.userID) return;  // if no userID, skip
        // Example endpoint: GET /api/classes/coach/:coach_id
        const response = await apiClient.get(`/api/classes/coach/${user.userID}`);
        const transformedData = response.data.map((session) => ({
          key: session.classID,
          classID: session.classID,
          classType: session.classType,
          classLevel: session.classLevel,
          classDate: session.classDate,
          timeRange: `${session.startTime} - ${session.endTime}`,
          price: session.price,
          coachName: session.coach
            ? session.coach.firstName + ' ' + session.coach.lastName
            : '',
          poolID: session.pool?.poolID ?? '',
        }));
        setSessions(transformedData);
      } catch (error) {
        console.error('Failed to fetch coach classes', error);
        message.error('Could not load coach classes');
      }
    };
    fetchCoachClasses();
  }, [user?.userID]);

  // 2) We watch form values (date, startTime, endTime). (ADDED)
  const dateValue = Form.useWatch('date', form);
  const startTimeValue = Form.useWatch('startTime', form);
  const endTimeValue = Form.useWatch('endTime', form);

  // 3) Whenever date/startTime/endTime changes, fetch the available lanes. (ADDED)
  useEffect(() => {
    // Only fetch if all three have values
    if (!dateValue || !startTimeValue || !endTimeValue) return;

    const fetchAvailableLanes = async () => {
      try {
        // Construct the query string
        // e.g. /api/classes/lanes/available?date=2025-01-10&startTime=09:00:00&endTime=10:00:00
        const queryString = `?date=${encodeURIComponent(dateValue)}&startTime=${encodeURIComponent(
          startTimeValue
        )}&endTime=${encodeURIComponent(endTimeValue)}`;

        const response = await apiClient.get(`/api/classes/lanes/available${queryString}`);
        setLanes(response.data); // e.g. [{laneID: 1, poolID:1, capacity:4, current_usage:2}, ...]
      } catch (error) {
        console.error('Failed to fetch lanes', error);
        message.error('Could not load lanes');
      }
    };

    fetchAvailableLanes();
  }, [dateValue, startTimeValue, endTimeValue]);

  // Show the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Hide the modal
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setSessionType('');
  };

  //  Called when user picks a session type
  const onTypeChange = (value) => {
    setSessionType(value);
  };

  // 4) Called when user clicks OK in the modal to create a class
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Convert numeric fields
      const processedValues = { ...values };
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

      // Rename date -> classDate if it's a ClassSession
      if (processedValues.date) {
        processedValues.classDate = processedValues.date;
        delete processedValues.date;
      }

      // Provide any other required fields that your backend needs
      processedValues.poolID = 1; // or pick from user?
      // (ADDED) If user selected a lane in the UI, we use that laneID
      // If you want the user to pick from <Select lane> below, do something like:
      // processedValues.laneID = form.getFieldValue('laneID'); 
      processedValues.coachID = user.userID || 1;
      processedValues.lifeguardID = 1;

      // Post to the correct endpoint
      const endpoint =
        sessionType === 'ClassSession' ? '/api/classes/' : '/api/trainingsessions/';

      console.log('Final processedValues:', processedValues);
      const response = await apiClient.post(endpoint, processedValues);

      // If success, add to table and notify
      setSessions([...sessions, { key: sessions.length, ...response.data }]);
      message.success('Session created successfully');
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

  // 5) Conditionally render fields based on sessionType
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
              rules={[{ required: true, message: 'Please enter the age limit' }]}
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
          </>
        );

      case 'SwimmingSession':
        return (
          <>
            <Form.Item
              label="Session Size"
              name="sessionSize"
              rules={[{ required: true, message: 'Please enter the session size' }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              label="Session Level"
              name="sessionLevel"
              rules={[{ required: true, message: 'Please select the session level' }]}
            >
              <Select placeholder="Select Session Level">
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
              </Select>
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card title="Coach Dashboard" style={{ width: 800, margin: 'auto', marginTop: 50 }}>
      <Paragraph>Welcome, Coach! Here you can manage your classes and students.</Paragraph>
      <Button type="primary" onClick={openModal}>
        Create Session
      </Button>

      <Table dataSource={sessions} columns={columns} style={{ marginTop: 20 }} />

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
              <Option value="SwimmingSession">Swimming Session</Option>
            </Select>
          </Form.Item>

          {/* 3. Additional fields based on session type */}
          {renderAdditionalFields()}

          {/* 4. Common date/time fields */}
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
                  return Promise.reject(
                    new Error('End time must be after start time')
                  );
                },
              }),
            ]}
          >
            <Input type="time" />
          </Form.Item>

          {/* (ADDED) If we want to let user pick a lane from available lanes: */}
          {lanes.length > 0 && (
            <Form.Item
              label="Select Lane"
              name="laneID"
              rules={[{ required: true, message: 'Please select a lane' }]}
            >
              <Select placeholder="Available lanes based on selected date/time">
                {lanes.map((lane) => (
                  <Option key={lane.laneID} value={lane.laneID}>
                    Lane #{lane.laneID} (capacity={lane.capacity}, usage={lane.current_usage})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
}

export default CoachDashboard;
