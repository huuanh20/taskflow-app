import { Layout, Menu, Avatar, Dropdown, Button, Typography, Segmented } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, ProjectOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined, SettingOutlined, GlobalOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { lang, switchLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: t('nav.dashboard') },
    { key: '/projects', icon: <ProjectOutlined />, label: t('nav.projects') },
  ];

  const avatarMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: t('common.logout'), danger: true, onClick: logout },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          background: '#fafbfd',
          borderRight: '1px solid #e8ecf3',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo + Brand */}
        <div style={{
          padding: collapsed ? '20px 12px' : '20px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid #e8ecf3',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #635bff, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>TF</span>
          </div>
          {!collapsed && (
            <div>
              <Text strong style={{ fontSize: 15, display: 'block', lineHeight: 1.2 }}>TaskFlow</Text>
              <Text style={{ fontSize: 11, color: '#8b92a5' }}>{t('nav.workspace')}</Text>
            </div>
          )}
        </div>

        {/* Search (if not collapsed) */}
        {!collapsed && (
          <div style={{ padding: '12px 16px 4px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 8,
              background: '#f1f3f9',
              color: '#8b92a5',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <SearchOutlined style={{ fontSize: 14 }} />
              <span>{t('common.search')}</span>
            </div>
          </div>
        )}

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', padding: '8px 8px' }}
        />

        {/* Settings at bottom */}
        {!collapsed && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '12px 16px',
            borderTop: '1px solid #e8ecf3',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 4px',
              cursor: 'pointer',
              borderRadius: 8,
            }}>
              <SettingOutlined style={{ color: '#8b92a5', fontSize: 14 }} />
              <Text style={{ color: '#8b92a5', fontSize: 13 }}>{t('common.settings')}</Text>
            </div>
          </div>
        )}
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.25s ease' }}>
        <Header style={{
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          height: 56,
          lineHeight: '56px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e8ecf3',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, color: '#5c6370' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Language Toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f1f3f9', borderRadius: 8, padding: '2px 3px',
              height: 32,
            }}>
              <button
                onClick={() => switchLang('vi')}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none',
                  background: lang === 'vi' ? 'white' : 'transparent',
                  boxShadow: lang === 'vi' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  color: lang === 'vi' ? '#635bff' : '#8b92a5',
                  fontWeight: lang === 'vi' ? 700 : 500,
                  fontSize: 12, cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, sans-serif',
                }}>
                🇻🇳 VI
              </button>
              <button
                onClick={() => switchLang('en')}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none',
                  background: lang === 'en' ? 'white' : 'transparent',
                  boxShadow: lang === 'en' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  color: lang === 'en' ? '#635bff' : '#8b92a5',
                  fontWeight: lang === 'en' ? 700 : 500,
                  fontSize: 12, cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, sans-serif',
                }}>
                🇬🇧 EN
              </button>
            </div>

            {/* User Avatar */}
            <Dropdown menu={avatarMenu} placement="bottomRight">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer', padding: '4px 8px', borderRadius: 8,
                transition: 'background 0.2s',
              }}>
                <Avatar
                  size={32}
                  style={{
                    background: 'linear-gradient(135deg, #635bff, #8b5cf6)',
                    fontWeight: 600, fontSize: 13,
                  }}
                >
                  {user?.fullName?.charAt(0) || 'U'}
                </Avatar>
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#1a1d26' }}>
                  {user?.fullName}
                </Text>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: '24px', minHeight: 'calc(100vh - 104px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
