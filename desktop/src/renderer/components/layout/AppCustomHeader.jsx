import { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { MaximizeIcon, MinimizeIcon } from '../icons';

export default function CustomHeader() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = (_, fullscreen) => {
      console.log('fullscreen', fullscreen);
      setIsFullscreen(fullscreen);
    };

    ipcRenderer.on('window:fullscreen-changed', handleFullscreenChange);

    return () => {
      ipcRenderer.removeListener('window:fullscreen-changed', handleFullscreenChange);
    };
  }, []);

  const handleMinimize = () => {
    ipcRenderer.send('window:minimize');
  };

  const handleToggleFullscreen = () => {
    ipcRenderer.send('window:toggle-fullscreen');
  };

  const handleClose = () => {
    ipcRenderer.send('window:close');
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        direction: 'rtl',
        padding: '0.5rem',
        backgroundColor: '#ECECEC',
        color: '#333',
        WebkitAppRegion: 'drag',
        height: '40px',
      }}
    >
      {/* Left Side: Mac-style buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          paddingLeft: '10px',
          WebkitAppRegion: 'no-drag', // Make buttons interactive
        }}
      >
        <div
          style={{
            width: '16px',
            aspectRatio: '1/1',
            borderRadius: '50%',
            backgroundColor: '#FF605C',
            cursor: 'pointer',
          }}
          onClick={handleClose}
        />
        <div
          style={{
            width: '16px',
            aspectRatio: '1/1',
            borderRadius: '50%',
            backgroundColor: '#FFBD44',
            cursor: 'pointer',
          }}
          onClick={handleMinimize}
        />
        <div
          style={{
            width: '16px',
            aspectRatio: '1/1',
            borderRadius: '50%',
            backgroundColor: '#00CA4E',
            cursor: 'pointer',
          }}
          onClick={handleToggleFullscreen}
        />
      </div>

      {/* Center: Title */}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333',
        }}
      >
        نظام إدارة الطلاب
      </div>

      {/* Right Side: Empty (or additional controls, if needed) */}
      <div
        style={{
          width: '60px',
        }}
      ></div>
    </div>
  );
};
