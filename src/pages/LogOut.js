import React from 'react';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

function LogOut() {
  const navigate = useNavigate();

  const handleLogOut = () => {
    // Clear user data from local storage
    localStorage.clear();

    // Show a success message
    message.success('Logged out successfully!');

    // Redirect to login page
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
