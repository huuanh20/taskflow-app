import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Table, Modal, Form, Input, Select, Tag, Typography, message, Popconfirm, Space, DatePicker, Segmented, Badge, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SwapOutlined, AppstoreOutlined, UnorderedListOutlined, SearchOutlined, EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { taskApi } from '../api/taskApi';
import { projectApi } from '../api/projectApi';
import { useLanguage } from '../contexts/LanguageContext';
import TaskDetailDrawer from '../components/TaskDetailDrawer';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_ORDER = ['Todo', 'InProgress', 'Review', 'Done'];

const VALID_TRANSITIONS = {
  Todo: ['InProgress'],
  InProgress: ['Review'],
  Review: ['Done', 'InProgress'],
  Done: [],
};

function TaskCard({ task, onEdit, onDetail, onStatusChange, statusMap, priorityMap, t, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="kanban-card" onClick={() => onDetail(task)}>
      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6, color: '#1a1d26' }}>
        {task.title}
      </Text>
      {task.description && (
        <Text style={{ fontSize: 12, display: 'block', marginBottom: 10, color: '#8b92a5', lineHeight: 1.4 }}>
          {task.description?.substring(0, 60)}{task.description?.length > 60 ? '...' : ''}
        </Text>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tag style={{
          borderRadius: 20, fontSize: 11, margin: 0, fontWeight: 600,
          background: priorityMap[task.priority]?.bg || '#f1f3f9',
          color: priorityMap[task.priority]?.color || '#8b92a5',
          border: 'none',
        }}>
          {priorityMap[task.priority]?.label || task.priority}
        </Tag>
        <Space size={4}>
          {(VALID_TRANSITIONS[task.status] || []).map(ns => (
            <Tooltip key={ns} title={`→ ${statusMap[ns]?.label}`}>
              <Button size="small" type="text"
                icon={<SwapOutlined style={{ fontSize: 12 }} />}
                onClick={e => { e.stopPropagation(); onStatusChange(task, ns); }}
                style={{ width: 24, height: 24, padding: 0, color: statusMap[ns]?.color }}
              />
            </Tooltip>
          ))}
          <Tooltip title={t('common.edit')}>
            <Button size="small" type="text" icon={<EditOutlined style={{ fontSize: 12 }} />}
              onClick={e => { e.stopPropagation(); onEdit(task); }}
              style={{ width: 24, height: 24, padding: 0, color: '#b0b7c8' }}
            />
          </Tooltip>
        </Space>
      </div>
      {task.dueDate && (
        <Text style={{ fontSize: 11, marginTop: 8, display: 'block', color: '#8b92a5' }}>
          🗓 {dayjs(task.dueDate).format('DD/MM/YYYY')}
        </Text>
      )}
    </div>
  );
}

export default function TasksPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
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
  const [activeId, setActiveId] = useState(null);
  const [form] = Form.useForm();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const STATUS_MAP = {
    Todo: { color: '#8b92a5', bg: '#f1f3f9', label: t('status.Todo'), tagColor: 'default' },
    InProgress: { color: '#3b82f6', bg: '#eff6ff', label: t('status.InProgress'), tagColor: 'processing' },
    Review: { color: '#f59e0b', bg: '#fef9ee', label: t('status.Review'), tagColor: 'warning' },
    Done: { color: '#10b981', bg: '#ecfdf5', label: t('status.Done'), tagColor: 'success' },
  };

  const PRIORITY_MAP = {
    Low: { color: '#10b981', bg: '#ecfdf5', label: t('priority.Low') },
    Medium: { color: '#f59e0b', bg: '#fef9ee', label: t('priority.Medium') },
    High: { color: '#ef4444', bg: '#fef2f2', label: t('priority.High') },
    Critical: { color: '#ec4899', bg: '#fdf2f8', label: t('priority.Critical') },
  };

  useEffect(() => { loadProject(); }, [projectId]);
  useEffect(() => { loadTasks(); }, [filters, statusFilter, searchText]);

  const loadProject = async () => {
    try { const res = await projectApi.getById(projectId); setProject(res.data); }
    catch (err) { console.error(err); }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = { ...filters, ...(statusFilter && { status: statusFilter }), ...(searchText && { search: searchText }) };
      const res = await taskApi.getAll(projectId, params);
      setTasks(res.data.items || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) { message.error('Error loading tasks'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (values) => {
    const data = { ...values, dueDate: values.dueDate?.toISOString() || null };
    try {
      if (editing) { await taskApi.update(projectId, editing.id, data); message.success(t('tasks.updateSuccess')); }
      else { await taskApi.create(projectId, data); message.success(t('tasks.createSuccess')); }
      setModalOpen(false); form.resetFields(); setEditing(null); loadTasks();
    } catch (err) { message.error(err.response?.data?.message || 'Error!'); }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await taskApi.updateStatus(projectId, task.id, { status: newStatus });
      message.success(`→ ${STATUS_MAP[newStatus]?.label}`);
      loadTasks();
    } catch (err) { message.error(err.response?.data?.message || 'Cannot transition'); }
  };

  const handleDelete = async (id) => {
    try { await taskApi.delete(projectId, id); message.success(t('tasks.deleteSuccess')); loadTasks(); }
    catch (err) { message.error('Delete failed'); }
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({ ...record, dueDate: record.dueDate ? dayjs(record.dueDate) : null });
    setModalOpen(true);
  };

  const openDetail = (record) => { setSelectedTask(record); setDrawerOpen(true); };

  // Drag & Drop handlers
  const handleDragStart = (event) => { setActiveId(event.active.id); };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const draggedTask = tasks.find(t => t.id === active.id);
    if (!draggedTask) return;

    // Check if dropped on a column droppable
    const targetStatus = over.id;
    if (STATUS_ORDER.includes(targetStatus) && draggedTask.status !== targetStatus) {
      // Validate transition
      const valid = VALID_TRANSITIONS[draggedTask.status] || [];
      if (valid.includes(targetStatus)) {
        handleStatusChange(draggedTask, targetStatus);
      } else {
        message.warning(`Cannot move from ${STATUS_MAP[draggedTask.status]?.label} to ${STATUS_MAP[targetStatus]?.label}`);
      }
    }
  };

  // Kanban with DnD
  const renderKanbanBoard = () => {
    const columns = STATUS_ORDER.map(status => ({
      key: status, ...STATUS_MAP[status],
      tasks: tasks.filter(t => t.status === status),
    }));

    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter}
        onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, minHeight: 420 }}>
          {columns.map(col => (
            <KanbanColumn key={col.key} column={col} onEdit={openEdit} onDetail={openDetail}
              onStatusChange={handleStatusChange} statusMap={STATUS_MAP}
              priorityMap={PRIORITY_MAP} t={t} activeId={activeId}
              onAddTask={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId ? (() => {
            const task = tasks.find(t => t.id === activeId);
            return task ? (
              <div className="kanban-card" style={{
                padding: '14px 16px', boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                transform: 'rotate(2deg)', cursor: 'grabbing',
              }}>
                <Text strong style={{ fontSize: 13 }}>{task.title}</Text>
              </div>
            ) : null;
          })() : null}
        </DragOverlay>
      </DndContext>
    );
  };

  // Table columns
  const columns = [
    {
      title: t('tasks.title'), dataIndex: 'title', key: 'title',
      render: (text, record) => <a onClick={() => openDetail(record)} style={{ fontWeight: 600, color: '#635bff' }}>{text}</a>,
    },
    {
      title: t('tasks.status'), dataIndex: 'status', key: 'status', width: 150,
      render: (status) => <Tag color={STATUS_MAP[status]?.tagColor}>{STATUS_MAP[status]?.label}</Tag>,
    },
    {
      title: t('tasks.priority'), dataIndex: 'priority', key: 'priority', width: 110,
      render: (pr) => <Tag style={{ background: PRIORITY_MAP[pr]?.bg, color: PRIORITY_MAP[pr]?.color, border: 'none', borderRadius: 20, fontWeight: 600, fontSize: 11 }}>{PRIORITY_MAP[pr]?.label}</Tag>,
    },
    {
      title: t('tasks.dueDate'), dataIndex: 'dueDate', key: 'dueDate', width: 120,
      render: (date) => date ? <span style={{ color: '#5c6370' }}>{dayjs(date).format('DD/MM/YYYY')}</span> : '-',
    },
    {
      title: t('tasks.actions'), key: 'actions', width: 200,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => openDetail(record)}>{t('tasks.detail')}</Button>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title={t('tasks.deleteConfirm')} onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space align="center">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')} style={{ color: '#5c6370' }} />
          <div>
            <Title level={3} style={{ margin: 0, color: '#1a1d26' }}>{project?.name || t('tasks.title')}</Title>
            {project?.description && <Text style={{ fontSize: 13, color: '#8b92a5' }}>{project.description}</Text>}
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />}
          onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          {t('tasks.createTask')}
        </Button>
      </div>

      {/* Toolbar */}
      <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 12, background: 'white', border: '1px solid #e8ecf3', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Input placeholder={t('tasks.searchTasks')} prefix={<SearchOutlined style={{ color: '#b0b7c8' }} />}
          value={searchText} onChange={e => setSearchText(e.target.value)} allowClear style={{ width: 220 }} />
        <Select placeholder={t('tasks.status')} value={statusFilter} onChange={v => setStatusFilter(v)} allowClear
          style={{ width: 160 }}
          options={Object.entries(STATUS_MAP).map(([key, val]) => ({ label: val.label, value: key }))} />
        <div style={{ flex: 1 }} />
        <Segmented value={viewMode} onChange={setViewMode} options={[
          { label: t('tasks.board'), value: 'kanban', icon: <AppstoreOutlined /> },
          { label: t('tasks.list'), value: 'table', icon: <UnorderedListOutlined /> },
        ]} />
      </div>

      {/* Content */}
      {viewMode === 'kanban' ? renderKanbanBoard() : (
        <Card style={{ borderRadius: 12 }}>
          <Table columns={columns} dataSource={tasks} rowKey="id" loading={loading}
            pagination={{
              current: filters.pageNumber, pageSize: filters.pageSize, total: totalCount,
              onChange: (page, size) => setFilters(f => ({ ...f, pageNumber: page, pageSize: size })),
              showTotal: (total) => <span style={{ color: '#5c6370' }}>{t('common.total')} {total} tasks</span>,
            }} />
        </Card>
      )}

      {/* Modal */}
      <Modal title={editing ? t('tasks.editTask') : t('tasks.newTask')} open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()} okText={editing ? t('common.update') : t('common.create')} cancelText={t('common.cancel')} width={520}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ priority: 'Medium' }}>
          <Form.Item name="title" label={t('tasks.title')} rules={[{ required: true, message: t('tasks.titleRequired') }]}>
            <Input placeholder={t('tasks.title')} />
          </Form.Item>
          <Form.Item name="description" label={t('tasks.description')}>
            <TextArea rows={3} placeholder={t('tasks.description')} />
          </Form.Item>
          <Form.Item name="priority" label={t('tasks.priority')}>
            <Select options={Object.entries(PRIORITY_MAP).map(([key, val]) => ({ label: val.label, value: key }))} />
          </Form.Item>
          <Form.Item name="dueDate" label={t('tasks.dueDate')}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      <TaskDetailDrawer open={drawerOpen} task={selectedTask}
        onClose={() => { setDrawerOpen(false); setSelectedTask(null); }} />
    </div>
  );
}

// Kanban Column (droppable)
function KanbanColumn({ column, onEdit, onDetail, onStatusChange, statusMap, priorityMap, t, activeId, onAddTask }) {
  const { setNodeRef, isOver } = useSortable({ id: column.key, data: { type: 'column' } });

  return (
    <div ref={setNodeRef} className="kanban-column" style={{
      transition: 'background 0.2s',
      background: isOver ? '#f0edff' : undefined,
      border: isOver ? '2px dashed #635bff' : undefined,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: column.color }} />
          <Text style={{ fontWeight: 600, fontSize: 13, color: '#1a1d26' }}>{column.label}</Text>
        </div>
        <Badge count={column.tasks.length} style={{ background: column.bg, color: column.color, boxShadow: 'none', fontWeight: 700, fontSize: 11 }} />
      </div>

      <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {column.tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 8px' }}>
              <Text style={{ fontSize: 12, color: '#b0b7c8' }}>{t('common.empty')}</Text>
            </div>
          ) : (
            column.tasks.map(task => (
              <TaskCard key={task.id} task={task} onEdit={onEdit} onDetail={onDetail}
                onStatusChange={onStatusChange} statusMap={statusMap}
                priorityMap={priorityMap} t={t} isDragging={activeId === task.id}
              />
            ))
          )}

          <Button type="text" icon={<PlusOutlined />}
            style={{ color: '#8b92a5', fontSize: 12, height: 36, borderRadius: 8, border: '1px dashed #e8ecf3' }}
            onClick={onAddTask} block>
            {t('tasks.addTask')}
          </Button>
        </div>
      </SortableContext>
    </div>
  );
}
