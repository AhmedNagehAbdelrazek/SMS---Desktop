import { Menu } from 'antd';
import {
  HomeOutlined,
  HomeFilled,
  TeamOutlined,
  SettingOutlined,
  SettingFilled,
  CameraFilled,
  CameraOutlined,
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
    if (path === '/' || path.match(/^\/\d+$/)) {
      setSelectedKeys(['home']);
    } else if (path.startsWith('/group')) {
      setSelectedKeys(['group']);
    } else if (path.startsWith('/settings')) {
      setSelectedKeys(['settings']);
    } else if (path.startsWith('/attendance')) {
      setSelectedKeys(['attendance']);
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
      key: 'attendance',
      icon: selectedKeys.includes('attendance') ? (
        <CameraFilled />
      ) : (
        <CameraOutlined />
      ),
      label: 'تسجيل الحضور',
      link: null, // No link, so it will be disabled
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
    <Sider
      dir="rtl"
      defaultCollapsed
      className="fixed top-14 z-[9999] right-2 bottom-2 !w-14 !min-w-[auto] rounded-xl overflow-hidden !bg-macos-light-gray shadow-sm"
    >
      <Menu
        mode="inline"
        theme="light"
        selectedKeys={selectedKeys}
        onClick={({ key }) => setSelectedKeys([key])}
        className="!bg-transparent h-full !border-r-0"
      >
        {menuItems.map((item) => (
          <Menu.Item
            key={item.key}
            icon={
              <span
                className={`transition-all ${!item.link ? 'text-macos-light-gray' : '!text-macos-icon'} ${selectedKeys.includes(item.key) ? '!text-white' : ''}`}
              >
                {item.icon}
              </span>
            }
            onClick={() => item.link && navigate(item.link)}
            disabled={!item.link}
            className={`!text-macos-text transition-all ${
              selectedKeys.includes(item.key)
                ? '!bg-macos-selected !text-white'
                : item.link != null
                  ? 'hover:!bg-macos-hover'
                  : ''
            }`}
          >
            {item.label}
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
}
