import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Table, Modal, Form, Input, Select, Tag, Typography, message, Popconfirm, Space, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import { taskApi } from '../api/taskApi';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const STATUS_MAP = {
  Todo: { color: 'default', label: '📋 To Do' },
  InProgress: { color: 'processing', label: '🔄 In Progress' },
  Review: { color: 'warning', label: '👀 Review' },
  Done: { color: 'success', label: '✅ Done' },
};

const PRIORITY_MAP = {
  Low: { color: 'green', label: 'Thấp' },
  Medium: { color: 'orange', label: 'Trung bình' },
  High: { color: 'red', label: 'Cao' },
  Critical: { color: 'magenta', label: 'Khẩn cấp' },
};

const VALID_TRANSITIONS = {
  Todo: ['InProgress'],
  InProgress: ['Review'],
  Review: ['Done', 'InProgress'],
  Done: [],
};

export default function TasksPage() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({ pageNumber: 1, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => { loadTasks(); }, [filters]);

  const loadTasks = async () => {
    try {
      const res = await taskApi.getAll(projectId, filters);
      setTasks(res.data.items || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      message.error('Không thể tải tasks!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    const data = { ...values, dueDate: values.dueDate?.toISOString() || null };
    try {
      if (editing) {
        await taskApi.update(projectId, editing.id, data);
        message.success('Cập nhật thành công!');
      } else {
        await taskApi.create(projectId, data);
        message.success('Tạo task thành công!');
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      loadTasks();
    } catch (err) {
      message.error(err.response?.data?.message || 'Lỗi!');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await taskApi.updateStatus(projectId, task.id, { status: newStatus });
      message.success(`Chuyển trạng thái → ${STATUS_MAP[newStatus]?.label}`);
      loadTasks();
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể chuyển trạng thái!');
    }
  };

  const handleDelete = async (id) => {
    try {
      await taskApi.delete(projectId, id);
      message.success('Đã xóa!');
      loadTasks();
    } catch (err) {
      message.error('Xóa thất bại!');
    }
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      dueDate: record.dueDate ? dayjs(record.dueDate) : null,
    });
    setModalOpen(true);
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status) => {
        const s = STATUS_MAP[status] || STATUS_MAP.Todo;
        return <Tag color={s.color}>{s.label}</Tag>;
      },
      filters: Object.entries(STATUS_MAP).map(([key, val]) => ({ text: val.label, value: key })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (priority) => {
        const p = PRIORITY_MAP[priority] || PRIORITY_MAP.Medium;
        return <Tag color={p.color}>{p.label}</Tag>;
      },
    },
    {
      title: 'Hạn chót',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_, record) => {
        const nextStatuses = VALID_TRANSITIONS[record.status] || [];
        return (
          <Space>
            {nextStatuses.map(ns => (
              <Button key={ns} size="small" type="link" icon={<SwapOutlined />}
                onClick={() => handleStatusChange(record, ns)}>
                {STATUS_MAP[ns]?.label?.substring(2)}
              </Button>
            ))}
            <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
            <Popconfirm title="Xóa task này?" onConfirm={() => handleDelete(record.id)}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>📋 Công việc</Title>
        <Button type="primary" icon={<PlusOutlined />}
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
          onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          Tạo task
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={tasks} rowKey="id" loading={loading}
          pagination={{
            current: filters.pageNumber,
            pageSize: filters.pageSize,
            total: totalCount,
            onChange: (page, size) => setFilters(f => ({ ...f, pageNumber: page, pageSize: size })),
            showTotal: (total) => `Tổng ${total} tasks`,
          }} />
      </Card>

      <Modal title={editing ? 'Chỉnh sửa task' : 'Tạo task mới'} open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()} okText={editing ? 'Cập nhật' : 'Tạo'} cancelText="Hủy" width={520}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}
          initialValues={{ priority: 'Medium' }}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề!' }]}>
            <Input placeholder="Tên task..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả chi tiết..." />
          </Form.Item>
          <Form.Item name="priority" label="Ưu tiên">
            <Select options={Object.entries(PRIORITY_MAP).map(([key, val]) => ({ label: val.label, value: key }))} />
          </Form.Item>
          <Form.Item name="dueDate" label="Hạn chót">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
