import { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Typography, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { projectApi } from '../api/projectApi';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { t } = useLanguage();

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try { const res = await projectApi.getAll(); setProjects(res.data); }
    catch (err) { message.error('Error loading projects'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) { await projectApi.update(editing.id, values); message.success(t('projects.updateSuccess')); }
      else { await projectApi.create(values); message.success(t('projects.createSuccess')); }
      setModalOpen(false); form.resetFields(); setEditing(null); loadProjects();
    } catch (err) { message.error(err.response?.data?.message || 'Error!'); }
  };

  const handleDelete = async (id) => {
    try { await projectApi.delete(id); message.success(t('tasks.deleteSuccess')); loadProjects(); }
    catch (err) { message.error('Delete failed'); }
  };

  const openEdit = (record) => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); };

  const columns = [
    {
      title: t('projects.name'), dataIndex: 'name', key: 'name',
      render: (text, record) => (
        <a onClick={() => navigate(`/projects/${record.id}/tasks`)} style={{ fontWeight: 600, color: '#635bff' }}>
          <FolderOpenOutlined style={{ marginRight: 8, color: '#635bff' }} />{text}
        </a>
      ),
    },
    {
      title: t('projects.description'), dataIndex: 'description', key: 'description', ellipsis: true,
      render: (text) => <span style={{ color: '#5c6370' }}>{text || t('projects.noDescription')}</span>,
    },
    {
      title: 'Tasks', dataIndex: 'taskCount', key: 'taskCount', width: 100,
      render: (count) => <Tag style={{ borderRadius: 20, background: '#eff6ff', color: '#3b82f6', border: 'none', fontWeight: 600 }}>{count || 0}</Tag>,
    },
    {
      title: t('projects.createdAt'), dataIndex: 'createdAt', key: 'createdAt', width: 120,
      render: (date) => <span style={{ color: '#5c6370', fontSize: 13 }}>{new Date(date).toLocaleDateString('vi-VN')}</span>,
    },
    {
      title: t('tasks.actions'), key: 'actions', width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} style={{ color: '#5c6370' }} />
          <Popconfirm title={t('projects.deleteConfirm')} onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#1a1d26' }}>{t('projects.title')}</Title>
        <Button type="primary" icon={<PlusOutlined />}
          onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          {t('projects.createProject')}
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={projects} rowKey="id" loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => <span style={{ color: '#5c6370' }}>{t('common.total')} {total}</span> }} />
      </Card>

      <Modal title={editing ? t('projects.editProject') : t('projects.newProject')} open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()} okText={editing ? t('common.update') : t('common.create')} cancelText={t('common.cancel')}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label={t('projects.name')} rules={[{ required: true, message: t('tasks.titleRequired') }]}>
            <Input placeholder={t('projects.name')} />
          </Form.Item>
          <Form.Item name="description" label={t('projects.description')}>
            <TextArea rows={3} placeholder={t('projects.description')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
