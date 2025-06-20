const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  
  // Store methods for persistent data
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key)
  },
  
  // File system dialogs
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Navigation events from menu
  onNavigate: (callback) => {
    const wrapper = (event, path) => callback(path);
    ipcRenderer.on('navigate-to', wrapper);
    return () => ipcRenderer.removeListener('navigate-to', wrapper);
  },
  
  // Preferences
  onOpenPreferences: (callback) => {
    const wrapper = () => callback();
    ipcRenderer.on('open-preferences', wrapper);
    return () => ipcRenderer.removeListener('open-preferences', wrapper);
  },
  
  // Recipe export/import
  onExportRecipe: (callback) => {
    const wrapper = () => callback();
    ipcRenderer.on('export-recipe', wrapper);
    return () => ipcRenderer.removeListener('export-recipe', wrapper);
  },
  
  onImportRecipe: (callback) => {
    const wrapper = () => callback();
    ipcRenderer.on('import-recipe', wrapper);
    return () => ipcRenderer.removeListener('import-recipe', wrapper);
  },
  
  // Platform info
  platform: process.platform,
  
  // Environment
  isDev: process.env.NODE_ENV === 'development'
});

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('RecipeHub Desktop is ready!');
});