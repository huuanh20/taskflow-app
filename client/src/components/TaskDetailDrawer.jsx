import { useState, useEffect } from 'react';
import { Drawer, Typography, Tag, Space, Input, Button, List, Avatar, Divider, message, Popconfirm, Spin, Select, Empty } from 'antd';
import { SendOutlined, DeleteOutlined, UserOutlined, TagsOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { commentApi } from '../api/commentApi';
import { labelApi } from '../api/labelApi';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const STATUS_MAP = {
  Todo: { color: '#8c8c8c', bg: '#f5f5f5', label: '📋 To Do' },
  InProgress: { color: '#1890ff', bg: '#e6f7ff', label: '🔄 In Progress' },
  Review: { color: '#faad14', bg: '#fff7e6', label: '👀 Review' },
  Done: { color: '#52c41a', bg: '#f6ffed', label: '✅ Done' },
};

const PRIORITY_MAP = {
  Low: { color: 'green', label: 'Thấp' },
  Medium: { color: 'orange', label: 'Trung bình' },
  High: { color: 'red', label: 'Cao' },
  Critical: { color: 'magenta', label: 'Khẩn cấp' },
};

export default function TaskDetailDrawer({ open, task, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [labels, setLabels] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open && task) {
      loadComments();
      loadLabels();
    }
  }, [open, task?.id]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await commentApi.getByTask(task.id);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const loadLabels = async () => {
    try {
      const res = await labelApi.getAll();
      setLabels(res.data);
    } catch (err) {
      console.error('Failed to load labels', err);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      await commentApi.create(task.id, { content: newComment });
      setNewComment('');
      message.success('Đã bình luận!');
      loadComments();
    } catch (err) {
      message.error('Gửi bình luận thất bại!');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentApi.delete(task.id, commentId);
      message.success('Đã xóa bình luận!');
      loadComments();
    } catch (err) {
      message.error('Xóa thất bại!');
    }
  };

  if (!task) return null;

  const statusInfo = STATUS_MAP[task.status] || STATUS_MAP.Todo;
  const priorityInfo = PRIORITY_MAP[task.priority] || PRIORITY_MAP.Medium;

  return (
    <Drawer
      title={null}
      open={open}
      onClose={onClose}
      width={520}
      styles={{ body: { padding: 0 } }}
    >
      {/* Header with gradient */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px 24px 20px',
        color: 'white',
      }}>
        <Title level={4} style={{ color: 'white', margin: 0, marginBottom: 8 }}>
          {task.title}
        </Title>
        <Space>
          <Tag style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            borderRadius: 12,
            padding: '2px 10px',
          }}>
            {statusInfo.label}
          </Tag>
          <Tag color={priorityInfo.color} style={{ borderRadius: 12 }}>
            {priorityInfo.label}
          </Tag>
        </Space>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Description */}
        {task.description && (
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Mô tả
            </Text>
            <Paragraph style={{ marginTop: 6, fontSize: 14, lineHeight: 1.7, color: '#333' }}>
              {task.description}
            </Paragraph>
          </div>
        )}

        {/* Meta info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 20,
          background: '#fafafa',
          borderRadius: 10,
          padding: 16,
        }}>
          <div>
            <Space size={4}>
              <CalendarOutlined style={{ color: '#8c8c8c' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>Hạn chót</Text>
            </Space>
            <div style={{ marginTop: 4, fontWeight: 500 }}>
              {task.dueDate ? dayjs(task.dueDate).format('DD/MM/YYYY') : '—'}
            </div>
          </div>
          <div>
            <Space size={4}>
              <UserOutlined style={{ color: '#8c8c8c' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>Người thực hiện</Text>
            </Space>
            <div style={{ marginTop: 4, fontWeight: 500 }}>
              {task.assigneeName || '—'}
            </div>
          </div>
          <div>
            <Space size={4}>
              <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>Ngày tạo</Text>
            </Space>
            <div style={{ marginTop: 4, fontWeight: 500 }}>
              {dayjs(task.createdAt).format('DD/MM/YYYY HH:mm')}
            </div>
          </div>
          <div>
            <Space size={4}>
              <TagsOutlined style={{ color: '#8c8c8c' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>Labels</Text>
            </Space>
            <div style={{ marginTop: 4 }}>
              {task.labels?.length > 0 ? (
                task.labels.map(l => (
                  <Tag key={l.id} color={l.color} style={{ borderRadius: 10, marginBottom: 4 }}>
                    {l.name}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">—</Text>
              )}
            </div>
          </div>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* Comments Section */}
        <div>
          <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            💬 Bình luận ({comments.length})
          </Text>

          {/* Comment input */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 16 }}>
            <Avatar
              size={32}
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', flexShrink: 0 }}
            >
              {user?.fullName?.[0] || 'U'}
            </Avatar>
            <Input.TextArea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
              style={{ borderRadius: 8, resize: 'none' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendComment}
              loading={sending}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: 8,
                flexShrink: 0,
              }}
            />
          </div>

          {/* Comments list */}
          {loadingComments ? (
            <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
          ) : comments.length === 0 ? (
            <Empty description="Chưa có bình luận" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              dataSource={comments}
              renderItem={item => (
                <div style={{
                  display: 'flex',
                  gap: 10,
                  padding: '10px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}>
                  <Avatar
                    size={28}
                    style={{ background: '#e8e8e8', color: '#666', flexShrink: 0, fontSize: 12 }}
                  >
                    {item.userName?.[0] || 'U'}
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ fontSize: 13 }}>{item.userName}</Text>
                      <Space size={4}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {dayjs(item.createdAt).fromNow()}
                        </Text>
                        {item.userId === user?.id && (
                          <Popconfirm title="Xóa bình luận?" onConfirm={() => handleDeleteComment(item.id)}>
                            <Button type="text" size="small" danger icon={<DeleteOutlined />}
                              style={{ width: 20, height: 20, padding: 0 }} />
                          </Popconfirm>
                        )}
                      </Space>
                    </div>
                    <Text style={{ fontSize: 13, lineHeight: 1.6, wordBreak: 'break-word' }}>
                      {item.content}
                    </Text>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </div>
    </Drawer>
  );
}
