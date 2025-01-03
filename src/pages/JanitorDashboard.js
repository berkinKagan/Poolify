import React, { useEffect, useState } from "react";
import { Table, Spin, Alert } from "antd";
import apiClient from "../apiClient";
import { getUserFromLocalStorage } from "../Auth";

function JanitorDashboard() {
  const [cleaningAssignments, setCleaningAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(getUserFromLocalStorage());

  useEffect(() => {
    // Fetch assigned cleaning periods for the janitor
    const user = getUserFromLocalStorage();
    setCurrentUser(user);

    const fetchCleaningAssignments = async () => {
      try {
        const response = await apiClient.get("/api/spa/assign-cleaning");
        const allAssignments = response.data;
        console.log("All Assignments:", allAssignments);
        // Filter assignments for the current janitor
        const userAssignments = allAssignments.filter(
          (assignment) => assignment.userID === user.userID
        );

        setCleaningAssignments(userAssignments);
        console.log("All Assignments:", allAssignments);
        console.log("User Assignments:", userAssignments);
        console.log("Current User:", user);
      } catch (err) {
        setError("Failed to fetch cleaning assignments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCleaningAssignments();
  }, []);

  const columns = [
    {
      title: "Cleaning ID",
      dataIndex: "cleaningID",
      key: "cleaningID",
    },
    {
      title: "Cleaning Supplies",
      dataIndex: "cleaningSupplies",
      key: "cleaningSupplies",
    },
    {
      title: "Session Date",
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
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <h1>Janitor Dashboard</h1>
      <Table
        dataSource={cleaningAssignments}
        columns={columns}
        rowKey="cleaningID" // Use cleaningID as the unique key for rows
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default JanitorDashboard;
