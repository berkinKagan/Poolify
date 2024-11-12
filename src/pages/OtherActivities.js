import React, { useState } from 'react';
import { Table, Button, message, Modal, Typography, Select, Progress } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Title, Paragraph } = Typography;
const { Option } = Select;

function OtherActivities() {
  // Sample sauna data
  const saunaData = [
    {
      key: '1',
      name: 'Relaxing Sauna',
      capacity: 10,
      availableSlots: 5,
      duration: '30 mins',
      price: '70C',
      occupancyRate: 50,
      timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM'],
    },
    {
      key: '2',
      name: 'Hot Stone Sauna',
      capacity: 8,
      availableSlots: 2,
      duration: '45 mins',
      price: '60C',
      occupancyRate: 75,
      timeSlots: ['2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
    },
    {
      key: '3',
      name: 'Aromatic Sauna',
      capacity: 12,
      availableSlots: 7,
      duration: '60 mins',
      price: '50C',
      occupancyRate: 40,
      timeSlots: ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'],
    },
  ];

  const [selectedSauna, setSelectedSauna] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Handler for booking a sauna
  const handleBook = (sauna) => {
    if (sauna.availableSlots === 0) {
      message.error('No slots available for this sauna.');
      return;
    }

    setSelectedSauna(sauna);
    setIsModalVisible(true);
  };

  // Handler for time slot selection
  const handleTimeSlotChange = (value) => {
    setSelectedTimeSlot(value);
  };

  // Handler for closing the modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedSauna(null);
    setSelectedTimeSlot('');
  };

  // Handler for confirming the booking
  const handleConfirmBooking = () => {
    if (!selectedTimeSlot) {
      message.warning('Please select a time slot.');
      return;
    }

    message.success(`Booking confirmed for ${selectedSauna.name} at ${selectedTimeSlot}!`);
    setIsModalVisible(false);
    setSelectedSauna(null);
    setSelectedTimeSlot('');
  };

  // Define columns for the Ant Design table
  const columns = [
    {
      title: 'Sauna Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Temperature',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Occupancy Rate',
      key: 'occupancyRate',
      render: (_, sauna) => (
        <Progress
          percent={sauna.occupancyRate}
          status={sauna.occupancyRate > 70 ? 'exception' : 'normal'}
          strokeColor={sauna.occupancyRate > 70 ? '#f5222d' : '#52c41a'}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, sauna) => (
        <Button type="primary" onClick={() => handleBook(sauna)} disabled={sauna.availableSlots === 0}>
          Select
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Available Saunas</Title>
      <Table columns={columns} dataSource={saunaData} pagination={{ pageSize: 5 }} />

      {/* Modal for Selected Sauna */}
      <Modal
        title="Sauna Details"
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleConfirmBooking}
        okText="Confirm Booking"
        cancelText="Cancel"
      >
        {selectedSauna && (
          <>
            <Title level={4}>{selectedSauna.name}</Title>
            <Paragraph><strong>Duration:</strong> {selectedSauna.duration}</Paragraph>
            <Paragraph><strong>Price:</strong> {selectedSauna.price}</Paragraph>

            {/* Time Slot Selection */}
            <Select
              placeholder="Select a time slot"
              style={{ width: '100%', marginBottom: '20px' }}
              onChange={handleTimeSlotChange}
            >
              {selectedSauna.timeSlots.map((slot) => (
                <Option key={slot} value={slot}>
                  {slot}
                </Option>
              ))}
            </Select>

            {/* Occupancy Rate Graph */}
            <Title level={5}>Occupancy Rate</Title>
            <Progress
              percent={selectedSauna.occupancyRate}
              status={selectedSauna.occupancyRate > 70 ? 'exception' : 'normal'}
              strokeColor={selectedSauna.occupancyRate > 70 ? '#f5222d' : '#52c41a'}
            />
          </>
        )}
      </Modal>
    </div>
  );
}

export default OtherActivities;
