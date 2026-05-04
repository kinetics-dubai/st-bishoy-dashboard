import { Layout } from 'antd';
import Header from './Header';

const { Content } = Layout;

export default function AppLayout({ collapsed, setCollapsed, children }) {
  const changeCollapsed = () => {
    setCollapsed(!collapsed);
  };
  return (
    <Layout className="min-h-screen w-full flex flex-row" style={{ background: '#f6f1e7', minWidth: 0 }}>
      <div className="flex flex-col flex-1" style={{ width: '100%', minWidth: 0 }}>
        <Header collapsed={collapsed} onCollapse={changeCollapsed} />

        <Content
          className="m-4 md:m-6"
          style={{
            transition: 'margin-left 0.2s',
            minWidth: 0,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              minHeight: 'calc(100vh - 120px)',
              minWidth: 0,
              overflowX: 'hidden',
              // padding: '24px'
            }}
          >
            {children}
          </div>
        </Content>
      </div>
    </Layout>
  );
}
