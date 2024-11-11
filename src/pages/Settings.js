// pages/Settings.js
import React from 'react';
import { Card, Typography, Form, Input, Button } from 'antd';

const { Title } = Typography;

function Settings() {
  const onFinish = (values) => {
    console.log('Settings Updated:', values);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title="Settings" style={{ width: 500, padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <Title level={4}>Update Your Profile</Title>
        <Form onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please enter your username!' }]}>
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter your email!' }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="phone" label="Phone Number">
            <Input placeholder="Phone Number" />
          </Form.Item>
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
