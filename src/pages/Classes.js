import React, { useState } from 'react';
import { Card, Button, List, message, Typography, Select, DatePicker, TimePicker, Space } from 'antd';
import { CloudOutlined, ThunderboltOutlined, FireOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const swimmingClassesData = [
  {
    classID: 1,
    classCapacity: 20,
    classLevel: 'Beginner',
    classType: 'Freestyle Swimming',
    ageLimit: 12,
    registrationDeadline: '2024-12-01',
    price: '$50',
    date: '2024-12-10',
    time: '10:00',
    gender: 'All',
    icon: <CloudOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
  },
  {
    classID: 2,
    classCapacity: 15,
    classLevel: 'Intermediate',
    classType: 'Butterfly Stroke',
    ageLimit: 14,
    registrationDeadline: '2024-12-05',
    price: '$70',
    date: '2024-12-12',
    time: '12:00',
    gender: 'Women',
    icon: <ThunderboltOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
  },
  {
    classID: 3,
    classCapacity: 10,
    classLevel: 'Advanced',
    classType: 'Backstroke',
    ageLimit: 16,
    registrationDeadline: '2024-12-10',
    price: '$90',
    date: '2024-12-15',
    time: '14:00',
    gender: 'Men',
    icon: <FireOutlined style={{ fontSize: '48px', color: '#f5222d' }} />,
  },
  {
    classID: 4,
    classCapacity: 25,
    classLevel: 'Beginner',
    classType: 'Breaststroke',
    ageLimit: 12,
    registrationDeadline: '2024-12-15',
    price: '$55',
    date: '2024-12-18',
    time: '16:00',
    gender: 'Women',
    icon: <CloudOutlined style={{ fontSize: '48px', color: '#faad14' }} />,
  },
  {
    classID: 5,
    classCapacity: 30,
    classLevel: 'Intermediate',
    classType: 'Mixed Styles',
    ageLimit: 18,
    registrationDeadline: '2024-12-20',
    price: '$80',
    date: '2024-12-20',
    time: '18:00',
    gender: 'All',
    icon: <ThunderboltOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
  },
];

function Classes() {
  const [filteredClasses, setFilteredClasses] = useState(swimmingClassesData);
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({ date: null, time: null, level: null, gender: null });

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
    if (filters.gender) {
      filtered = filtered.filter((cls) => cls.gender === filters.gender || cls.gender === 'All');
    }

    setFilteredClasses(filtered);
  };

  // Handler for adding a class to the cart
  const addToCart = (classSession) => {
    const now = moment();
    const deadline = moment(classSession.registrationDeadline);

    if (classSession.classCapacity <= cart.filter((id) => id === classSession.classID).length) {
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
            style={{ width: 180 }}
            onChange={(level) => setFilters({ ...filters, level })}
          >
            <Option value="Beginner">Beginner</Option>
            <Option value="Intermediate">Intermediate</Option>
            <Option value="Advanced">Advanced</Option>
          </Select>
          <Select
            placeholder="Select Gender"
            style={{ width: 180 }}
            onChange={(gender) => setFilters({ ...filters, gender })}
          >
            <Option value="All">All</Option>
            <Option value="Men">Men</Option>
            <Option value="Women">Women</Option>
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
            style={{ marginBottom: '20px', borderRadius: '10px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              {classSession.icon}
            </div>
            <Title level={4}>{classSession.classType} - {classSession.classLevel}</Title>
            <Paragraph><strong>Date:</strong> {classSession.date}</Paragraph>
            <Paragraph><strong>Time:</strong> {classSession.time}</Paragraph>
            <Paragraph><strong>Capacity:</strong> {classSession.classCapacity}</Paragraph>
            <Paragraph><strong>Age Limit:</strong> {classSession.ageLimit}</Paragraph>
            <Paragraph><strong>Price:</strong> {classSession.price}</Paragraph>
            <Paragraph><strong>Gender:</strong> {classSession.gender}</Paragraph>
            <Button type="primary" block onClick={() => addToCart(classSession)}>Add to Cart</Button>
          </Card>
        )}
      />
    </div>
  );
}

export default Classes;
