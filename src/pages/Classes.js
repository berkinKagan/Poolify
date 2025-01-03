import React, { useEffect, useState } from 'react';
import { Card, Button, List, message, Typography, Select, DatePicker, Space, TimePicker } from 'antd';
import { CloudOutlined, ThunderboltOutlined, FireOutlined } from '@ant-design/icons';
import moment from 'moment';
import apiClient from '../apiClient';
import { getUserFromLocalStorage } from '../Auth';

const { Title, Paragraph } = Typography;
const { Option } = Select;

function Classes() {
  const [classesData, setClassesData] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({
    showOnlyAvailableClasses: true,
    selectedDate: null,
    selectedTime: null,
    selectedLevel: null,
    selectedGender: null,
    coachName: null,
    proficiency: null,
  });
  const [currentUser, setCurrentUser] = useState(getUserFromLocalStorage());

  // Fetch classes from the backend
  useEffect(() => {
    setCurrentUser(getUserFromLocalStorage());
    const fetchClasses = async () => {
      try {
        const payload = {
          showOnlyAvailableClasses: true,
        }
        const response = await apiClient.post('/api/classes/filter', payload);
        console.log('Classes:', response.data);
        // Transform data to fit the frontend requirements
        const transformedData = response.data.map((cls) => ({
          classID: cls.classID,
          classCapacity: cls.classCapacity,
          classLevel: cls.classLevel,
          classType: cls.classType,
          ageLimit: cls.ageLimit,
          registrationDeadline: cls.registrationDeadline,
          genderRestriction: cls.genderRestriction|| "All",
          price: `$${cls.price}`,
          date: cls.date || 'TBA', // Handle null values
          time: cls.startTime,
          courseDescription: cls.courseDescription || 'No description available',
          capacity: cls.capacity,
          pool: cls.pool || {
            poolID: 'N/A',
            length: 'N/A',
            width: 'N/A',
            depth: 'N/A',
            isWomenOnly: 'N/A',
          },
          facility: cls.facility || { facilityID: 'N/A', name: 'N/A' },
          coach: cls.coach || { coachID: 'N/A', firstName: 'N/A', lastName: 'N/A' },
          lifeguard: cls.lifeguard || { lifeguardID: 'N/A', proficiency: 'N/A' },
          icon:
            cls.classLevel === 'Beginner'
              ? <CloudOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              : cls.classLevel === 'Intermediate'
              ? <ThunderboltOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
              : <FireOutlined style={{ fontSize: '48px', color: '#f5222d' }} />,
        }));
        setClassesData(transformedData);
        setFilteredClasses(transformedData);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        message.error('Failed to load classes.');
      }
    };

    fetchClasses();
  }, []);

  

  // Handler for applying filters
  const applyFilters = async () => {
    console.log('Payload:', {
      showOnlyAvailableClasses: filters.showOnlyAvailableClasses,
      selectedDate: filters.selectedDate,
      selectedTime: filters.selectedTime,
      selectedLevel: filters.selectedLevel,
      selectedGender: filters.selectedGender,
      coachName: filters.coachName,
      proficiency: filters.proficiency,
    });
    const payload = {
      showOnlyAvailableClasses: filters.showOnlyAvailableClasses,
      selectedDate: filters.selectedDate,
      selectedTime: filters.selectedTime,
      selectedLevel: filters.selectedLevel,
      selectedGender: filters.selectedGender,
      coachName: filters.coachName,
      proficiency: filters.proficiency,
    };
    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== null && value !== undefined)
    );

    console.log('Filtered Payload:', filteredPayload);
    
    
    try {
      const response = await apiClient.post('/api/classes/filter', filteredPayload);
      console.log('Filtered Classes:', response.data);
      // Transform the filtered data
      const transformedData = response.data.map((cls) => ({
        classID: cls.classID,
        classCapacity: cls.classCapacity,
        classLevel: cls.classLevel,
        classType: cls.classType,
        ageLimit: cls.ageLimit,
        registrationDeadline: cls.registrationDeadline,
        price: `$${cls.price}`,
        genderRestriction: cls.genderRestriction || "All",
        date: cls.date || 'TBA',
        time: cls.startTime,
        courseDescription: cls.courseDescription || 'No description available',
        pool: cls.pool || {
          poolID: 'N/A',
          length: 'N/A',
          width: 'N/A',
          depth: 'N/A',
          isWomenOnly: 'N/A',
        },
        facility: cls.facility || { facilityID: 'N/A', name: 'N/A' },
        coach: cls.coach || { coachID: 'N/A', firstName: 'N/A', lastName: 'N/A' },
        lifeguard: cls.lifeguard || { lifeguardID: 'N/A', proficiency: 'N/A' },
        icon:
          cls.classLevel === 'Beginner'
            ? <CloudOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            : cls.classLevel === 'Intermediate'
            ? <ThunderboltOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
            : <FireOutlined style={{ fontSize: '48px', color: '#f5222d' }} />,
      }));
      setFilteredClasses(transformedData);
    } catch (error) {
      console.error('Failed to apply filters:', error);
      message.error('Failed to apply filters.');
    }
  };

  // Handler for adding a class to the cart
  const addToCart = async (classSession) => {
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

    console.log('Adding to cart:', classSession);
    console.log(currentUser.userID);
    try {
      // Make API call to add the class to the user's cart
      await apiClient.post(`/api/cart/${currentUser.userID}`, {
        classID: classSession.classID,
      });

      // Update cart locally
      setCart([...cart, classSession.classID]);
      message.success('Class added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      message.error('Failed to add class to cart.');
    }
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
            onChange={(date) => setFilters({ ...filters, selectedDate: date ? date.format('YYYY-MM-DD') : null })}
          />
            <TimePicker
              placeholder="Select Time"
              style={{ width: 180 }}
              format="HH:mm"
              onChange={(time, timeString) => setFilters({ ...filters, selectedTime: timeString })}
            />
          <Select
            placeholder="Select Level"
            style={{ width: 180 }}
            onChange={(level) => setFilters({ ...filters, selectedLevel: level })}
          >
            <Option value="Beginner">Beginner</Option>
            <Option value="Intermediate">Intermediate</Option>
            <Option value="Advanced">Advanced</Option>
          </Select>
          <Select
            placeholder="Select Gender"
            style={{ width: 180 }}
            onChange={(gender) => setFilters({ ...filters, selectedGender: gender })}
          >
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="other">Other</Option>
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
            <Paragraph><strong>Capacity:</strong> {classSession.capacity}</Paragraph>
            <Paragraph><strong>Age Limit:</strong> {classSession.ageLimit}</Paragraph>
            <Paragraph><strong>Gender Restriction:</strong> {classSession.genderRestriction}</Paragraph>
            <Paragraph><strong>Price:</strong> {classSession.price}</Paragraph>
            <Paragraph><strong>Course Description:</strong> {classSession.courseDescription}</Paragraph>
            <Button type="primary" block onClick={() => addToCart(classSession)}>Add to Cart</Button>
          </Card>
        )}
      />
    </div>
  );
}

export default Classes;
