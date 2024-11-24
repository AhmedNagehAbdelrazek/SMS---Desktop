import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { CustomHeader, Sidebar } from '../components/layout';

const { Content } = Layout;

export default function AppLayout() {
  return (
    <Layout className='min-h-dvh relative min-w-[100dvw] [direction:rtl]' >
      <CustomHeader />
      <Layout>
        <Sidebar />
        <Content className='absolute left-2 bottom-2 !w-[calc(100%-5rem)] overflow-hidden shadow-sm !h-[calc(100%-4rem)] rounded-lg bg-macos-light-gray flex justify-center items-center'>
          <div className='w-full h-full py-2 overflow-auto'>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
