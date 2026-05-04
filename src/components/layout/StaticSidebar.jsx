import { Layout, Menu } from 'antd';
import {
  BarChartOutlined,
  FileTextOutlined,
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  TagOutlined,
  QuestionCircleOutlined,
  UsergroupAddOutlined,
  CrownOutlined,
  BookOutlined,
  SettingOutlined,
  AuditOutlined,
  StarOutlined,
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
      key: '/',
      icon: <BarChartOutlined />,
      label: t('navigation.dashboard'),
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/users',
      icon: <UsergroupAddOutlined />,
      label: t('navigation.users'),
      onClick: () => navigate('/users'),
    },
    {
      key: '/papal-decisions',
      icon: <CrownOutlined />,
      label: t('navigation.papalDecisions'),
      onClick: () => navigate('/papal-decisions'),
    },
    {
      key: '/magazines',
      icon: <BookOutlined />,
      label: t('navigation.magazines'),
      onClick: () => navigate('/magazines'),
    },
    {
      key: '/clerics',
      icon: <UserOutlined />,
      label: t('navigation.clerics'),
      onClick: () => navigate('/clerics'),
    },
    {
      key: '/committees',
      icon: <TeamOutlined />,
      label: t('navigation.committees'),
      onClick: () => navigate('/committees'),
    },
    {
      key: '/tags',
      icon: <TagOutlined />,
      label: t('navigation.tags'),
      onClick: () => navigate('/tags'),
    },
    {
      key: '/bible',
      icon: <BookOutlined />,
      label: t('navigation.bible'),
      onClick: () => navigate('/bible'),
    },
    {
      key: '/ask-the-pope',
      icon: <QuestionCircleOutlined />,
      label: t('navigation.askThePope'),
      onClick: () => navigate('/ask-the-pope'),
    },
    {
      key: '/portal-suggestions',
      icon: <QuestionCircleOutlined />,
      label: t('navigation.portalSuggestions'),
      onClick: () => navigate('/portal-suggestions'),
    },
    {
      key: '/synaxarium',
      icon: <CalendarOutlined />,
      label: t('navigation.synaxarium'),
      onClick: () => navigate('/synaxarium'),
    },
    {
      key: '/saints',
      icon: <StarOutlined />,
      label: t('navigation.saints'),
      onClick: () => navigate('/saints'),
    },
    {
      key: '/faqs',
      icon: <QuestionCircleOutlined />,
      label: t('navigation.faqs'),
      onClick: () => navigate('/faqs'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('navigation.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      key: '/logs',
      icon: <AuditOutlined />,
      label: t('navigation.logs'),
      onClick: () => navigate('/logs'),
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

  // Get the selected key based on current location
  const getSelectedKey = () => {
    const pathname = location.pathname;

    // Handle dashboard redirect
    if (pathname === '/' || pathname === '/dashboard') {
      return '/';
    }

    // Find exact match or parent match
    const exactMatch = menuItems.find(item => item.key === pathname);
    if (exactMatch) return exactMatch.key;

    // For nested routes, find parent
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
        .church-sidebar .sidebar-footer {
          margin: 12px 16px 16px;
          padding: ${collapsed ? '10px 8px' : '14px 16px'};
          border: 1px solid rgba(183, 136, 79, 0.25);
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(255, 248, 238, 0.92));
          box-shadow: 0 10px 24px rgba(92, 26, 27, 0.08);
          color: #5C1A1B;
          text-align: ${collapsed ? 'center' : 'start'};
        }
        .church-sidebar .sidebar-footer-label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(92, 26, 27, 0.6);
          margin-bottom: 4px;
        }
        .church-sidebar .sidebar-footer-brand {
          display: block;
          font-size: ${collapsed ? '11px' : '13px'};
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #5C1A1B;
        }
        .church-sidebar .sidebar-footer-note {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          color: rgba(92, 26, 27, 0.72);
          line-height: 1.4;
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
          <div style={{
            padding: '20px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f6f1e7',
          }}>
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

          <div style={{
            padding: '12px',
            textAlign: 'center',
            fontSize: '10px',
            color: '#999'
          }}>
            {collapsed ? 'K' : 'Developed by Kinetics'}
          </div>
        </div>
      </Sider>
    </>
  );
}
