import { useState } from 'react';
import { Form, Input, Button, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register(values);
      message.success(t('auth.registerSuccess'));
      navigate('/');
    } catch (err) {
      message.error(err.response?.data?.message || t('auth.registerFail'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8f9fb' }}>
      <div className="auth-hero" style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #635bff 30%, #3b82f6 60%, #06b6d4 100%)',
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
            {t('auth.heroRegisterTitle')}
          </Title>
          <Text style={{
            color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 1.7,
            display: 'block', maxWidth: 380,
          }}>
            {t('auth.heroRegisterSubtitle')}
          </Text>
        </div>
      </div>

      <div style={{
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 50px', background: 'white',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 36 }}>
            <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#1a1d26' }}>
              {t('auth.registerTitle')}
            </Title>
            <Text style={{ color: '#8b92a5', fontSize: 14 }}>{t('auth.registerSubtitle')}</Text>
          </div>

          <Form name="register" onFinish={onFinish} size="large" layout="vertical" requiredMark={false}>
            <Form.Item name="fullName" label={<span style={{ fontWeight: 600, color: '#1a1d26', fontSize: 13 }}>{t('auth.fullName')}</span>}
              rules={[{ required: true, message: t('auth.nameRequired') }]}>
              <Input prefix={<UserOutlined style={{ color: '#b0b7c8' }} />} placeholder="Nguyễn Văn A"
                style={{ height: 46, borderRadius: 10 }} />
            </Form.Item>
            <Form.Item name="email" label={<span style={{ fontWeight: 600, color: '#1a1d26', fontSize: 13 }}>{t('auth.email')}</span>}
              rules={[{ required: true, type: 'email', message: t('auth.emailRequired') }]}>
              <Input prefix={<MailOutlined style={{ color: '#b0b7c8' }} />} placeholder="name@company.com"
                style={{ height: 46, borderRadius: 10 }} />
            </Form.Item>
            <Form.Item name="password" label={<span style={{ fontWeight: 600, color: '#1a1d26', fontSize: 13 }}>{t('auth.password')}</span>}
              rules={[{ required: true, min: 6, message: t('auth.passwordMin') }]}>
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
                {t('auth.register')} →
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '20px 0' }}>
            <Text style={{ color: '#b0b7c8', fontSize: 12 }}>{t('common.or')}</Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#5c6370', fontSize: 13 }}>{t('auth.hasAccount')} </Text>
            <Link to="/login" style={{ color: '#635bff', fontWeight: 600, fontSize: 13 }}>{t('auth.loginNow')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
