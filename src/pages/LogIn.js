import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';

const { Title, Text } = Typography;

function LogIn() {
  const navigate = useNavigate();

  // Handler for form submission
  const onFinish = async (values) => {
    try {
      // Make API call to login endpoint
      const response = await apiClient.post('/api/users/login', {
        email: values.email,
        password: values.password,
      });

      // Handle success
      const { userRole, userID } = response.data;

      // Store user data in local storage
      localStorage.setItem('user', JSON.stringify({ userRole, userID }));

      message.success('Login successful!');

      // Navigate based on user role
      if (userRole === 'administrator') {
        navigate('/admin-dashboard'); // Example admin dashboard page
      } else {
        navigate('/classes'); // Default page for other users
      }
    } catch (error) {
      // Handle errors
      if (error.response?.status === 401) {
        message.error('Invalid email or password');
      } else if (error.response?.status === 404) {
        message.error('User not found');
      } else {
        message.error('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      {/* Poolify Title */}
      <Title level={1} style={{ color: '#1890ff', fontSize: '3rem', marginBottom: '30px' }}>
        Poolify
      </Title>

      {/* Log In Card */}
      <Card title="Log In" style={{ width: 400, padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <Form onFinish={onFinish} layout="vertical" size="large">
          {/* Email Input */}
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please enter your email!' }]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          {/* Password Input */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          {/* Log In Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ fontSize: '1.2rem', height: '50px' }}
            >
              Log In
            </Button>
          </Form.Item>

          {/* Link to Sign Up Page */}
          <Text style={{ display: 'block', textAlign: 'center', marginTop: '20px' }}>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </Text>
        </Form>
      </Card>
    </div>
  );
}

export default LogIn;
