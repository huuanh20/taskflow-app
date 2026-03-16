import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Tag, Progress, Empty } from 'antd';
import { ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined, RiseOutlined, FireOutlined, EyeOutlined } from '@ant-design/icons';
import { projectApi } from '../api/projectApi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const STATUS_COLORS = {
  Todo: { color: '#8c8c8c', label: 'To Do' },
  InProgress: { color: '#1890ff', label: 'In Progress' },
  Review: { color: '#faad14', label: 'Review' },
  Done: { color: '#52c41a', label: 'Done' },
};

const PRIORITY_COLORS = {
  Low: { color: '#52c41a', label: 'Thấp' },
  Medium: { color: '#faad14', label: 'Trung bình' },
  High: { color: '#ff4d4f', label: 'Cao' },
  Critical: { color: '#eb2f96', label: 'Khẩn cấp' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await projectApi.getAll();
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalTasks = projects.reduce((sum, p) => sum + (p.taskCount || 0), 0);
  const totalDone = projects.reduce((sum, p) => sum + (p.doneCount || 0), 0);
  const totalInProgress = projects.reduce((sum, p) => sum + (p.inProgressCount || 0), 0);
  const completionRate = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;

  return (
    <div>
      {/* Welcome header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        padding: '28px 32px',
        marginBottom: 24,
        color: 'white',
      }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          Xin chào, {user?.fullName}! 👋
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
          Tổng quan công việc của bạn — {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </div>

      {/* Stats cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="stat-card" style={{ borderLeft: '4px solid #667eea' }}>
            <Statistic title="Tổng dự án" value={projects.length}
              prefix={<ProjectOutlined style={{ color: '#667eea' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="stat-card" style={{ borderLeft: '4px solid #1890ff' }}>
            <Statistic title="Tổng công việc" value={totalTasks}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="stat-card" style={{ borderLeft: '4px solid #52c41a' }}>
            <Statistic title="Hoàn thành" value={totalDone}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>/{totalTasks}</Text>} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="stat-card" style={{ borderLeft: '4px solid #722ed1' }}>
            <Statistic title="Tỷ lệ hoàn thành" value={completionRate}
              prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
              suffix="%" />
          </Card>
        </Col>
      </Row>

      {/* Charts section */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Status distribution */}
        <Col xs={24} lg={12}>
          <Card title="📊 Phân bổ trạng thái" className="dashboard-card"
            style={{ borderRadius: 12 }}>
            {totalTasks === 0 ? (
              <Empty description="Chưa có task" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div>
                {Object.entries(STATUS_COLORS).map(([key, { color, label }]) => {
                  const count = projects.reduce((sum, p) => {
                    if (key === 'Done') return sum + (p.doneCount || 0);
                    if (key === 'InProgress') return sum + (p.inProgressCount || 0);
                    if (key === 'Review') return sum + (p.reviewCount || 0);
                    if (key === 'Todo') return sum + (p.todoCount || 0);
                    return sum;
                  }, 0);
                  const percent = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                  return (
                    <div key={key} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 13 }}>{label}</Text>
                        <Text strong style={{ fontSize: 13 }}>{count} ({percent}%)</Text>
                      </div>
                      <Progress
                        percent={percent}
                        strokeColor={color}
                        showInfo={false}
                        size="small"
                        style={{ margin: 0 }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* Priority distribution */}
        <Col xs={24} lg={12}>
          <Card title="🔥 Phân bổ ưu tiên" className="dashboard-card"
            style={{ borderRadius: 12 }}>
            {totalTasks === 0 ? (
              <Empty description="Chưa có task" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {Object.entries(PRIORITY_COLORS).map(([key, { color, label }]) => {
                  const count = projects.reduce((sum, p) => {
                    const priorityCounts = p.priorityCounts || {};
                    return sum + (priorityCounts[key] || 0);
                  }, 0);
                  return (
                    <Card key={key} size="small"
                      style={{
                        borderRadius: 10,
                        border: `1px solid ${color}20`,
                        background: `${color}08`,
                      }}
                      styles={{ body: { padding: '12px 16px' } }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 8, height: 8,
                          borderRadius: '50%',
                          background: color,
                        }} />
                        <Text style={{ fontSize: 12, color: '#666' }}>{label}</Text>
                      </div>
                      <Title level={3} style={{ margin: '4px 0 0', color }}>{count}</Title>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent projects */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="📂 Dự án gần đây" className="dashboard-card" style={{ borderRadius: 12 }}>
            {projects.length === 0 ? (
              <Empty description="Chưa có dự án nào. Tạo dự án đầu tiên!" />
            ) : (
              <Row gutter={[16, 16]}>
                {projects.slice(0, 6).map(project => (
                  <Col xs={24} sm={12} lg={8} key={project.id}>
                    <Card size="small" hoverable
                      style={{ borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => navigate(`/projects/${project.id}/tasks`)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Title level={5} style={{ margin: 0, marginBottom: 4 }}>{project.name}</Title>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {project.description || 'Không có mô tả'}
                          </Text>
                        </div>
                        <EyeOutlined style={{ color: '#bfbfbf' }} />
                      </div>
                      <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                        <Tag color="blue" style={{ borderRadius: 10 }}>{project.taskCount || 0} tasks</Tag>
                        {(project.doneCount || 0) > 0 && (
                          <Tag color="green" style={{ borderRadius: 10 }}>
                            {project.doneCount} done
                          </Tag>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
