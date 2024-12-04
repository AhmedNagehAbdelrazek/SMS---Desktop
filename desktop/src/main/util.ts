/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { app } from 'electron';
import { ChildProcess, exec, execFile } from 'child_process';
const fs = require('fs');


export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

const logFile = path.join(app.getPath('userData'), 'app.txt');

export function logError(error:any) {
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${error}\n`);
}

const serverPath = path.join(process.cwd(), 'resources', 'server', 'server-win.exe');
let serverProcess: ChildProcess | null = null;

export function isServerRunning  (): Promise<boolean> {
  return new Promise((resolve) => {
    exec('netstat -an | find "65000"', (error, stdout) => {
      if (error) {
        resolve(false); // Any error in the command means we assume the server isn't running
      } else {
        resolve(stdout.includes('LISTENING'));
      }
    });
  });
};

export async function startServer  (): Promise<void> {
  const running = await isServerRunning();
  if (!running) {
    return new Promise((resolve, reject) => {
      serverProcess = execFile(serverPath, (err) => {
        if (err) {
          console.error('Error starting server:', err);
          reject(err);
        } else {
          console.log('Server started');
          resolve();
        }
      });
    });
  } else {
    console.log('Server is already running');
  }
};
export function stopServer (): void {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
    console.log('Server stopped');
  } else {
    console.log('No server process to stop');
  }
};

export function startServerIfNotRunning () {
  exec('netstat -an | find "65000"', (error, stdout) => {
    if (!stdout.includes('LISTENING')) {
      serverProcess = execFile(serverPath, (err) => {
        if (err) console.error('Error starting server:', err);
      });
      console.log('Server started');
    }
  });
};
export async function restartServer(): Promise<void> {
  stopServer();
  await startServer();
};

