// pages/LogIn.js
import React from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function LogIn() {
  const navigate = useNavigate();

  // Handler for form submission
  const onFinish = (values) => {
    console.log('Success:', values);
    // Navigate to the Classes page after a successful login
    navigate('/classes');
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
          {/* Username Input */}
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter your username!' }]}
          >
            <Input placeholder="Username" />
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
