import React, { useEffect, useState } from 'react';
import { Card, Typography, Form, Input, Button, Select, message } from 'antd';
import { getUserFromLocalStorage } from '../Auth';
import { useLocation } from 'react-router-dom';
import apiClient from '../apiClient';

const { Title } = Typography;
const { Option } = Select;

function Settings() {
  const [currentUser, setCurrentUser] = useState(null); // Initialize as null
  const location = useLocation();

  useEffect(() => {
    const user = getUserFromLocalStorage();
    setCurrentUser(user);
    console.log('Current User Settings:', user);
  }, [location]);

  const onFinish = async (values) => {
    console.log('Settings Updated:', values);
  
    try {
      // Add userID to the request body
      const payload = {
        ...values,
        userID: currentUser.userID,
      };
  
      // Call the updated endpoint
      const response = await apiClient.put('/api/users/', payload);
      console.log('User updated successfully:', response.data);
      //window.location.reload();
      message.success("User info updated successfully!")
      // Optionally show a success message or perform other actions
    } catch (error) {
      console.error('Error updating user:', error.response?.data || error.message);
      // Optionally handle error, e.g., show an error message
    }
  };
  
  

  const getRoleSpecificFields = () => {
    if (!currentUser) return null;

    switch (currentUser.userRole) {
      case 'swimmer':
        return (
          <>
            <Form.Item
              name="proficiency"
              label="Proficiency"
              rules={[{ required: false, message: 'Please select your proficiency!' }]}
            >
              <Select placeholder="Select Proficiency">
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="account_balance"
              label="Account Balance"
              rules={[
                { required: false, message: 'Please enter your account balance!' },
                
              ]}
            >
              <Input placeholder="Account Balance" type="number" />
            </Form.Item>
          </>
        );
      case 'coach':
        return (
          <>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: false, message: 'Please enter your status!' }]}
            >
              <Input placeholder="Status (e.g., Active, Inactive)" />
            </Form.Item>
            <Form.Item name="proficiency" label="Proficiency">
              <Select placeholder="Select Proficiency">
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="coachType"
              label="Coach Type"
              rules={[{ required: false, message: 'Please enter the type of coach!' }]}
            >
              <Input placeholder="Coach Type (e.g., Swimming, Diving)" />
            </Form.Item>
            <Form.Item name="experienceYears" label="Years of Experience">
              <Input placeholder="Years of Experience" type="number" />
            </Form.Item>
          </>
        );
      case 'lifeguard':
        return (
          <Form.Item
            name="proficiency"
            label="Proficiency"
            rules={[{ required: false, message: 'Please select your proficiency!' }]}
          >
            <Select placeholder="Select Proficiency">
              <Option value="Certified">Certified</Option>
              <Option value="Advanced">Advanced</Option>
            </Select>
          </Form.Item>
        );
      case 'administrator':
        return (
          <Form.Item name="specialAccess" label="Special Access">
            <Input placeholder="Special Access (e.g., Full, Partial)" />
          </Form.Item>
        );
      case 'janitor':
        return (
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: false, message: 'Please enter your status!' }]}
          >
            <Input placeholder="Status (e.g., Active, On Leave)" />
          </Form.Item>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card
        title="Settings"
        style={{ width: 500, padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
      >
        <Title level={4}>Update Your Profile</Title>
        <Form onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="phone" label="Phone Number">
            <Input placeholder="Phone Number" />
          </Form.Item>

          {/* Render role-specific fields */}
          {getRoleSpecificFields()}

          <Form.Item>
            <Button type="primary" htmlType="submit" block style={{ fontSize: '1.2rem', height: '50px' }}>
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Settings;
