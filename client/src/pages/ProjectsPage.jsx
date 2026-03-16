import { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Typography, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { projectApi } from '../api/projectApi';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const res = await projectApi.getAll();
      setProjects(res.data);
    } catch (err) {
      message.error('Không thể tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await projectApi.update(editing.id, values);
        message.success('Cập nhật thành công!');
      } else {
        await projectApi.create(values);
        message.success('Tạo dự án thành công!');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      loadProjects();
    } catch (err) {
      message.error(err.response?.data?.message || 'Lỗi!');
    }
  };

  const handleDelete = async (id) => {
    try {
      await projectApi.delete(id);
      message.success('Đã xóa!');
      loadProjects();
    } catch (err) {
      message.error('Xóa thất bại!');
    }
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const columns = [
    {
      title: 'Tên dự án',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => navigate(`/projects/${record.id}/tasks`)} style={{ fontWeight: 600 }}>
          <FolderOpenOutlined style={{ marginRight: 8, color: '#667eea' }} />{text}
        </a>
      ),
    },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Tasks',
      dataIndex: 'taskCount',
      key: 'taskCount',
      width: 100,
      render: (count) => <Tag color="blue">{count || 0}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Xóa dự án này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>📁 Dự án</Title>
        <Button type="primary" icon={<PlusOutlined />}
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
          onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          Tạo dự án
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={projects} rowKey="id" loading={loading}
          pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title={editing ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'} open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()} okText={editing ? 'Cập nhật' : 'Tạo'} cancelText="Hủy">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên dự án" rules={[{ required: true, message: 'Nhập tên!' }]}>
            <Input placeholder="Tên dự án..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả dự án..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
