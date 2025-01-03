import React, { useEffect, useState } from "react";
import { Table, Spin, Alert } from "antd";
import apiClient from "../apiClient";
import { getUserFromLocalStorage } from "../Auth";
import Title from "antd/es/skeleton/Title";

function LifeGuardDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(getUserFromLocalStorage());

  useEffect(() => {
    // Fetch the assigned sessions data
    const user = getUserFromLocalStorage();
    setCurrentUser(user);
    const fetchSessions = async () => {
      try {
        const response = await apiClient.get("/api/spa/assigned-sessions-with-lifeguard-id");
        const allSessions = response.data;

        // Filter sessions for the current user
        const userSessions = allSessions.filter(
          (session) => session.lifeguardID === user.userID
        );

        setSessions(userSessions);

        console.log("All Sessions:", allSessions);
        console.log("User Sessions:", userSessions);
        console.log("Current User:", user);
      } catch (err) {
        setError("Failed to fetch sessions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const columns = [
    {
      title: "Session ID",
      dataIndex: "sessionID",
      key: "sessionID",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
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
      title: "Lifeguard Forename",
      dataIndex: "lifeguardForename",
      key: "lifeguardForename",
    },
    {
      title: "Lifeguard Surname",
      dataIndex: "lifeguardSurname",
      key: "lifeguardSurname",
    },
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Table
        dataSource={sessions}
        columns={columns}
        rowKey="sessionID" // Use sessionID as the unique key for rows
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default LifeGuardDashboard;
