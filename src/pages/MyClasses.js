import React, { useState, useEffect } from 'react';
import { Card, Button, List, message, Typography, Select, Space, Modal, Input, Rate, Row, Col } from 'antd';
import { CloudOutlined, ThunderboltOutlined, FireOutlined } from '@ant-design/icons';
import moment from 'moment';
import apiClient from '../apiClient';
import { getUserFromLocalStorage } from '../Auth';

const { Title, Paragraph } = Typography;
const { Option } = Select;

function MyClasses() {
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [attendedClassesInfo, setAttendedClassesInfo] = useState([]);
  const [filters, setFilters] = useState({ Level: null });
  const [currentUser, setCurrentUser] = useState(getUserFromLocalStorage());
  const [coachRatings, setCoachRatings] = useState([]);
  const [attendace, setAttendance] = useState([]);
  const [filteredAttendace, setFilteredAttendance] = useState([]);
  

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCoachID, setSelectedCoachID] = useState(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [sessID, setSessID] = useState(0);

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        const response = await apiClient.get(`/api/rating/attended-coached-sessions/${currentUser.userID}`);
        setAttendedClassesInfo(response.data.attended_session_info);
        setFilteredClasses(response.data.attended_session_info);

        const ratingRes = await apiClient.get('/api/rating/rate-coach-analysis');
        setCoachRatings(ratingRes.data);

        const attendanceRes = await apiClient.get(`/api/rating/check-swimmer-attendance/${currentUser.userID}`);
        setAttendance(attendanceRes.data);
        setFilteredAttendance(attendanceRes.data)

      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      }
    };
    fetchMyClasses();
  }, [currentUser]);

  const applyFilters = () => {
    let filtered = attendedClassesInfo;
    let filtered2 = attendace

    if (filters.Level) {
      filtered = filtered.filter((cls) => cls.Level === filters.Level);
    }

    if (filters.Level) {
        filtered2 = filtered2.filter((cls) => cls.Level === filters.Level);
    }

    setFilteredClasses(filtered);
    setFilteredAttendance(filtered2);
  };

  const getAverageRating = (coachID) => {
    const coachRating = coachRatings.find((rating) => rating.userID === coachID);
    return coachRating ? coachRating.average_rating : 'N/A';
  };

  const showRateModal = (coachID, sessionID) => {
    setSelectedCoachID(coachID);
    setSessID(sessionID);
    setIsModalVisible(true);
  };

  const handleRateCoach = async () => {
    console.log(selectedCoachID)
    console.log(comment)
    console.log(rating)
    console.log(sessID)
    try {
      await apiClient.post('/api/rating/rate-class-session', {
        coachID: selectedCoachID,
        comment: comment,
        rating: rating,
        sessionID: sessID,
      });
      message.success('Your rating has been submitted successfully!');
      setIsModalVisible(false);
      setComment('');
      setRating(0);
    } catch (error) {
      message.error('You have already rated');
      console.error('Rating error:', error);
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
          <Select
            placeholder="Select Level"
            style={{ width: 180 }}
            onChange={(Level) => setFilters({ ...filters, Level })}
          >
            <Option value="Beginner">Beginner</Option>
            <Option value="Intermediate">Intermediate</Option>
            <Option value="Advanced">Advanced</Option>
          </Select>
          <Button type="primary" onClick={applyFilters}>Apply Filters</Button>
        </Space>
      </div>

      {/* Layout Split */}
      <Row gutter={[16, 16]}>
        {/* Left Section - Classes */}
        <Col span={12}>
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
                <Title level={4}>{classSession.Type}</Title>
                <Paragraph><strong>Coach Experience:</strong> {classSession.CoachExperience}</Paragraph>
                <Paragraph><strong>Coach Proficiency:</strong> {classSession.CoachProficiency}</Paragraph>
                <Paragraph><strong>Session Level:</strong> {classSession.Level}</Paragraph>
                <Paragraph><strong>Average rating:</strong> {getAverageRating(classSession.CoachID)}</Paragraph>
                <Button type="primary" block onClick={() => showRateModal(classSession.CoachID, classSession.ID)}>Rate</Button>
              </Card>
            )}
          />
        </Col>

        {/* Right Section - Attendance */}
        <Col span={12}>
          <Card title="Attendance Information" style={{ borderRadius: '10px' }}>
            <List
              itemLayout="vertical"
              size="large"
              dataSource={filteredAttendace}
              renderItem={(attendance) => (
                <Card
                  key={attendance.sessionID}
                  hoverable
                  style={{ marginBottom: '20px', borderRadius: '10px' }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <CloudOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <Title level={4}>{attendance.Type}</Title>
                  <Paragraph><strong>Coach Experience:</strong> {attendance.CoachExperience}</Paragraph>
                    <Paragraph><strong>Coach Proficiency:</strong> {attendance.CoachProficiency}</Paragraph>
                    <Paragraph><strong>Session Level:</strong> {attendance.Level}</Paragraph>
                </Card>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal for Rating */}
      <Modal
        title="Rate Coach"
        visible={isModalVisible}
        onOk={handleRateCoach}
        onCancel={() => setIsModalVisible(false)}
        okText="Submit"
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Input.TextArea
            placeholder="Write your comment here"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <Rate
            value={rating}
            onChange={(value) => setRating(value)}
          />
        </Space>
      </Modal>
    </div>
  );
}

export default MyClasses;
