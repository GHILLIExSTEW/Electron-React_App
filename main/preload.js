const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  serviceControl: (action, index, scriptPath) => ipcRenderer.invoke('service-control', { action, index, scriptPath }),
  getLog: (index) => ipcRenderer.invoke('get-log', index)
});
