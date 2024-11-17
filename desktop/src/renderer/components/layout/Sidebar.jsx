import { Menu } from 'antd';
import {
  HomeOutlined,
  HomeFilled,
  TeamOutlined,
  SettingOutlined,
  SettingFilled,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sider from 'antd/es/layout/Sider';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState(['home']);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setSelectedKeys(['home']);
    } else if (path.startsWith('/group')) {
      setSelectedKeys(['group']);
    } else if (path.startsWith('/settings')) {
      setSelectedKeys(['settings']);
    }
  }, [location.pathname]);

  const menuItems = [
    {
      key: 'home',
      icon: selectedKeys.includes('home') ? <HomeFilled /> : <HomeOutlined />,
      label: 'الصفحة الرئيسية',
      link: '/',
    },
    {
      key: 'group',
      icon: <TeamOutlined />,
      label: 'إدارة المجموعات',
      link: '/group',
    },
    {
      key: 'settings',
      icon: selectedKeys.includes('settings') ? (
        <SettingFilled />
      ) : (
        <SettingOutlined />
      ),
      label: 'الإعدادات',
      link: null, // No link, so it will be disabled
    },
  ];

  return (
    <Sider collapsible defaultCollapsed theme="light" dir='rtl' reverseArrow>
      <Menu
        mode="inline"
        theme="light"
        selectedKeys={selectedKeys}
        onClick={({ key }) => setSelectedKeys([key])}
        style={{ height: '100%', borderRight: 0 }}
      >
        {menuItems.map((item) => (
          <Menu.Item
            key={item.key}
            icon={item.icon}
            onClick={() => item.link && navigate(item.link)}
            disabled={!item.link}
          >
            {item.label}
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
}
