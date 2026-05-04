import { Layout, Dropdown, Avatar, Typography, Button, Select } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/providers/AuthProvider';
import { useDirection } from '@/hooks/useDirection';
import logo from '/assets/logo.png';
import { useTranslation } from 'react-i18next';

const { Header: AntHeader } = Layout;
const { Text } = Typography;
const { Option } = Select;

export default function Header({ collapsed, onCollapse }) {
  const { user, logout } = useAuth();
  const { language, changeLanguage } = useDirection();
  const { t } = useTranslation();
  
  // Profile dropdown menu items
  const profileMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{user?.email}</div>
          {/* <div style={{ fontSize: '12px', color: '#f6f1e7', marginTop: '4px' }}>{user?.role || 'User'}</div> */}
        </div>
      ),
    },
    {
      type: 'divider',
    },
    // {
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: 'Settings',
    // },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <AntHeader 
      style={{ 
        background: '#ffffff', 
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        transition: 'margin-left 0.2s'
      }}
    >
      {/* Left side - Collapse Button and Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Collapse Button */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onCollapse}
          style={{
            fontSize: '16px',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5C1A1B'
          }}
        />
        
        <div className="hidden md:block">
          <Text strong style={{ fontSize: '18px', color: '#5C1A1B' }}>{t('header.title')}</Text>
        </div>
      </div>

      {/* Right side - Language Selector + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Language Selector */}
        <Select
          value={language}
          onChange={changeLanguage}
          style={{ width: 80 }}
          bordered={false}
          dropdownMatchSelectWidth={false}
          suffixIcon={<GlobalOutlined style={{ color: '#5C1A1B' }} />}
        >
          <Option value="en">EN</Option>
          <Option value="ar">AR</Option>
        </Select>

        {/* Profile Dropdown */}
        <Dropdown
          menu={{ items: profileMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <button 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px',
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              // transition: 'background 0.3s'
            }}
          >
            <Avatar
              size="default"
              icon={<UserOutlined />}
              style={{ background: '#5C1A1B' }}
            />
          </button>
        </Dropdown>
      </div>
    </AntHeader>
  );
}
