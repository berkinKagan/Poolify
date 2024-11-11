import React, { useState } from 'react';
import { Card, Button, List, message, Typography, Select, DatePicker, TimePicker, Space } from 'antd';
import { CloudOutlined, ThunderboltOutlined, FireOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const swimmingClassesData = [
  {
    classID: 'SW001',
    classCapacity: 20,
    currentEnrollment: 18,
    classLevel: 'Beginner',
    classType: 'Freestyle Swimming',
    ageLimit: 12,
    registrationDeadline: '2024-12-01',
    date: '2024-12-10',
    time: '10:00',
    price: '$50',
    icon: <CloudOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
  },
  {
    classID: 'SW002',
    classCapacity: 15,
    currentEnrollment: 12,
    classLevel: 'Intermediate',
    classType: 'Butterfly Stroke',
    ageLimit: 14,
    registrationDeadline: '2024-12-05',
    date: '2024-12-12',
    time: '12:00',
    price: '$70',
    icon: <ThunderboltOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
  },
  {
    classID: 'SW003',
    classCapacity: 10,
    currentEnrollment: 10,
    classLevel: 'Advanced',
    classType: 'Backstroke',
    ageLimit: 16,
    registrationDeadline: '2024-12-10',
    date: '2024-12-15',
    time: '14:00',
    price: '$90',
    icon: <FireOutlined style={{ fontSize: '48px', color: '#f5222d' }} />,
  },
  {
    classID: 'SW004',
    classCapacity: 25,
    currentEnrollment: 20,
    classLevel: 'Beginner',
    classType: 'Breaststroke',
    ageLimit: 12,
    registrationDeadline: '2024-12-15',
    date: '2024-12-18',
    time: '16:00',
    price: '$55',
    icon: <CloudOutlined style={{ fontSize: '48px', color: '#faad14' }} />,
  },
  {
    classID: 'SW005',
    classCapacity: 30,
    currentEnrollment: 28,
    classLevel: 'Intermediate',
    classType: 'Mixed Styles',
    ageLimit: 18,
    registrationDeadline: '2024-12-20',
    date: '2024-12-20',
    time: '18:00',
    price: '$80',
    icon: <ThunderboltOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
  },
];

function Classes() {
  const [filteredClasses, setFilteredClasses] = useState(swimmingClassesData);
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({ date: null, time: null, level: null });

  // Handler for applying filters
  const applyFilters = () => {
    let filtered = swimmingClassesData;

    if (filters.date) {
      filtered = filtered.filter((cls) => cls.date === filters.date);
    }
    if (filters.time) {
      filtered = filtered.filter((cls) => cls.time === filters.time);
    }
    if (filters.level) {
      filtered = filtered.filter((cls) => cls.classLevel === filters.level);
    }

    setFilteredClasses(filtered);
  };

  // Handler for adding a class to the cart
  const addToCart = (classSession) => {
    const now = moment();
    const deadline = moment(classSession.registrationDeadline);

    if (classSession.currentEnrollment >= classSession.classCapacity) {
      message.error('Class is full!');
      return;
    }
    if (now.isAfter(deadline)) {
      message.error('Registration deadline has passed!');
      return;
    }

    setCart([...cart, classSession.classID]);
    message.success('Class added to cart!');
  };

  return (
    <div style={{ padding: '20px', background: 'linear-gradient(to bottom, #e0f7fa, #ffffff)', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title level={2} style={{ color: '#1890ff' }}>Explore Our Swimming Classes</Title>
        <Paragraph style={{ fontSize: '1.2rem' }}>
          Use the filters to find the perfect swimming class for you.
        </Paragraph>
      </div>

      {/* Filters Section */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <Space size="large" align="center">
          <DatePicker
            placeholder="Select Date"
            onChange={(date) => setFilters({ ...filters, date: date ? date.format('YYYY-MM-DD') : null })}
          />
          <TimePicker
            placeholder="Select Time"
            format="HH:mm"
            onChange={(time) => setFilters({ ...filters, time: time ? time.format('HH:mm') : null })}
          />
          <Select
            placeholder="Select Level"
            style={{ width: 150 }}
            onChange={(level) => setFilters({ ...filters, level })}
          >
            <Option value="Beginner">Beginner</Option>
            <Option value="Intermediate">Intermediate</Option>
            <Option value="Advanced">Advanced</Option>
          </Select>
          <Button type="primary" onClick={applyFilters}>Apply Filters</Button>
        </Space>
      </div>

      {/* Class List */}
      <List
        itemLayout="vertical"
        size="large"
        dataSource={filteredClasses}
        renderItem={(classSession) => (
          <Card
            key={classSession.classID}
            hoverable
            style={{
              marginBottom: '20px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              {classSession.icon}
            </div>
            <Title level={4}>{classSession.classType} - {classSession.classLevel}</Title>
            <Paragraph><strong>Date:</strong> {classSession.date}</Paragraph>
            <Paragraph><strong>Time:</strong> {classSession.time}</Paragraph>
            <Paragraph><strong>Capacity:</strong> {classSession.currentEnrollment}/{classSession.classCapacity}</Paragraph>
            <Paragraph><strong>Age Limit:</strong> {classSession.ageLimit}</Paragraph>
            <Paragraph><strong>Price:</strong> {classSession.price}</Paragraph>
            <Button type="primary" block onClick={() => addToCart(classSession)}>Add to Cart</Button>
          </Card>
        )}
      />
    </div>
  );
}

export default Classes;
