import { Layout, Menu } from 'antd';
import {
  FileTextOutlined,
  HomeOutlined,
  AppstoreOutlined,
  UserOutlined,
  CrownOutlined,
  ProjectOutlined,
  ShoppingOutlined,
  SoundOutlined,
  BookOutlined,
  CalendarOutlined,
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
      key: '/coptic',
      icon: <BookOutlined />,
      label: t('navigation.coptic'),
      onClick: () => navigate('/coptic'),
    },
    {
      key: '/monks',
      icon: <UserOutlined />,
      label: t('navigation.monks'),
      onClick: () => navigate('/monks'),
    },
    {
      key: '/saints',
      icon: <CrownOutlined />,
      label: t('navigation.saints'),
      onClick: () => navigate('/saints'),
    },
    {
      key: '/articles',
      icon: <FileTextOutlined />,
      label: t('navigation.articles'),
      onClick: () => navigate('/articles'),
    },
    {
      key: '/events',
      icon: <CalendarOutlined />,
      label: t('navigation.events'),
      onClick: () => navigate('/events'),
    },
    {
      key: '/entities',
      icon: <HomeOutlined />,
      label: t('navigation.entities'),
      onClick: () => navigate('/entities'),
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: t('navigation.projects'),
      onClick: () => navigate('/projects'),
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: t('navigation.products'),
      onClick: () => navigate('/products'),
    },
    {
      key: '/sermons',
      icon: <SoundOutlined />,
      label: t('navigation.sermons'),
      onClick: () => navigate('/sermons'),
    },
  ];

  const getSelectedKey = () => {
    const pathname = location.pathname;

    const exactMatch = menuItems.find((item) => item.key === pathname);
    if (exactMatch) return exactMatch.key;

    for (const item of menuItems) {
      if (pathname.startsWith(item.key + '/')) {
        return item.key;
      }
    }

    return null;
  };

  const selectedKey = getSelectedKey();

  return (
    <>
      <style>{`
        .church-sidebar {
          --sidebar-bg: #F9F5EE;
          --sidebar-item-hover: rgba(107, 26, 26, 0.06);
          --sidebar-item-selected: #6B1A1A;
          --sidebar-item-selected-strong: #6B1A1A;
          --sidebar-text: rgba(107, 26, 26, 0.88);
          --sidebar-text-strong: #6B1A1A;
          --sidebar-text-on-selected: #ffffff;
          --sidebar-divider: rgba(107, 26, 26, 0.10);
        }
        .church-sidebar .sidebar-scrollable-menu {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0 0 12px;
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 26, 26, 0.25) transparent;
        }
        .church-sidebar .sidebar-scrollable-menu::-webkit-scrollbar {
          width: 6px;
        }
        .church-sidebar .sidebar-scrollable-menu::-webkit-scrollbar-thumb {
          background: rgba(107, 26, 26, 0.25);
          border-radius: 999px;
        }
        .church-sidebar .sidebar-scrollable-menu::-webkit-scrollbar-track {
          background: transparent;
        }
        .church-sidebar .ant-menu {
          background: var(--sidebar-bg) !important;
        }
        .church-sidebar .ant-menu-item {
          height: 44px;
          line-height: 44px;
          border-radius: 10px;
          margin: 4px 10px;
          width: calc(100% - 20px);
          color: var(--sidebar-text) !important;
          transition: background-color 0.18s ease, color 0.18s ease;
        }
        .church-sidebar .ant-menu-item .anticon {
          color: var(--sidebar-text) !important;
          transition: color 0.18s ease;
        }
        .church-sidebar .ant-menu-item:not(.ant-menu-item-selected):hover {
          background-color: var(--sidebar-item-hover) !important;
          color: var(--sidebar-text-strong) !important;
        }
        .church-sidebar .ant-menu-item:not(.ant-menu-item-selected):hover .anticon {
          color: var(--sidebar-text-strong) !important;
        }
        .church-sidebar .ant-menu-item-selected {
          background-color: var(--sidebar-item-selected) !important;
          color: var(--sidebar-text-on-selected) !important;
          position: relative;
        }
        .church-sidebar .ant-menu-item-selected::before {
          content: "";
          position: absolute;
          inset-block: 10px;
          inset-inline-start: 0;
          width: 3px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.85);
        }
        .church-sidebar .ant-menu-item-selected:hover {
          background-color: var(--sidebar-item-selected-strong) !important;
          color: var(--sidebar-text-on-selected) !important;
        }
        .church-sidebar .ant-menu-item-selected:hover .anticon {
          color: var(--sidebar-text-on-selected) !important;
        }
        .church-sidebar .ant-menu-item-selected .anticon {
          color: var(--sidebar-text-on-selected) !important;
        }
        ${isRTL ? `
          .church-sidebar .ant-menu-item-selected {
            color: #ffffff !important;
          }
          .church-sidebar .ant-menu-item-selected .anticon {
            color: #ffffff !important;
          }
          .church-sidebar .ant-menu-item-selected::before {
            inset-inline-start: auto;
            inset-inline-end: 0;
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
          background: '#F9F5EE',
          height: '100dvh',
          position: 'fixed',
          [isRTL ? 'right' : 'left']: 0,
          top: 0,
          zIndex: 100,
          borderRight: '1px solid rgba(107,26,26,0.10)',
        }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: collapsed ? '18px 0 14px' : '22px 0 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#F9F5EE',
              borderBottom: '1px solid rgba(107,26,26,0.10)',
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
                filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.12))',
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
                background: '#F9F5EE',
              }}
            />
          </div>

          <div
            style={{
              padding: '12px',
              textAlign: 'center',
              fontSize: '10px',
              color: 'rgba(107,26,26,0.55)',
              borderTop: '1px solid rgba(107,26,26,0.08)',
            }}
          >
            {collapsed ? 'K' : 'Developed by Kinetics'}
          </div>
        </div>
      </Sider>
    </>
  );
}
