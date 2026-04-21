import { useState } from 'react';
import { Form, Input, Button, Typography, message, Divider } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values);
      message.success(t('auth.loginSuccess'));
      navigate('/');
    } catch (err) {
      message.error(err.response?.data?.message || t('auth.loginFail'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8f9fb' }}>
      {/* LEFT — Animated Gradient Mesh */}
      <div className="auth-hero" style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 30%, #06b6d4 60%, #3b82f6 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 50px',
      }}>
        <div className="floating-shape shape-1" />
        <div className="floating-shape shape-2" />
        <div className="floating-shape shape-3" />
        <div className="floating-shape shape-4" />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>TF</span>
            </div>
            <span style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>TaskFlow</span>
          </div>

          <Title style={{
            color: 'white', fontSize: 42, fontWeight: 800,
            lineHeight: 1.2, letterSpacing: '-1px', marginBottom: 16,
            whiteSpace: 'pre-line',
          }}>
            {t('auth.heroTitle')}
          </Title>
          <Text style={{
            color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 1.7,
            display: 'block', maxWidth: 380,
          }}>
            {t('auth.heroSubtitle')}
          </Text>

          <div style={{ display: 'flex', gap: 8, marginTop: 32, flexWrap: 'wrap' }}>
            {['📋 Kanban Board', '⏱️ Focus Timer', '📊 Analytics', '📅 Calendar'].map(f => (
              <span key={f} style={{
                padding: '8px 16px', borderRadius: 100,
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                color: 'white', fontSize: 13, fontWeight: 500,
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div style={{
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 50px', background: 'white',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 36 }}>
            <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#1a1d26', letterSpacing: '-0.5px' }}>
              {t('auth.welcomeBack')}
            </Title>
            <Text style={{ color: '#8b92a5', fontSize: 14 }}>{t('auth.loginSubtitle')}</Text>
          </div>

          <Form name="login" onFinish={onFinish} size="large" layout="vertical" requiredMark={false}>
            <Form.Item name="email" label={<span style={{ fontWeight: 600, color: '#1a1d26', fontSize: 13 }}>{t('auth.email')}</span>}
              rules={[{ required: true, type: 'email', message: t('auth.emailRequired') }]}>
              <Input prefix={<MailOutlined style={{ color: '#b0b7c8' }} />} placeholder="name@company.com"
                style={{ height: 46, borderRadius: 10 }} />
            </Form.Item>
            <Form.Item name="password" label={<span style={{ fontWeight: 600, color: '#1a1d26', fontSize: 13 }}>{t('auth.password')}</span>}
              rules={[{ required: true, message: t('auth.passwordRequired') }]}>
              <Input.Password prefix={<LockOutlined style={{ color: '#b0b7c8' }} />} placeholder="••••••••"
                style={{ height: 46, borderRadius: 10 }} />
            </Form.Item>
            <Form.Item style={{ marginBottom: 20 }}>
              <Button type="primary" htmlType="submit" loading={loading} block
                style={{
                  height: 48, fontWeight: 700, fontSize: 15, borderRadius: 12,
                  background: 'linear-gradient(135deg, #635bff, #8b5cf6)',
                  boxShadow: '0 6px 20px rgba(99, 91, 255, 0.3)',
                }}>
                {t('auth.login')} →
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '20px 0' }}>
            <Text style={{ color: '#b0b7c8', fontSize: 12 }}>{t('common.or')}</Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#5c6370', fontSize: 13 }}>{t('auth.noAccount')} </Text>
            <Link to="/register" style={{ color: '#635bff', fontWeight: 600, fontSize: 13 }}>
              {t('auth.registerNow')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
