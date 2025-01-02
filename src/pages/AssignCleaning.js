import React, { useEffect, useState } from "react";
import { Table, Form, Select, Button, notification, Modal, Input, DatePicker, TimePicker } from "antd";
import apiClient from "../apiClient";
import moment from "moment";

const { Option } = Select;

const AssignCleaning = () => {
  const [janitors, setJanitors] = useState([]);
  const [cleaningPeriods, setCleaningPeriods] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Fetch janitors, cleaning periods, and assignments
    const fetchData = async () => {
      try {
        const janitorsResponse = await apiClient.get("/api/spa/janitors");
        setJanitors(janitorsResponse.data);

        const cleaningResponse = await apiClient.get("/api/spa/cleaning-periods-with-sessions");
        setCleaningPeriods(cleaningResponse.data);

        const assignmentsResponse = await apiClient.get("/api/spa/assign-cleaning");
        setAssignments(assignmentsResponse.data);
      } catch (error) {
        notification.error({ message: "Failed to fetch data" });
      }
    };
    fetchData();
  }, []);

  console.log("AssignCleaning.js: janitors", janitors);

  const handleAssign = async (values) => {
    try {
      await apiClient.post("/api/spa/assign-cleaning", values);
      notification.success({ message: "Janitor assigned successfully!" });
      form.resetFields();

      // Refresh assignments
      const assignmentsResponse = await apiClient.get("/api/spa/assign-cleaning");
      setAssignments(assignmentsResponse.data);
    } catch (error) {
      notification.error({ message: "Failed to assign janitor" });
    }
  };

  const handleCreateSession = async (values) => {
    try {
      const payload = {
        date: values.date.format("YYYY-MM-DD"),
        startTime: values.startTime.format("HH:mm:ss"),
        endTime: values.endTime.format("HH:mm:ss"),
        cleaningSupplies: values.cleaningSupplies,
      };

      console.log("Creating session and cleaning period with values:", payload);

      await apiClient.post("/api/spa/sessions-with-cleaning", payload);
      notification.success({ message: "Session and Cleaning Period created successfully!" });
      setIsModalOpen(false);

      // Refresh cleaning periods
      const cleaningResponse = await apiClient.get("/api/spa/cleaning-periods-with-sessions");
      setCleaningPeriods(cleaningResponse.data);
    } catch (error) {
      notification.error({ message: "Failed to create session and cleaning period" });
    }
  };

  return (
    <div>
      <h1>Assign Cleaning</h1>
      <Button type="primary" onClick={() => setIsModalOpen(true)} style={{ marginBottom: 16 }}>
        Create Session & Cleaning Period
      </Button>

      <Form form={form} layout="inline" onFinish={handleAssign}>
        <Form.Item name="userID" label="Janitor" rules={[{ required: true }]}>
          <Select placeholder="Select a janitor" style={{ width: 200 }}>
            {janitors.map((janitor) => (
              <Option key={janitor.userID} value={janitor.userID}>
                {janitor.forename} {janitor.surname}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="cleaningID"
          label="Cleaning Period"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select a cleaning period" style={{ width: 300 }}>
            {cleaningPeriods.map((period) => (
              <Option key={period.cleaningID} value={period.cleaningID}>
                {period.cleaningSupplies} ({period.date}, {period.startTime} - {period.endTime})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Assign
          </Button>
        </Form.Item>
      </Form>

      <Table
          dataSource={assignments}
          columns={[
            {
              title: "Janitor",
              dataIndex: "forename", // Match the key in the fetched data
              key: "forename",
            },
            {
              title: "Cleaning Period",
              dataIndex: "cleaningPeriod",
              key: "cleaningPeriod",
              render: (_, record) =>
                `${record.cleaningSupplies || "No Supplies"} (${record.date || "No Date"}, ${record.startTime || "No Start Time"} - ${record.endTime || "No End Time"})`,
            },
          ]}
          rowKey="userID"
        />


      <Modal
        title="Create Session and Cleaning Period"
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form onFinish={handleCreateSession} layout="vertical">
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="startTime" label="Start Time" rules={[{ required: true }]}>
            <TimePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="endTime" label="End Time" rules={[{ required: true }]}>
            <TimePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="cleaningSupplies"
            label="Cleaning Supplies"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
            Create
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default AssignCleaning;
