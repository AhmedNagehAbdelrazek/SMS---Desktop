import { ipcRenderer } from 'electron';

export default function CustomHeader() {
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
    <div className="flex items-center shadow-sm justify-between fixed rounded-lg left-2 z-[9999] right-2 top-2 rtl p-4 bg-macos-light-gray text-macos-text h-10" style={{ WebkitAppRegion: 'drag' }}>
      {/* Left Side: Mac-style buttons */}
      <div className="flex gap-2 pl-2" style={{ WebkitAppRegion: 'no-drag' }}>
        <div
          className="w-4 h-4 rounded-full bg-red-500 cursor-pointer"
          onClick={handleClose}
        />
        <div
          className="w-4 h-4 rounded-full bg-yellow-500 cursor-pointer"
          onClick={handleMinimize}
        />
        <div
          className="w-4 h-4 rounded-full bg-green-500 cursor-pointer"
          onClick={handleToggleFullscreen}
        />
      </div>

      {/* Center: Title */}
      <div className="flex-1 text-center text-sm font-bold text-macos-text">
        نظام إدارة الطلاب
      </div>

      {/* Right Side: Empty (or additional controls, if needed) */}
      <div className="w-15"></div>
    </div>
  );
}
