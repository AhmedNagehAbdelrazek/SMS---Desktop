import { Menu, Spin, Tooltip } from 'antd';
import {
  HomeOutlined,
  HomeFilled,
  TeamOutlined,
  SettingOutlined,
  SettingFilled,
  CameraFilled,
  CameraOutlined,
  PaperClipOutlined,
  HighlightOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sider from 'antd/es/layout/Sider';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState(['home']);
  const [serverStatus, setServerStatus] = useState(false);
  const [serverCheckInterval,setServerCheckInterval] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const interval = setInterval( async () => {
      const serverstatus = await window.api.checkServerStatus();
      setServerStatus(serverstatus.running);
      if(loading && serverstatus.running){
        setLoading(false);
      }
    }, 1000);
    if(!serverCheckInterval){
      setServerCheckInterval(interval);
    }
    return (()=>{
      if(serverCheckInterval){
        clearInterval(serverCheckInterval);
        setServerCheckInterval(null);
      }
    })
  }, []);
  const handleServerBackUp = () => {
    if(!serverStatus){
      setLoading(true);
      window.api.startServer().then((data)=>{
        console.log(data);
        console.log("server started");
        setLoading(false);
      }).catch((error)=>{
        console.log(error);
      });
    }
  }

  const menuItems = [
    {
      key: 'home',
      icon: selectedKeys.includes('home') ? (
        <HomeFilled className="flex" />
      ) : (
        <HomeOutlined />
      ),
      label: 'الصفحة الرئيسية',
      link: '/',
    },
    {
      key: 'group',
      icon: <TeamOutlined className="!flex" />,
      label: 'إدارة المجموعات',
      link: '/group',
    },
    {
      key: 'attendance',
      icon: selectedKeys.includes('attendance') ? (
        <CameraFilled className="!flex" />
      ) : (
        <CameraOutlined className="!flex" />
      ),
      label: 'تسجيل الحضور',
      link: '/attendance',
    },
    {
      key: 'lectureExam',
      icon: <HighlightOutlined className="!flex" />,
      label: 'امتحان الحصه',
      link: '/lectureExam',
    },
    {
      key: 'exam',
      icon: <PaperClipOutlined className="!flex" />,
      label: 'أمتحان الشهر',
      link: '/exam',
    },
    {
      key: 'settings',
      icon: selectedKeys.includes('settings') ? (
        <SettingFilled className="!flex" />
      ) : (
        <SettingOutlined className="!flex" />
      ),
      label: 'السجل',
      link: '/settings', // No link, so it will be disabled
    },
  ];

  return (
    <Sider
      dir="rtl"
      defaultCollapsed
      className="fixed top-14 z-[9999] right-2 bottom-2 !w-14 !min-w-[auto] rounded-xl overflow-hidden !bg-macos-light-gray shadow-sm"
    >
      <div className="h-full flex flex-col justify-between items-center gap-1">
        <Menu
          mode="inline"
          theme="light"
          selectedKeys={selectedKeys}
          onClick={({ key }) => setSelectedKeys([key])}
          className="!bg-transparent !border-r-0"
        >
          {menuItems.map((item) => (
            <Menu.Item
              key={item.key}
              icon={
                <span
                  className={`transition-all flex justify-center items-center ${!item.link ? 'text-macos-light-gray' : '!text-macos-icon'} ${selectedKeys.includes(item.key) ? '!text-white' : ''}`}
                >
                  {item.icon}
                </span>
              }
              onClick={() => item.link && navigate(item.link)}
              disabled={!item.link}
              className={`!text-macos-text transition-all  ${
                selectedKeys.includes(item.key)
                  ? '!bg-macos-selected !text-white rounded-full w-[90%]'
                  : item.link != null
                    ? 'hover:!bg-macos-hover'
                    : ''
              }`}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
        <div className="flex wi-full justify-center items-center">
        <Tooltip title="Server Status" rootClassName='!z-[9999]' >
          <div
            className={`w-4 h-4 m-4 rounded-full cursor-pointer flex justify-center items-center ${serverStatus ? 'bg-green-500' : 'bg-red-700'} `}
            onClick={handleServerBackUp}
          >
            {loading && <Spin indicator={<LoadingOutlined style={{ fontSize: 9 , color: 'white'}} spin />} size="small" />}
          </div>
        </Tooltip>
        </div>
      </div>
    </Sider>
  );
}
