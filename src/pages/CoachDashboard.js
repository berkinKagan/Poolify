import React, { useState } from 'react';
import { Card, Typography, Button, Modal, Form, Input, Select, Table, message } from 'antd';
import apiClient from '../apiClient';

const { Paragraph } = Typography;
const { Option } = Select;

function CoachDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [form] = Form.useForm();
  const [sessionType, setSessionType] = useState('');

  const columns = [
    { title: 'Session Name', dataIndex: 'name', key: 'name' },
    { title: 'Level', dataIndex: 'level', key: 'level' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Time', dataIndex: 'time', key: 'time' },
  ];

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const response = await apiClient.post('/sessions', values);
      setSessions([...sessions, { key: sessions.length, ...response.data }]);
      message.success('Session created successfully');
      form.resetFields();
      setIsModalOpen(false);
      setSessionType(''); // Reset session type
    } catch (error) {
      message.error('Failed to create session');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setSessionType(''); // Reset session type
  };

  const onTypeChange = (value) => {
    setSessionType(value);
  };

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
              label="Class Capacity"
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
              <Input type="number" step="0.01" />
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
          <Form.Item
            label="Session Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the session name' }]}
          >
            <Input />
          </Form.Item>
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
          {renderAdditionalFields()}
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

        </Form>
      </Modal>
    </Card>
  );
}

export default CoachDashboard;
