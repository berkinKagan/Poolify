import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, Modal, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';

const { Option } = Select;
const { Title, Text } = Typography;

function SignUp() {
  const [userRole, setUserRole] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate(); // To redirect after sign-up

  const onFinish = async (values) => {
    try {
      // Make API call to create a user
      const response = await apiClient.post('/api/users/', {
        name: values.name,
        surname: values.surname,
        gender: values.gender, // Add gender here
        age: values.age,       // Add age here
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber || null,
        userRole: values.userRole,
        ...(userRole === 'lifeguard' && { proficiency: values.proficiency }),
        ...(userRole === 'coach' && {
          status: values.status,
          coachType: values.coachType,
          experienceInYears: values.experienceInYears,
        }),
      });
      
      message.success(response.data.message);
      navigate('/login'); // Redirect to login after successful sign-up
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleRoleChange = (value) => {
    setUserRole(value);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setUserRole(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Title level={1} style={{ color: '#1890ff', fontSize: '3rem', marginBottom: '30px' }}>Poolify</Title>
      <Card title="Sign Up" style={{ width: 500, padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <Form onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter your name!' }]}>
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item name="surname" label="Surname" rules={[{ required: true, message: 'Please enter your surname!' }]}>
            <Input placeholder="Surname" />
          </Form.Item>
          <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Please select your gender!' }]}>
            <Select placeholder="Select Gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item name="age" label="Age" rules={[{ required: true, message: 'Please enter your age!' }]}>
            <Input type="number" placeholder="Age" min={0} />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Phone Number">
            <Input placeholder="Phone Number" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter your email!' }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter your password!' }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item name="userRole" label="User Role" rules={[{ required: true, message: 'Please select a user role!' }]}>
            <Select placeholder="Select Role" onChange={handleRoleChange}>
              <Option value="lifeguard">Lifeguard</Option>
              <Option value="administrator">Administrator</Option>
              <Option value="janitor">Janitor</Option>
              <Option value="coach">Coach</Option>
              <Option value="swimmer">Swimmer</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block style={{ fontSize: '1.2rem', height: '50px' }}>
              Sign Up
            </Button>
          </Form.Item>
          <Text style={{ display: 'block', textAlign: 'center', marginTop: '20px' }}>
            Already have an account? <Link to="/login">Log In</Link>
          </Text>
        </Form>
      </Card>
      <Modal
        title={`Additional Details for ${userRole}`}
        centered
        visible={modalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
        ]}
      >
        <Form layout="vertical" size="large">
          {userRole === 'lifeguard' && (
            <Form.Item name="proficiency" label="Proficiency" rules={[{ required: true, message: 'Please enter your proficiency level!' }]}>
              <Input placeholder="Proficiency Level" />
            </Form.Item>
          )}
          {userRole === 'coach' && (
            <>
              <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please enter your status!' }]}>
                <Input placeholder="Status" />
              </Form.Item>
              <Form.Item name="coachType" label="Coach Type" rules={[{ required: true, message: 'Please enter the coach type!' }]}>
                <Input placeholder="Coach Type" />
              </Form.Item>
              <Form.Item name="experienceInYears" label="Experience (Years)" rules={[{ required: true, message: 'Please enter your experience in years!' }]}>
                <Input type="number" placeholder="Experience in Years" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default SignUp;
