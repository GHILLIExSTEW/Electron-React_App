const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let services = [null, null, null];
let logFiles = [null, null, null];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.loadURL(
    process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, '../dist/index.html')}`
  );
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Service management
ipcMain.handle('service-control', async (event, { action, index, scriptPath }) => {
  if (action === 'start') {
    if (services[index]) return { status: 'already running' };
    const python = process.env.PYTHON_PATH || 'python';
    const child = spawn(python, [scriptPath]);
    services[index] = child;
    logFiles[index] = `service${index + 1}.log`;
    const logStream = fs.createWriteStream(logFiles[index], { flags: 'a' });
    child.stdout.pipe(logStream);
    child.stderr.pipe(logStream);
    child.on('exit', () => {
      services[index] = null;
    });
    return { status: 'started' };
  } else if (action === 'stop') {
    if (services[index]) {
      services[index].kill();
      services[index] = null;
      return { status: 'stopped' };
    }
    return { status: 'not running' };
  }
});

// Log streaming
ipcMain.handle('get-log', async (event, index) => {
  if (!logFiles[index]) return '';
  try {
    return fs.readFileSync(logFiles[index], 'utf-8');
  } catch {
    return '';
  }
});
