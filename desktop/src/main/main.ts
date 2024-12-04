import path from 'path';
import fs from 'fs';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  Menu,
  nativeTheme,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { ChildProcess, exec, execFile } from 'child_process';
import { isServerRunning, resolveHtmlPath, startServer, stopServer } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const logDir = path.join(process.cwd(), 'log');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
log.transports.file.resolvePath = () => path.join(logDir, 'app.log');

let mainWindow: BrowserWindow | null = null;
let isFullscreen : boolean = false;

// Ensure only one instance of the app is running
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit(); // Quit the app if another instance is already running
} else {
  app.on('second-instance', () => {
    // Focus the existing main window when a second instance is opened
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Rest of your app logic starts here
  nativeTheme.on('updated', () => {
    const isDarkMode = nativeTheme.shouldUseDarkColors;
    mainWindow?.webContents.send('theme-changed', isDarkMode ? 'dark' : 'light');
  });

  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: any) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

  if (process.env.NODE_ENV === 'production') {
    import('source-map-support').then((sourceMapSupport) =>
      sourceMapSupport.default.install()
    );
  }

  const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

  if (isDebug) {
    import('electron-debug').then((debug) => debug.default());
  }

  Menu.setApplicationMenu(null);

  const installExtensions = async () => {
    const {
      default: installer,
      REACT_DEVELOPER_TOOLS,
    } = await import('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = [REACT_DEVELOPER_TOOLS];

    try {
      await installer(
        extensions.map((name) => name),
        forceDownload
      );
    } catch (err) {
      console.log(err);
    }
  };

  const createWindow = async () => {
    if (isDebug) {
      await installExtensions();
    }

    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: any) => path.join(RESOURCES_PATH, ...paths);

    mainWindow = new BrowserWindow({
      show: false,
      minWidth: 1024,
      minHeight: 728,
      width: 1024,
      height: 728,
      transparent: true,
      icon: getAssetPath('icon.png'),
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        sandbox: false,
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
    });

    mainWindow.loadURL(resolveHtmlPath('index.html'));

    mainWindow.on('ready-to-show', () => {
      if (!mainWindow) throw new Error('"mainWindow" is not defined');
      if (process.env.START_MINIMIZED) mainWindow.minimize();
      else mainWindow.show();
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    mainWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });

    new AppUpdater();
  };

  app.on('before-quit', stopServer);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app
    .whenReady()
    .then(() => {
      createWindow();
      startServer();
      app.on('activate', () => {
        if (mainWindow === null) createWindow();
      });
    })
    .catch(console.log);

  ipcMain.on('window:minimize', () => mainWindow?.minimize());

  ipcMain.on('window:toggle-fullscreen', () => {
    // const isFullScreen = !mainWindow?.isFullScreen();
    // mainWindow?.setFullScreen(isFullScreen);
    // mainWindow?.webContents.send('window:fullscreen-changed', isFullScreen);
    console.log("toggle Fullscreen");
    
    if (mainWindow) {
      isFullscreen = !isFullscreen; 
      mainWindow.setFullScreen(isFullscreen);
    }
  });
  ipcMain.handle('server:check-status', async () => {
    try {
      const running = await isServerRunning();
      return { status: running ? 'running' : 'stopped', success: true ,running };
    } catch (error : any) {
      console.error('Error checking server status:', error);
      return { status: 'unknown', success: false, error: error.message };
    }
  });
  ipcMain.handle('server:start-server', async () => {
    try {
      await startServer();
      return { status: 'running' , success: true ,running:true };
    } catch (error : any) {
      console.error('Error checking server status:', error);
      return { status: 'unknown', success: false, error: error.message ,running:false};
    }
  });
  if(mainWindow){
    mainWindow.on('leave-full-screen', () => {
      isFullscreen = false;
    });
  
    mainWindow.on('enter-full-screen', () => {
      isFullscreen = true;
    });
  }

  ipcMain.on('window:close', () => mainWindow?.close());
}
