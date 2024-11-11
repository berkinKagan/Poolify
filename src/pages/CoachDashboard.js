// pages/CoachDashboard.js
import React from 'react';
import { Card, Typography } from 'antd';

const { Paragraph } = Typography;

function CoachDashboard() {
  return (
    <Card title="Coach Dashboard" style={{ width: 600, margin: 'auto', marginTop: 50 }}>
      <Paragraph>Welcome, Coach! Here you can manage your classes and students.</Paragraph>
    </Card>
  );
}

export default CoachDashboard;
