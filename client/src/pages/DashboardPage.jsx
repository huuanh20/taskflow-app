import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Tag } from 'antd';
import { ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { projectApi } from '../api/projectApi';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Xin chào, {user?.fullName}! 👋
        </Title>
        <Text type="secondary">Tổng quan công việc của bạn</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="stat-card" style={{ borderLeft: '4px solid #667eea' }}>
            <Statistic title="Tổng dự án" value={projects.length} prefix={<ProjectOutlined style={{ color: '#667eea' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="stat-card" style={{ borderLeft: '4px solid #52c41a' }}>
            <Statistic title="Tổng công việc" value={totalTasks} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="stat-card" style={{ borderLeft: '4px solid #faad14' }}>
            <Statistic title="Đang xử lý" value={projects.filter(p => p.taskCount > 0).length} prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="stat-card" style={{ borderLeft: '4px solid #722ed1' }}>
            <Statistic title="Vai trò" value={user?.role || 'Member'} prefix={<TeamOutlined style={{ color: '#722ed1' }} />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="📂 Dự án gần đây" className="dashboard-card">
            {projects.length === 0 ? (
              <Text type="secondary">Chưa có dự án nào. Tạo dự án đầu tiên!</Text>
            ) : (
              <Row gutter={[16, 16]}>
                {projects.slice(0, 6).map(project => (
                  <Col xs={24} sm={12} lg={8} key={project.id}>
                    <Card size="small" hoverable style={{ borderRadius: 8 }}>
                      <Title level={5} style={{ margin: 0 }}>{project.name}</Title>
                      <Text type="secondary">{project.description || 'Không có mô tả'}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Tag color="blue">{project.taskCount || 0} tasks</Tag>
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
