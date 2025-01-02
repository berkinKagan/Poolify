import { Menu, Typography, message, Modal, Form, Input, Button, Tabs, Select } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  DashboardOutlined,
  LogoutOutlined,
  SettingOutlined,
  WalletOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { getUserFromLocalStorage } from '../Auth';
import apiClient from '../apiClient'; // Assuming this is configured for API calls

const { Title } = Typography;
const { TabPane } = Tabs;

function Navbar() {
  const [currentUser, setCurrentUser] = useState(getUserFromLocalStorage());
  const [accountBalance, setAccountBalance] = useState(0.0); // Holds the swimmer's account balance
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [existingCards, setExistingCards] = useState([]); // Holds existing cards
  const [form] = Form.useForm();

  useEffect(() => {
    const user = getUserFromLocalStorage();
    setCurrentUser(user);

    if (user?.userRole === 'swimmer') {
      fetchAccountBalance(user.userID); // Fetch account balance on load
      fetchExistingCards(user.userID); // Fetch existing cards for the current user
    }
  }, []);

  // Fetch swimmer's account balance
  const fetchAccountBalance = async (userID) => {
    try {
      const response = await apiClient.get(`/api/users/account_balance/${userID}`);
      setAccountBalance(response.data.account_balance); // Update state with the balance
    } catch (error) {
      message.error('Failed to fetch account balance. Please try again.');
      console.error(error);
    }
  };

  // Fetch cards for the current user from the API
  const fetchExistingCards = async (userID) => {
    try {
      const response = await apiClient.get(`/api/payment/cards`, {
        params: { userID },
      });
      setExistingCards(response.data);
    } catch (error) {
      message.error('Failed to fetch cards. Please try again.');
      console.error(error);
    }
  };

  // Handle Modal Visibility
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Handle Form Submission for Adding a Card
  const handleAddCard = async (values) => {
    try {
      const response = await apiClient.post('/api/payment/cards', {
        userID: currentUser.userID,
        cardNumber: values.cardNumber,
      });
      message.success('Card added successfully!');
      setExistingCards((prev) => [...prev, response.data]); // Update the cards list
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to add card. Please try again.');
      console.error(error);
    }
  };

  // Handle Form Submission for Topping Up Balance
  const handleTopUp = async (values) => {
    try {
      await apiClient.post('/api/payment/topup', {
        userID: currentUser.userID,
        cardID: values.cardID,
        amount: Number(values.amount),
      });
      message.success(`Wallet topped up successfully by $${values.amount}!`);
      fetchAccountBalance(currentUser.userID); // Refresh account balance after top-up
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to top up balance. Please try again.');
      console.error(error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: '60px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* App Name */}
      <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
        Poolify
      </Title>

      {/* Navigation Menu */}
      <Menu mode="horizontal" theme="light" style={{ flex: 1, justifyContent: 'center' }}>
        {currentUser && currentUser.userRole === 'administrator' && (<Menu.Item key="administrator" icon={<BookOutlined />}>
          <Link to="/administrator-dashboard">Admin Dashboard</Link>
        </Menu.Item>)}
        <Menu.Item key="classes" icon={<BookOutlined />}>
          <Link to="/classes">Classes</Link>
        </Menu.Item>
        { currentUser && currentUser.userRole === "swimmer" && (<Menu.Item key="cart" icon={<ShoppingCartOutlined />}>
          <Link to="/cart">Cart</Link>
        </Menu.Item>)}
        {currentUser && currentUser.userRole === 'coach' && (
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/coach-dashboard">Coach Dashboard</Link>
          </Menu.Item>
        )}
        { currentUser && currentUser.userRole === 'swimmer' && (<Menu.Item key="other-activities" icon={<StarOutlined />}>
          <Link to="/other-activities">Other Activities</Link>
        </Menu.Item>)}
        <Menu.Item key="settings" icon={<SettingOutlined />}>
          <Link to="/settings">Settings</Link>
        </Menu.Item>
        <Menu.Item key="logout" icon={<LogoutOutlined />}>
          <Link to="/logout">Log Out</Link>
        </Menu.Item>
      </Menu>

      {/* Wallet Balance */}
      {currentUser.userRole === 'swimmer' && (
        <div
          style={{
            marginLeft: 'auto',
            fontSize: '1.2rem',
            color: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={showModal} // Open Modal on Click
        >
          <WalletOutlined style={{ marginRight: '8px' }} />
          Wallet: ${accountBalance.toFixed(2)} {/* Display account balance */}
        </div>
      )}

      {/* Modal for Adding a Card or Topping Up Balance */}
      <Modal
        title="Wallet Options"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Tabs defaultActiveKey="1">
          {/* Tab for Adding a New Card */}
          <TabPane tab="Add New Card" key="1">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAddCard}
            >
              <Form.Item
                name="cardNumber"
                label="Card Number"
                rules={[
                  { required: false, message: 'Please enter your card number' },
                  { pattern: /^\d{16}$/, message: 'Card number must be 16 digits' },
                ]}
              >
                <Input placeholder="Enter card number" />
              </Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginTop: '10px' }}>
                Add Card
              </Button>
            </Form>
          </TabPane>

          {/* Tab for Topping Up Balance */}
          <TabPane tab="Top Up Balance" key="2">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleTopUp}
            >
              <Form.Item
                name="cardID"
                label="Select Card"
                rules={[{ required: false, message: 'Please select a card' }]}
              >
                <Select placeholder="Choose a card">
                  {existingCards.map((card) => (
                    <Select.Option key={card.cardID} value={card.cardID}>
                      {card.cardID}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="amount"
                label="Top Up Amount"
                rules={[
                  { required: false, message: 'Please enter an amount' },
                ]}
              >
                <Input type="number" placeholder="Enter amount to top up" />
              </Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginTop: '10px' }}>
                Top Up
              </Button>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
}

export default Navbar;
