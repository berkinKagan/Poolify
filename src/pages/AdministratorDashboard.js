import React, { useEffect, useState } from 'react';
import { Tabs, Card, Form, Input, Button, Select, message, Table } from 'antd';
import apiClient from '../apiClient';
import { max } from 'moment';
import AssignLifeguard from './AssignLifeguard';
import AssignCleaning from './AssignCleaning';

const { TabPane } = Tabs;
const { Option } = Select;

function AdministratorDashboard() {
  const [form] = Form.useForm();
  const [entityType, setEntityType] = useState(''); // Track selected entity type
  const [pools, setPools] = useState([]);
  const [saunas, setSaunas] = useState([]);

  useEffect(() => {
    const fetchStatistics = async () => {
        try {
            const poolResponse = await apiClient.get('/api/spa/pools');
            const saunaResponse = await apiClient.get('/api/spa/saunas');
            setPools(poolResponse.data);
            setSaunas(saunaResponse.data);
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
        }
    };

    fetchStatistics();
}, []);

  const handleCreate = async (type) => {
    try { 
      const values = await form.validateFields();
      const processedValues = {
        ...values,
        temperature: values.temperature ? parseFloat(values.temperature) : undefined,
        pH_level: values.pH_level ? parseFloat(values.pH_level) : undefined,
        length: values.length ? parseFloat(values.length) : undefined,
        width: values.width ? parseFloat(values.width) : undefined,
        depth: values.depth ? parseFloat(values.depth) : undefined,
        num_lanes: values.num_lanes ? parseInt(values.num_lanes, 10) : undefined,
        max_users: values.max_users ? parseInt(values.max_users, 10) : undefined,
        capacity: values.capacity ? parseInt(values.capacity, 10) : undefined,
      };
  
      console.log(`Creating ${type} with values:`, processedValues);
  
      // Map type to endpoint
      let endpoint;
      if (type === 'pool') {
        endpoint = '/api/spa/pools';
      } else if (type === 'sauna') {
        endpoint = '/api/spa/saunas';
      } else if (type === 'lane') {
        endpoint = '/api/spa/lanes';
      } else {
        throw new Error('Invalid type selected');
      }
  
      // Send the data to the backend
      const response = await apiClient.post(endpoint, processedValues);
      message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`);
      form.resetFields();
      setEntityType(''); // Reset entity type
    } catch (error) {
      console.error(error);
      message.error(`Failed to create ${type}.`);
    }
  };
  

  const onTypeChange = (value) => {
    setEntityType(value);
    form.resetFields(); // Reset other fields when entity type changes
    form.setFieldValue('type', value); // Preserve the selected type
  };

  const renderCreateForm = () => (
    <Form form={form} layout="vertical">
      <Form.Item
        label="Entity Type"
        name="type"
        rules={[{ required: true, message: 'Please select an entity type!' }]}
      >
        <Select placeholder="Select an entity to create" onChange={onTypeChange}>
          <Option value="pool">Pool</Option>
          <Option value="sauna">Sauna</Option>
        </Select>
      </Form.Item>

      {/* Dynamic Fields for Entity Creation */}
      {entityType === 'pool' && (
      <>
        <Form.Item
          label="Temperature"
          name="temperature"
          rules={[{ required: true, message: 'Please enter the pool temperature!' }]}
        >
          <Input type="number" step="0.1" />
        </Form.Item>
        <Form.Item
          label="pH Level"
          name="pH_level"
          rules={[{ required: true, message: 'Please enter the pool pH level!' }]}
        >
          <Input type="number" step="0.1" />
        </Form.Item>
        <Form.Item
          label="Opening Time"
          name="opening_time"
          rules={[{ required: true, message: 'Please enter the opening time!' }]}
        >
          <Input type="time" />
        </Form.Item>
        <Form.Item
          label="Closing Time"
          name="closing_time"
          rules={[{ required: true, message: 'Please enter the closing time!' }]}
        >
          <Input type="time" />
        </Form.Item>
        <Form.Item
          label="Length"
          name="length"
          rules={[{ required: true, message: 'Please enter the pool length!' }]}
        >
          <Input type="number" step="0.1" />
        </Form.Item>
        <Form.Item
          label="Width"
          name="width"
          rules={[{ required: true, message: 'Please enter the pool width!' }]}
        >
          <Input type="number" step="0.1" />
        </Form.Item>
        <Form.Item
          label="Depth"
          name="depth"
          rules={[{ required: true, message: 'Please enter the pool depth!' }]}
        >
          <Input type="number" step="0.1" />
        </Form.Item>
        <Form.Item
          label="Is Women Only?"
          name="is_women_only"
          rules={[{ required: true, message: 'Please specify if the pool is women-only!' }]}
        >
          <Select>
            <Option value={true}>Yes</Option>
            <Option value={false}>No</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Number of Lanes"
          name="num_lanes"
          rules={[{ required: true, message: 'Please enter the number of lanes!' }]}
        >
          <Input type="number" min={1} />
        </Form.Item>
      </>
    )}


      {entityType === 'sauna' && (
        <>
          <Form.Item
            label="Max Users"
            name="max_users"
            rules={[{ required: true, message: 'Please enter the maximum number of users!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Temperature"
            name="temperature"
            rules={[{ required: true, message: 'Please enter the sauna temperature!' }]}
          >
            <Input type="number" step="0.1" />
          </Form.Item>
        </>
      )}

      <Form.Item>
        <Button
          type="primary"
          onClick={() => handleCreate(entityType)}
          disabled={!entityType}
        >
          Create
        </Button>
      </Form.Item>
    </Form>
  );

  const renderStatistics = () => (
    <>
      <h2>Pools</h2>
      <Table
        dataSource={pools}
        columns={[
          { title: 'Pool ID', dataIndex: 'poolID', key: 'poolID' },
          { title: 'Temperature', dataIndex: 'temperature', key: 'temperature' },
          { title: 'pH Level', dataIndex: 'pH_level', key: 'pH_level' },
          { title: 'Length', dataIndex: 'length', key: 'length' },
          { title: 'Width', dataIndex: 'width', key: 'width' },
          { title: 'Depth', dataIndex: 'depth', key: 'depth' },
          { title: 'Is Women Only', dataIndex: 'is_women_only', key: 'is_women_only' },
        ]}
        rowKey="poolID"
      />
      <h2>Saunas</h2>
      <Table
        dataSource={saunas}
        columns={[
          { title: 'Sauna ID', dataIndex: 'saunaID', key: 'saunaID' },
          { title: 'Max Users', dataIndex: 'max_users', key: 'max_users' },
          { title: 'Temperature', dataIndex: 'temperature', key: 'temperature' },
        ]}
        rowKey="saunaID"
      />
    </>
  );

  

  return (
    <Card>
      <h1>Administrator Dashboard</h1>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Utilities" key="1">
            {renderStatistics()}
        </TabPane>
        <TabPane tab="Create" key="2">
          {renderCreateForm()}
        </TabPane>
        <TabPane tab="Assign" key="3">
          <AssignLifeguard />
        </TabPane>
        <TabPane tab="Cleaning" key="4">
          <AssignCleaning />
        </TabPane>
      </Tabs>
    </Card>
  );
}

export default AdministratorDashboard;
