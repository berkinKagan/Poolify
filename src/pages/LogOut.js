// pages/LogOut.js
import React from 'react';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

function LogOut() {
  const navigate = useNavigate();

  const handleLogOut = () => {
    message.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <Button type="primary" danger onClick={handleLogOut}>
        Log Out
      </Button>
    </div>
  );
}

export default LogOut;
