import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Table, Modal, Form, Input, Select, Tag, Typography, message, Popconfirm, Space, DatePicker, Segmented, Row, Col, Badge, Empty, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SwapOutlined, AppstoreOutlined, UnorderedListOutlined, SearchOutlined, EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { taskApi } from '../api/taskApi';
import { projectApi } from '../api/projectApi';
import TaskDetailDrawer from '../components/TaskDetailDrawer';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_MAP = {
  Todo: { color: '#8c8c8c', bg: '#f5f5f5', border: '#d9d9d9', label: '📋 To Do', tagColor: 'default' },
  InProgress: { color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff', label: '🔄 In Progress', tagColor: 'processing' },
  Review: { color: '#faad14', bg: '#fff7e6', border: '#ffd591', label: '👀 Review', tagColor: 'warning' },
  Done: { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f', label: '✅ Done', tagColor: 'success' },
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

const STATUS_ORDER = ['Todo', 'InProgress', 'Review', 'Done'];

export default function TasksPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({ pageNumber: 1, pageSize: 50 });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState('kanban');
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    loadTasks();
  }, [filters, statusFilter, searchText]);

  const loadProject = async () => {
    try {
      const res = await projectApi.getById(projectId);
      setProject(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        ...(statusFilter && { status: statusFilter }),
        ...(searchText && { search: searchText }),
      };
      const res = await taskApi.getAll(projectId, params);
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

  const openDetail = (record) => {
    setSelectedTask(record);
    setDrawerOpen(true);
  };

  // ─── Kanban Board ───
  const renderKanbanBoard = () => {
    const columns = STATUS_ORDER.map(status => ({
      key: status,
      ...STATUS_MAP[status],
      tasks: tasks.filter(t => t.status === status),
    }));

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        minHeight: 400,
      }}>
        {columns.map(col => (
          <div key={col.key} style={{
            background: col.bg,
            borderRadius: 12,
            border: `1px solid ${col.border}`,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Column header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: `2px solid ${col.color}`,
            }}>
              <Text strong style={{ color: col.color, fontSize: 14 }}>
                {col.label}
              </Text>
              <Badge count={col.tasks.length} style={{
                background: col.color,
                boxShadow: 'none',
              }} />
            </div>

            {/* Tasks */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 8px' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Trống</Text>
                </div>
              ) : (
                col.tasks.map(task => (
                  <Card
                    key={task.id}
                    size="small"
                    hoverable
                    style={{
                      borderRadius: 8,
                      border: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    styles={{ body: { padding: '10px 12px' } }}
                    onClick={() => openDetail(task)}
                  >
                    <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }} ellipsis>
                        {task.description}
                      </Text>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tag color={PRIORITY_MAP[task.priority]?.color || 'default'} style={{ borderRadius: 10, fontSize: 11, margin: 0 }}>
                        {PRIORITY_MAP[task.priority]?.label || task.priority}
                      </Tag>
                      <Space size={4}>
                        {VALID_TRANSITIONS[task.status]?.map(ns => (
                          <Tooltip key={ns} title={`→ ${STATUS_MAP[ns]?.label?.substring(2)}`}>
                            <Button size="small" type="text"
                              icon={<SwapOutlined style={{ fontSize: 12 }} />}
                              onClick={e => { e.stopPropagation(); handleStatusChange(task, ns); }}
                              style={{ width: 24, height: 24, padding: 0, color: STATUS_MAP[ns]?.color }}
                            />
                          </Tooltip>
                        ))}
                        <Tooltip title="Chỉnh sửa">
                          <Button size="small" type="text" icon={<EditOutlined style={{ fontSize: 12 }} />}
                            onClick={e => { e.stopPropagation(); openEdit(task); }}
                            style={{ width: 24, height: 24, padding: 0 }}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                    {task.dueDate && (
                      <Text type="secondary" style={{ fontSize: 10, marginTop: 4, display: 'block' }}>
                        🗓 {dayjs(task.dueDate).format('DD/MM/YYYY')}
                      </Text>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ─── Table View ───
  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => openDetail(record)} style={{ fontWeight: 600 }}>{text}</a>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status) => {
        const s = STATUS_MAP[status] || STATUS_MAP.Todo;
        return <Tag color={s.tagColor}>{s.label}</Tag>;
      },
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
      width: 200,
      render: (_, record) => {
        const nextStatuses = VALID_TRANSITIONS[record.status] || [];
        return (
          <Space>
            <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => openDetail(record)}>
              Chi tiết
            </Button>
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
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')} />
          <div>
            <Title level={3} style={{ margin: 0 }}>
              📋 {project?.name || 'Công việc'}
            </Title>
            {project?.description && (
              <Text type="secondary" style={{ fontSize: 12 }}>{project.description}</Text>
            )}
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />}
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
          onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          Tạo task
        </Button>
      </div>

      {/* Toolbar: search, filter, view toggle */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 10 }} styles={{ body: { padding: '10px 16px' } }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm kiếm task..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ width: 220, borderRadius: 8 }}
          />
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={v => setStatusFilter(v)}
            allowClear
            style={{ width: 160, borderRadius: 8 }}
            options={Object.entries(STATUS_MAP).map(([key, val]) => ({ label: val.label, value: key }))}
          />
          <div style={{ flex: 1 }} />
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { label: 'Kanban', value: 'kanban', icon: <AppstoreOutlined /> },
              { label: 'Bảng', value: 'table', icon: <UnorderedListOutlined /> },
            ]}
          />
        </div>
      </Card>

      {/* Content */}
      {viewMode === 'kanban' ? (
        renderKanbanBoard()
      ) : (
        <Card style={{ borderRadius: 12 }}>
          <Table columns={columns} dataSource={tasks} rowKey="id" loading={loading}
            pagination={{
              current: filters.pageNumber,
              pageSize: filters.pageSize,
              total: totalCount,
              onChange: (page, size) => setFilters(f => ({ ...f, pageNumber: page, pageSize: size })),
              showTotal: (total) => `Tổng ${total} tasks`,
            }} />
        </Card>
      )}

      {/* Create/Edit Modal */}
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

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        open={drawerOpen}
        task={selectedTask}
        onClose={() => { setDrawerOpen(false); setSelectedTask(null); }}
      />
    </div>
  );
}
