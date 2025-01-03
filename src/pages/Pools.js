import React, { useEffect, useState } from "react";
import { Table, Spin, Alert, Modal, Button, Form, Input, DatePicker, TimePicker, Select, message } from "antd";
import apiClient from "../apiClient";
import { getUserFromLocalStorage } from "../Auth";

function Pools() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLane, setSelectedLane] = useState(null);
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState(getUserFromLocalStorage());
  const [laneAvailability, setLaneAvailability] = useState([]);
  const [reservationsModalVisible, setReservationsModalVisible] = useState(false);
  const [userReservations, setUserReservations] = useState([]);


  useEffect(() => {
    setCurrentUser(getUserFromLocalStorage());
    const fetchPools = async () => {
      try {
        const [poolsResponse, availabilityResponse] = await Promise.all([
          apiClient.get("/api/pools/lanes"),
          apiClient.get("/api/pools/occupies-lane-details"),
        ]);
        setPools(poolsResponse.data);
        setLaneAvailability(availabilityResponse.data);
      } catch (err) {
        setError("Failed to fetch pool data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPools();
  }, []);

  const fetchUserReservations = async () => {
    try {
      const response = await apiClient.get(`/api/spa/user-reservations?userID=${currentUser.userID}`);
      setUserReservations(response.data);
      setReservationsModalVisible(true);
    } catch (err) {
      message.error("Failed to fetch your reservations. Please try again later.");
    }
  };
  
  const showModal = (lane) => {
    setSelectedLane(lane);
    setModalVisible(true);
  };

  const handleCreateSession = async (values) => {
    const selectedDate = values.date.format("YYYY-MM-DD");
    const selectedStartTime = values.startTime.format("HH:mm:ss");
    const selectedEndTime = values.endTime.format("HH:mm:ss");

    const timeToSeconds = (time) => {
      const [hours, minutes, seconds] = time.split(":").map((unit) => parseInt(unit, 10) || 0);
      return hours * 3600 + minutes * 60 + seconds;
    };
    

    // Check for lane availability conflicts
    const conflicts = laneAvailability.filter((reservation) => {

      const selectedStartTimeSec = timeToSeconds(selectedStartTime);
      const selectedEndTimeSec = timeToSeconds(selectedEndTime);
      const reservationStartTimeSec = timeToSeconds(reservation.startTime);
      const reservationEndTimeSec = timeToSeconds(reservation.endTime);

      if(reservation.sessionDate === selectedDate && reservation.laneID === selectedLane.laneID) {
        console.log(selectedStartTimeSec, selectedEndTimeSec, reservationStartTimeSec, reservationEndTimeSec);
      }
      return (
        reservation.laneID === selectedLane.laneID &&
        reservation.sessionDate === selectedDate &&
        (
          selectedStartTimeSec < reservationEndTimeSec &&
          selectedEndTimeSec > reservationStartTimeSec // Overlapping condition
        )
      );
    });
    
    if (conflicts.length > 0) {
      message.error("This lane is already reserved for the selected date and time.");
      return;
    }

    message.success("Lane is available for reservation.");
    

    try {
      const payload = {
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        sessionLevel: values.sessionLevel,
        swimmerID: currentUser.userID,
        userID: currentUser.userID,
      };


      const response = await apiClient.post("/api/spa/sessions-with-swimming", payload);

      const occupiesLanePayload = {
        sessionID: response.data.sessionID,
        laneID: selectedLane.laneID,
        poolID: selectedLane.poolID,
      };

      await apiClient.post("/api/spa/occupies-lane", occupiesLanePayload);

      Modal.success({
        title: "Reservation Successful",
        content: `Lane ${selectedLane.laneID} has been reserved successfully.`,
      });

      setModalVisible(false);
      form.resetFields();
    } catch (err) {
      Modal.error({
        title: "Reservation Failed",
        content: "Unable to complete the reservation. Please try again.",
      });
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <h1>Pools</h1>
      <Button type="default" onClick={fetchUserReservations} style={{ marginBottom: 16 }}>
            My Reservations
      </Button>
      {pools.reduce((uniquePools, pool) => {
        const existingPool = uniquePools.find((p) => p.poolID === pool.poolID);
        if (!existingPool) {
          uniquePools.push(pool);
        }
        return uniquePools;
      }, []).map((pool) => (
        <div key={pool.poolID}>
          <h2>Pool {pool.poolID}</h2>
          <Table
            dataSource={pools.filter((p) => p.poolID === pool.poolID)}
            columns={[
              {
                title: "Lane ID",
                dataIndex: "laneID",
                key: "laneID",
              },
              {
                title: "Capacity",
                dataIndex: "lane_capacity",
                key: "lane_capacity",
              },
              {
                title: "Actions",
                key: "actions",
                render: (_, record) => (
                  <Button
                    type="primary"
                    onClick={() => showModal(record)}
                  >
                    Reserve
                  </Button>
                ),
              },
            ]}
            rowKey="laneID"
            pagination={false}
          />
        </div>
      ))}

      {/* Modal for session and swimming session creation */}
      <Modal
        title="Create Session and Swimming Session"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSession}>
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select a date!" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Start Time"
            name="startTime"
            rules={[{ required: true, message: "Please select a start time!" }]}
          >
            <TimePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="End Time"
            name="endTime"
            rules={[{ required: true, message: "Please select an end time!" }]}
          >
            <TimePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Session Level"
            name="sessionLevel"
            rules={[{ required: true, message: "Please select the session level!" }]}
          >
            <Select placeholder="Select session level">
              <Select.Option value="Beginner">Beginner</Select.Option>
              <Select.Option value="Intermediate">Intermediate</Select.Option>
              <Select.Option value="Advanced">Advanced</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Session
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="My Reservations"
        visible={reservationsModalVisible}
        onCancel={() => setReservationsModalVisible(false)}
        footer={null}
      >
        <Table
          dataSource={userReservations}
          columns={[
            {
              title: "Session Date",
              dataIndex: "sessionDate",
              key: "sessionDate",
            },
            {
              title: "Start Time",
              dataIndex: "startTime",
              key: "startTime",
            },
            {
              title: "End Time",
              dataIndex: "endTime",
              key: "endTime",
            },
            {
              title: "Lane ID",
              dataIndex: "laneID",
              key: "laneID",
            },
            {
              title: "Pool ID",
              dataIndex: "poolID",
              key: "poolID",
            },
          ]}
          rowKey="sessionID"
          pagination={false}
        />
      </Modal>

    </div>
  );
}

export default Pools;
