import React from 'react';
import { Menu, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  DashboardOutlined,
  LogoutOutlined,
  SettingOutlined,
  WalletOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

function Navbar({ walletBalance }) {
  const navigate = useNavigate();

  // Log Out Handler
  const handleLogOut = () => {
    localStorage.removeItem('authToken');
    message.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '60px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      {/* App Name */}
      <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
        Poolify
      </Title>

      {/* Navigation Menu */}
      <Menu mode="horizontal" theme="light" style={{ flex: 1, justifyContent: 'center' }}>
        <Menu.Item key="classes" icon={<BookOutlined />}>
          <Link to="/classes">Classes</Link>
        </Menu.Item>
        <Menu.Item key="cart" icon={<ShoppingCartOutlined />}>
          <Link to="/cart">Cart</Link>
        </Menu.Item>
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          <Link to="/coach-dashboard">Coach Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="settings" icon={<SettingOutlined />}>
          <Link to="/settings">Settings</Link>
        </Menu.Item>
        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogOut}>
          Log Out
        </Menu.Item>
      </Menu>

      {/* Wallet Balance */}
      <div style={{ marginLeft: 'auto', fontSize: '1.2rem', color: '#1890ff', display: 'flex', alignItems: 'center' }}>
        <WalletOutlined style={{ marginRight: '8px' }} />
        Wallet: ${walletBalance}
      </div>
    </div>
  );
}

export default Navbar;
