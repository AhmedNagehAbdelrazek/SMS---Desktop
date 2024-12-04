// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { startServer } from './util';

(window as any).global = window;
export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

window.api = {
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  toggleFullscreen: () => ipcRenderer.send('window:toggle-fullscreen'),
  closeWindow: () => ipcRenderer.send('window:close'),
  checkServerStatus: async () => {
    return ipcRenderer.invoke('server:check-status');
  },
  startServer : async () => {
    return ipcRenderer.invoke('server:start-server');
  },
  stopServer : async () => {
    return ipcRenderer.invoke('server:stop-server');
  },
  restartServer : async () => {
    return ipcRenderer.invoke('server:restart-server');
  },
};

console.log('Preload script loaded.');
export type ElectronHandler = typeof electronHandler;