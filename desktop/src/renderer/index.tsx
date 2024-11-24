import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './shared/RTK/store';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#007aff', // macOS blue accent
        colorBgBase: '#f5f5f7', // macOS light gray background
        colorBgContainer: '#ffffff', // macOS white containers
        colorText: '#000000', // macOS black text
        borderRadius: 12, // Rounded corners
        paddingMD: 16, // macOS padding
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)', // Subtle shadow
      },
    }}
  >
    <Provider store={store}>
      <App />
    </Provider>
  </ConfigProvider>
);
