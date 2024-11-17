import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { CustomHeader, Sidebar } from '../components/layout';

const { Content } = Layout;

export default function AppLayout() {
  return (
    <Layout style={{ minHeight: '100vh', direction: 'rtl' }}>
      {/* Add the custom header */}
      <CustomHeader />
      <Layout>
        <Sidebar />
        <Content style={{ margin: '16px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
