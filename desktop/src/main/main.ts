/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import {
  Menu,
} from 'electron';
import { resolveHtmlPath } from './util';
import { exec, execFile } from 'child_process'
// import server from '../../release/app/backend/server';
import fs from 'fs';
class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const logDir = path.join(process.cwd(), 'log');
if (!fs.existsSync(logDir)){
  fs.mkdirSync(logDir);
}
log.transports.file.resolvePath = () => path.join(logDir, 'app.log');


let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

Menu.setApplicationMenu(null);

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 1024,
    minHeight: 728,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox:false, 
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
  // mainWindow.webContents.openDevTools();
  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

const serverPath = path.join(process.resourcesPath, 'resources' ,'server', 'server-win.exe');
// const serverPath = "C:\\Users\\Ahmed Medo\\Desktop\\New folder\\SMS---Desktop\\release\\build\\win-unpacked\\resources\\resources\\server\\server-win.exe";

let serverProcess:any;

function startServerIfNotRunning() {

  exec('netstat -an | find "3000"', (error, stdout, stderr) => {
      console.log("result", stdout.length);
      if (!stdout.includes('LISTENING')) {
          serverProcess = execFile(`${serverPath}`, (error) => {
            if (error) {
              console.error('Error starting server:', error);
            }
        });
        console.log('Server started');
      }
  });
}

function stopServer() {
  if (serverProcess) {
      serverProcess.kill(); // Terminate the server process
  }
}

/**
 * Add event listeners...
 */
app.on("before-quit",()=>{
  stopServer();
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app
  .whenReady()
  .then(() => {
    createWindow();
    startServerIfNotRunning();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);


ipcMain.on('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window:toggle-fullscreen', (func) => {
  const isFullScreen = !mainWindow?.isFullScreen();
  mainWindow?.setFullScreen(isFullScreen);
  // Notify renderer about the fullscreen state change
  mainWindow?.webContents.send('window:fullscreen-changed', isFullScreen);
});

ipcMain.on('window:close', () => {
  mainWindow?.close();
});

