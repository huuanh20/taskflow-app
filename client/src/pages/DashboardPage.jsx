import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, Tag, Progress, Empty } from 'antd';
import { ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined, RiseOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { projectApi } from '../api/projectApi';
import { taskApi } from '../api/taskApi';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import AnimatedCounter from '../components/AnimatedCounter';
import LiveClock from '../components/LiveClock';
import FocusTimer from '../components/FocusTimer';
import ProductivityChart from '../components/ProductivityChart';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await projectApi.getAll();
      setProjects(res.data);
      const taskPromises = res.data.map(p =>
        taskApi.getAll(p.id, { pageSize: 100 }).then(r => r.data.items || []).catch(() => [])
      );
      const allTaskArrays = await Promise.all(taskPromises);
      setAllTasks(allTaskArrays.flat());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalTasks = projects.reduce((sum, p) => sum + (p.taskCount || 0), 0);
  const totalDone = projects.reduce((sum, p) => sum + (p.doneCount || 0), 0);
  const completionRate = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;

  const stats = [
    { title: t('dashboard.projects'), value: projects.length, icon: <ProjectOutlined />, color: '#635bff', bg: '#ece9ff' },
    { title: t('dashboard.tasks'), value: totalTasks, icon: <ClockCircleOutlined />, color: '#3b82f6', bg: '#eff6ff' },
    { title: t('dashboard.completed'), value: totalDone, icon: <CheckCircleOutlined />, color: '#10b981', bg: '#ecfdf5', suffix: `/${totalTasks}` },
    { title: t('dashboard.progress'), value: completionRate, icon: <RiseOutlined />, color: '#f59e0b', bg: '#fef9ee', suffix: '%' },
  ];

  const STATUS_COLORS = {
    Todo: { color: '#8b92a5', label: t('status.Todo') },
    InProgress: { color: '#3b82f6', label: t('status.InProgress') },
    Review: { color: '#f59e0b', label: t('status.Review') },
    Done: { color: '#10b981', label: t('status.Done') },
  };

  return (
    <div>
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          {/* Welcome Banner */}
          <Card className="welcome-banner-card" style={{
            background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 40%, #06b6d4 100%)',
            border: 'none', borderRadius: 20, marginBottom: 20,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: 24, background: 'rgba(255,255,255,0.1)', transform: 'rotate(30deg)', animation: 'float-gentle 6s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: -10, right: 80, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', animation: 'float-gentle 4s ease-in-out infinite 1s' }} />
            <div style={{ position: 'relative', zIndex: 1, padding: '8px 4px' }}>
              <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 800, letterSpacing: '-0.5px', fontSize: 28, marginBottom: 6 }}>
                {t('common.hello')}, {user?.fullName}! ✨
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
                {totalTasks - totalDone} {t('dashboard.tasksRemaining')}
              </Text>
            </div>
          </Card>

          {/* Stat Cards */}
          <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
            {stats.map((s, i) => (
              <Col xs={12} sm={6} key={s.title}>
                <Card hoverable className="stat-card" style={{ animation: `fadeIn 0.4s ease-out ${0.08 * i}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Text style={{ fontSize: 10, fontWeight: 700, color: '#8b92a5', letterSpacing: 1, display: 'block', marginBottom: 6 }}>{s.title}</Text>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1d26', lineHeight: 1, letterSpacing: '-0.5px' }}>
                        <AnimatedCounter value={s.value} />
                        {s.suffix && <span style={{ fontSize: 13, color: '#b0b7c8', fontWeight: 500, marginLeft: 2 }}>{s.suffix}</span>}
                      </div>
                    </div>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: s.color }}>{s.icon}</div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Chart */}
          <Card title={<span style={{ fontSize: 14, fontWeight: 700 }}>{t('dashboard.weeklyProductivity')}</span>} className="dashboard-card" style={{ marginBottom: 20 }}>
            <ProductivityChart tasks={allTasks} />
          </Card>

          {/* Status + Projects */}
          <Row gutter={[14, 14]}>
            <Col xs={24} md={12}>
              <Card title={<span style={{ fontSize: 14, fontWeight: 700 }}>{t('dashboard.status')}</span>} className="dashboard-card">
                {totalTasks === 0 ? <Empty description={t('dashboard.noTasks')} image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
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
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                              <Text style={{ fontSize: 13, color: '#5c6370', fontWeight: 500 }}>{label}</Text>
                            </div>
                            <Text style={{ fontSize: 13, fontWeight: 600 }}><AnimatedCounter value={count} /> <span style={{ color: '#b0b7c8', fontWeight: 400 }}>({percent}%)</span></Text>
                          </div>
                          <Progress percent={percent} strokeColor={color} trailColor="#f1f3f9" showInfo={false} size="small" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title={<span style={{ fontSize: 14, fontWeight: 700 }}>{t('dashboard.recentProjects')}</span>} className="dashboard-card">
                {projects.length === 0 ? <Empty description={t('dashboard.noProjects')} /> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {projects.slice(0, 5).map(p => (
                      <div key={p.id} className="project-card" onClick={() => navigate(`/projects/${p.id}/tasks`)}
                        style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid #e8ecf3', background: '#fafbfd', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong style={{ fontSize: 13, color: '#1a1d26' }}>{p.name}</Text>
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <Tag style={{ borderRadius: 20, background: '#eff6ff', color: '#3b82f6', border: 'none', fontWeight: 600, fontSize: 10 }}>{p.taskCount || 0} tasks</Tag>
                          </div>
                        </div>
                        <ArrowRightOutlined style={{ color: '#b0b7c8', fontSize: 12 }} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          <Card className="dashboard-card" style={{ marginBottom: 20 }}>
            <LiveClock tasks={allTasks} />
          </Card>
          <Card className="dashboard-card" title={<span style={{ fontSize: 14, fontWeight: 700 }}>{t('focus.title')}</span>}>
            <FocusTimer />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
