import { Layout, Menu } from 'antd';
import {
  BarChartOutlined,
  FileTextOutlined,
  HomeOutlined,
  AppstoreOutlined,
  UserOutlined,
  TagOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import logo from '/assets/logo.png';

const { Sider } = Layout;

export default function StaticSidebar({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { direction } = useSelector((state) => state.auth);
  const isRTL = direction === 'rtl';

  const menuItems = [
    {
      key: '/',
      icon: <BarChartOutlined />,
      label: t('navigation.dashboard'),
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/home',
      icon: <AppstoreOutlined />,
      label: t('navigation.home'),
      onClick: () => navigate('/home'),
    },
    {
      key: '/monastery',
      icon: <HomeOutlined />,
      label: t('navigation.monastery'),
      onClick: () => navigate('/monastery'),
    },
    {
      key: '/users',
      icon: <UsergroupAddOutlined />,
      label: t('navigation.users'),
      onClick: () => navigate('/users'),
    },
    {
      key: '/monks',
      icon: <UserOutlined />,
      label: t('navigation.monks'),
      onClick: () => navigate('/monks'),
    },
    {
      key: '/tags',
      icon: <TagOutlined />,
      label: t('navigation.tags'),
      onClick: () => navigate('/tags'),
    },
    {
      key: '/saints',
      icon: <CrownOutlined />,
      label: t('navigation.saints'),
      onClick: () => navigate('/saints'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('navigation.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      key: '/articles',
      icon: <FileTextOutlined />,
      label: t('navigation.articles'),
      onClick: () => navigate('/articles'),
    },
    {
      key: '/entities',
      icon: <HomeOutlined />,
      label: t('navigation.entities'),
      onClick: () => navigate('/entities'),
    },
  ];

  const getSelectedKey = () => {
    const pathname = location.pathname;

    if (pathname === '/' || pathname === '/dashboard') {
      return '/';
    }

    const exactMatch = menuItems.find((item) => item.key === pathname);
    if (exactMatch) return exactMatch.key;

    for (const item of menuItems) {
      if (pathname.startsWith(item.key + '/') && item.key !== '/') {
        return item.key;
      }
    }

    return null;
  };

  const selectedKey = getSelectedKey();

  return (
    <>
      <style>{`
        .church-sidebar .sidebar-scrollable-menu {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0 0 12px;
          scrollbar-width: thin;
          scrollbar-color: rgba(92, 26, 27, 0.35) transparent;
        }
        .church-sidebar .sidebar-scrollable-menu::-webkit-scrollbar {
          width: 6px;
        }
        .church-sidebar .sidebar-scrollable-menu::-webkit-scrollbar-thumb {
          background: rgba(92, 26, 27, 0.35);
          border-radius: 999px;
        }
        .church-sidebar .sidebar-scrollable-menu::-webkit-scrollbar-track {
          background: transparent;
        }
        .church-sidebar .ant-menu-dark .ant-menu-item-selected {
          background-color: #5C1A1B !important;
          color: #ffffff !important;
        }
        .church-sidebar .ant-menu-dark .ant-menu-item-selected .anticon {
          color: #ffffff !important;
        }
        .church-sidebar .ant-menu-item {
          color: #333 !important;
        }
        .church-sidebar .ant-menu-item:hover {
          background-color: #e8e0d0 !important;
          color: #5C1A1B !important;
        }
        .church-sidebar .ant-menu-item:hover .anticon {
          color: #5C1A1B !important;
        }
        ${isRTL ? `
          .church-sidebar .ant-menu-item-selected {
            color: #ffffff !important;
          }
          .church-sidebar .ant-menu-item-selected .anticon {
            color: #ffffff !important;
          }
        ` : ''}
      `}</style>
      <Sider
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={80}
        width={270}
        className="church-sidebar"
        style={{
          background: '#f6f1e7',
          height: '100dvh',
          position: 'fixed',
          [isRTL ? 'right' : 'left']: 0,
          top: 0,
          zIndex: 100,
          borderRight: '1px solid white',
        }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '20px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f6f1e7',
            }}
          >
            <img
              src={logo}
              alt="Church Logo"
              style={{
                width: collapsed ? '40px' : '60px',
                height: collapsed ? '40px' : '60px',
                objectFit: 'contain',
                transition: 'all 0.2s',
              }}
            />
          </div>

          <div className="sidebar-scrollable-menu">
            <Menu
              mode="inline"
              selectedKeys={selectedKey ? [selectedKey] : []}
              items={menuItems}
              style={{
                border: 0,
                background: '#f6f1e7',
              }}
            />
          </div>

          <div
            style={{
              padding: '12px',
              textAlign: 'center',
              fontSize: '10px',
              color: '#999',
            }}
          >
            {collapsed ? 'K' : 'Developed by Kinetics'}
          </div>
        </div>
      </Sider>
    </>
  );
}
