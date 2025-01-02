import React, { useState, useEffect } from 'react';
import { Form, Select, Button, message, Table } from 'antd';
import apiClient from '../apiClient';

const { Option } = Select;

function AssignLifeguard() {
  const [form] = Form.useForm();
  const [sessions, setSessions] = useState([]);
  const [lifeguards, setLifeguards] = useState([]);
  const [assignedSessions, setAssignedSessions] = useState([]);

  // Fetch sessions, lifeguards, and assigned data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionResponse = await apiClient.get('/api/spa/sessions');
        const lifeguardResponse = await apiClient.get('/api/spa/lifeguards');
        const assignedResponse = await apiClient.get('/api/spa/assigned-sessions');
        setSessions(sessionResponse.data);
        setLifeguards(lifeguardResponse.data);
        setAssignedSessions(assignedResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const handleAssign = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.put(`/api/spa/sessions/${values.sessionID}/assign-lifeguard`, {
        lifeguardID: values.lifeguardID,
      });
      message.success('Lifeguard assigned successfully!');
      form.resetFields();

      // Refresh assigned sessions
      const updatedAssignedResponse = await apiClient.get('/api/spa/assigned-sessions');
      setAssignedSessions(updatedAssignedResponse.data);
    } catch (error) {
      console.error(error);
      message.error('Failed to assign lifeguard.');
    }
  };

  const columns = [
    {
      title: 'Session ID',
      dataIndex: 'sessionID',
      key: 'sessionID',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
    },
    {
      title: 'Lifeguard',
      dataIndex: 'lifeguardName',
      key: 'lifeguardName',
    },
  ];

  return (
    <>
      <Form form={form} layout="vertical">
        <Form.Item
          label="Session"
          name="sessionID"
          rules={[{ required: true, message: 'Please select a session!' }]}
        >
          <Select placeholder="Select a session">
            {sessions.map((session) => (
              <Option key={session.sessionID} value={session.sessionID}>
                {`Session ${session.sessionID} (${session.date})`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Lifeguard"
          name="lifeguardID"
          rules={[{ required: true, message: 'Please select a lifeguard!' }]}
        >
          <Select placeholder="Select a lifeguard">
            {lifeguards.map((lifeguard) => (
              <Option key={lifeguard.userID} value={lifeguard.userID}>
                {`${lifeguard.forename} ${lifeguard.surname}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleAssign}>
            Assign
          </Button>
        </Form.Item>
      </Form>

      <h2>Assigned Lifeguards and Sessions</h2>
      <Table
        dataSource={assignedSessions.map((session) => ({
          key: session.sessionID,
          sessionID: session.sessionID,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          lifeguardName: `${session.lifeguardForename} ${session.lifeguardSurname}`,
        }))}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
    </>
  );
}

export default AssignLifeguard;
