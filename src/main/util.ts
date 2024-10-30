/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { app } from 'electron';
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
