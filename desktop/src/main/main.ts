/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside Electron's main process. You can start
 * the Electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack for better performance.
 */

import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain, dialog, Menu, nativeTheme } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { exec, execFile } from 'child_process';
import { resolveHtmlPath } from './util';

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

let mainWindow = null;

// Set up dark mode listener
nativeTheme.on('updated', () => {
  const isDarkMode = nativeTheme.shouldUseDarkColors;
  mainWindow?.webContents.send('theme-changed', isDarkMode ? 'dark' : 'light');
});

// IPC event handlers
ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

// Dynamic imports for conditional modules
if (process.env.NODE_ENV === 'production') {
  import('source-map-support').then((sourceMapSupport) => sourceMapSupport.default.install());
}

const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  import('electron-debug').then((debug) => debug.default());
}

Menu.setApplicationMenu(null);

// Install extensions dynamically
const installExtensions = async () => {
  const { default: installer, REACT_DEVELOPER_TOOLS } = await import('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [REACT_DEVELOPER_TOOLS];

  try {
    await installer(extensions.map((name) => name), forceDownload);
  } catch (err) {
    console.log(err);
  }
};

// Create the main window
const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths :any) => path.join(RESOURCES_PATH, ...paths);

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
      preload: path.join(__dirname, 'preload.js')
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

// Server management
const serverPath = path.join(process.cwd(), 'resources', 'server', 'server-win.exe');
let serverProcess;

const startServerIfNotRunning = () => {
  exec('netstat -an | find "65000"', (error, stdout) => {
    if (!stdout.includes('LISTENING')) {
      serverProcess = execFile(serverPath, (err) => {
        if (err) console.error('Error starting server:', err);
      });
      console.log('Server started');
    }
  });
};

const stopServer = () => {
  if (serverProcess) serverProcess.kill();
};

// App event listeners
app.on('before-quit', stopServer);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app
  .whenReady()
  .then(() => {
    createWindow();
    startServerIfNotRunning();
    app.on('activate', () => {
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

// IPC event handlers for window control
ipcMain.on('window:minimize', () => mainWindow?.minimize());

ipcMain.on('window:toggle-fullscreen', () => {
  const isFullScreen = !mainWindow?.isFullScreen();
  mainWindow?.setFullScreen(isFullScreen);
  mainWindow?.webContents.send('window:fullscreen-changed', isFullScreen);
});

ipcMain.on('window:close', () => mainWindow?.close());
