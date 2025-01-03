import React, { useEffect, useState } from 'react';
import { Table, Button, message, Modal, Typography, Select, Progress, DatePicker } from 'antd';
import apiClient from '../apiClient';
import { getUserFromLocalStorage } from '../Auth';
import moment from 'moment';

const { Title, Paragraph } = Typography;
const { Option } = Select;

function OtherActivities() {
  const [saunaData, setSaunaData] = useState([]);
  const [selectedSauna, setSelectedSauna] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(getUserFromLocalStorage());
  const [loading, setLoading] = useState(false);
  const [modalOccupancyRate, setModalOccupancyRate] = useState(null);
  const [userAttendance, setUserAttendance] = useState([]);
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);


  useEffect(() => {
    setCurrentUser(getUserFromLocalStorage());
    fetchSaunaData();
  }, []);

  const fetchOccupancyRateForDate = async (saunaID, facilityID, timeSlot) => {
    try {
      const response = await apiClient.get(`/api/sauna/get-occupancy`, {
        params: { saunaID, facilityID, timeSlot },
      });
  
      if (response.status === 200) {
        setModalOccupancyRate(((response.data.current_users / response.data.max_users) * 100).toFixed(0));
      } else {
        setModalOccupancyRate(null);
        message.error(response.data.message || 'Failed to fetch occupancy rate.');
      }
    } catch (error) {
      console.error('Error fetching occupancy rate:', error);
      setModalOccupancyRate(null);
      message.error('Failed to fetch occupancy rate.');
    }
  };

  // Fetch sauna data from the backend
  const fetchSaunaData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/sauna/get-available-saunas');
      if (response.status === 200 && response.data.data) {
        const transformedData = response.data.data.map((sauna) => ({
          key: sauna.saunaID,
          saunaID: sauna.saunaID,
          facilityID: sauna.facilityID,
          maxUsers: sauna.max_users,
          temperature: sauna.temperature,
          currentUsers: sauna.current_users,
          occupancyRate: ((sauna.current_users / sauna.max_users) * 100).toFixed(0),
        }));
        setSaunaData(transformedData);
      } else {
        message.error('No saunas available.');
      }
    } catch (error) {
      console.error('Error fetching sauna data:', error);
      message.error('Failed to fetch saunas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAttendance = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/sauna/get-user-attendance`, {
        params: { userID: currentUser.userID },
      });
      if (response.status === 200 && response.data.data) {
        setUserAttendance(response.data.data);
        setAttendanceModalVisible(true);
      } else {
        message.error('No attendance data available.');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      message.error('Failed to fetch attendance data.');
    } finally {
      setLoading(false);
    }
  };
  

  // Handler for booking a sauna
  const handleBook = (sauna) => {
    if (sauna.currentUsers >= sauna.maxUsers) {
      message.error('No slots available for this sauna.');
      return;
    }
    setSelectedSauna(sauna);
    setIsModalVisible(true);
  };

  // Handler for closing the modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedSauna(null);
    setSelectedTimeSlot('');
  };

  // Handler for confirming the booking
  const handleConfirmBooking = async () => {
    if (!selectedTimeSlot) {
      message.warning('Please select a time slot.');
      return;
    }


    try {
      const payload = {
        userID: currentUser.userID,
        saunaID: selectedSauna.saunaID,
        facilityID: selectedSauna.facilityID,
        timeSlot: selectedTimeSlot,
      };
      console.log('Booking payload:', payload);
      const response = await apiClient.post('/api/sauna/attend-sauna', payload);

      if (response.status === 200) {
        message.success(`Booking confirmed for Sauna ID ${selectedSauna.saunaID} at ${selectedTimeSlot}!`);
        fetchSaunaData(); // Refresh sauna data after booking
        handleCancel();
      } else {
        message.error(response.data.message || 'Failed to confirm booking.');
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      message.error('Failed to confirm booking.');
    }
  };

  const attendanceColumns = [
    {
      title: 'Sauna ID',
      dataIndex: 'saunaID',
      key: 'saunaID',
    },
    {
      title: 'Facility ID',
      dataIndex: 'facilityID',
      key: 'facilityID',
    },
    {
      title: 'Time Slot',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
    },
  ];
  

  // Define columns for the Ant Design table
  const columns = [
    {
      title: 'Sauna ID',
      dataIndex: 'saunaID',
      key: 'saunaID',
    },
    {
      title: 'Facility ID',
      dataIndex: 'facilityID',
      key: 'facilityID',
    },
    {
      title: 'Max Users',
      dataIndex: 'maxUsers',
      key: 'maxUsers',
    },
    {
      title: 'Current Users',
      dataIndex: 'currentUsers',
      key: 'currentUsers',
    },
    {
      title: 'Temperature (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, sauna) => (
        <Button
          type="primary"
          onClick={() => handleBook(sauna)}
          disabled={sauna.currentUsers >= sauna.maxUsers}
        >
          Select
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Available Saunas</Title>
      <Button type="default" onClick={fetchUserAttendance} style={{ marginBottom: '20px' }}>
        Show My Attendance
      </Button>
      <Table
        columns={columns}
        dataSource={saunaData}
        loading={loading}
        pagination={{ pageSize: 5 }}
        rowKey="key"
      />

      {/* Modal for Selected Sauna */}
      <Modal
  title="Sauna Details"
  visible={isModalVisible}
  onCancel={handleCancel}
  footer={null} // Remove default footer to include custom form submission
>
  {selectedSauna && (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // Prevent default form submission
        handleConfirmBooking(); // Call the confirm booking handler
      }}
    >
      <Title level={4}>Sauna ID: {selectedSauna.saunaID}</Title>
      <Paragraph>
        <strong>Facility ID:</strong> {selectedSauna.facilityID}
      </Paragraph>
      <Paragraph>
        <strong>Max Users:</strong> {selectedSauna.maxUsers}
      </Paragraph>
      <Paragraph>
        <strong>Current Users:</strong> {selectedSauna.currentUsers}
      </Paragraph>
      <Paragraph>
        <strong>Temperature:</strong> {selectedSauna.temperature}°C
      </Paragraph>

      {/* Date Picker for Time Slot Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="timeSlot" style={{ display: 'block', marginBottom: '5px' }}>
          Select a Time Slot:
        </label>
        <DatePicker
          id="timeSlot"
          placeholder="Select a time slot"
          style={{ width: '100%' }}
          onChange={(date, dateString) => {
            if (dateString) {
              setSelectedTimeSlot(dateString);
              fetchOccupancyRateForDate(selectedSauna.saunaID, selectedSauna.facilityID, dateString);
            } else {
              setSelectedTimeSlot('');
              setModalOccupancyRate(null);
            }
          }}
        />;
      </div>

      {/* Occupancy Rate */}
      <Title level={5}>Occupancy Rate for Selected Date</Title>
      <Progress
        percent={modalOccupancyRate || 0}
        status={modalOccupancyRate > 70 ? 'exception' : 'normal'}
        strokeColor={modalOccupancyRate > 70 ? '#f5222d' : '#52c41a'}
      />;

      {/* Form Actions */}
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <Button
          type="default"
          style={{ marginRight: '10px' }}
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button type="primary" htmlType="submit">
          Confirm Booking
        </Button>
      </div>
    </form>
  )}
</Modal>

<Modal
  title="My Attended Saunas"
  visible={attendanceModalVisible}
  footer={null}
  onCancel={() => setAttendanceModalVisible(false)}
>
  <Table
    columns={attendanceColumns}
    dataSource={userAttendance}
    rowKey={(record) => `${record.saunaID}-${record.facilityID}-${record.timeSlot}`}
    pagination={false}
  />
</Modal>


    </div>
  );
}

export default OtherActivities;
