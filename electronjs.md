# Electron Desktop App for RecipeHub

This guide will walk you through creating a desktop application for your RecipeHub using Electron.js that connects to your existing Node.js backend.

## Table of Contents
1. [Project Setup](#project-setup)
2. [Electron Configuration](#electron-configuration)
3. [Backend Integration](#backend-integration)
4. [Building the App](#building-the-app)
5. [Development Workflow](#development-workflow)
6. [Distribution](#distribution)

## Project Setup

### Step 1: Create Electron App Directory
```bash
# Navigate to your project root
cd c:\Users\Samuel\Desktop\arch_n_tiers

# Create electron app directory
mkdir electron-app
cd electron-app

# Initialize npm project
npm init -y
```

### Step 2: Install Electron Dependencies
```bash
# Install Electron as dev dependency
npm install --save-dev electron

# Install additional dependencies
npm install --save-dev electron-builder
npm install --save-dev concurrently
npm install --save-dev wait-on
npm install --save-dev cross-env

# Install runtime dependencies
npm install axios
npm install electron-store
npm install electron-updater
```

### Step 3: Update package.json
```json
{
  "name": "recipehub-desktop",
  "version": "1.0.0",
  "description": "Desktop application for RecipeHub",
  "main": "src/main.js",
  "homepage": "./",
  "scripts": {
    "start": "electron .",
    "dev": "concurrently \"npm run start-backend\" \"npm run start-client\" \"wait-on http://localhost:3000 http://localhost:5000 && electron .\"",
    "start-backend": "cd ../server && npm start",
    "start-client": "cd ../client && npm run dev",
    "build": "electron-builder",
    "build-win": "electron-builder --win",
    "build-mac": "electron-builder --mac",
    "build-linux": "electron-builder --linux",
    "dist": "npm run build-client && electron-builder",
    "build-client": "cd ../client && npm run build"
  },
  "build": {
    "appId": "com.recipehub.desktop",
    "productName": "RecipeHub",
    "directories": {
      "output": "dist"
    },
    "files": [
      "src/**/*",
      "assets/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/icon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  },
  "author": "Samuel FOTSO",
  "license": "MIT",
  "devDependencies": {
    "electron": "^27.0.0",
    "electron-builder": "^24.6.4",
    "concurrently": "^8.2.2",
    "wait-on": "^7.0.1",
    "cross-env": "^7.0.3"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "electron-store": "^8.1.0",
    "electron-updater": "^6.1.4"
  }
}
```

## Electron Configuration

### Step 4: Create Main Process File
Create `src/main.js`:

```javascript
const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');

// Initialize electron store for user preferences
const store = new Store();

let mainWindow;
let splashWindow;

// Enable live reload for Electron in development
if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createMainWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false, // Don't show until ready
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../client/dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
    }
    mainWindow.show();
    
    // Focus on the window
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event listeners
app.whenReady().then(() => {
  createSplashWindow();
  
  // Wait a bit then create main window
  setTimeout(() => {
    createMainWindow();
    createMenu();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });

  // Check for updates
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Recipe',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/recipes/create');
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-preferences');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Home',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/');
          }
        },
        {
          label: 'Recipes',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/recipes');
          }
        },
        {
          label: 'Profile',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/profile');
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About RecipeHub',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About RecipeHub',
              message: 'RecipeHub Desktop',
              detail: 'Version 1.0.0\nA desktop application for managing and sharing recipes.'
            });
          }
        },
        {
          label: 'Learn More',
          click: () => {
            shell.openExternal('https://github.com/your-repo/recipehub');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('store-delete', (event, key) => {
  store.delete(key);
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  autoUpdater.quitAndInstall();
});
```

### Step 5: Create Preload Script
Create `src/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  
  // Store methods
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key)
  },
  
  // Navigation
  onNavigate: (callback) => ipcRenderer.on('navigate-to', callback),
  removeNavigateListener: (callback) => ipcRenderer.removeListener('navigate-to', callback),
  
  // Preferences
  onOpenPreferences: (callback) => ipcRenderer.on('open-preferences', callback),
  removePreferencesListener: (callback) => ipcRenderer.removeListener('open-preferences', callback),
  
  // Platform info
  platform: process.platform
});
```

### Step 6: Create Splash Screen
Create `src/splash.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>RecipeHub</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      color: white;
    }
    .splash-container {
      text-align: center;
    }
    .logo {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    .loading {
      font-size: 1rem;
      opacity: 0.8;
    }
    .spinner {
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top: 3px solid white;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="splash-container">
    <div class="logo">🍳 RecipeHub</div>
    <div class="spinner"></div>
    <div class="loading">Starting application...</div>
  </div>
</body>
</html>
```

## Backend Integration

### Step 7: Create API Service for Electron
Create `src/services/electronApiService.js`:

```javascript
const axios = require('axios');

class ElectronApiService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'http://localhost:5000' 
      : 'http://localhost:5000';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add request interceptor for auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await window.electronAPI?.store.get('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await window.electronAPI?.store.delete('authToken');
          // Redirect to login or show auth modal
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(email, password) {
    const response = await this.api.post('/api/auth/login', { email, password });
    const { token } = response.data;
    await window.electronAPI?.store.set('authToken', token);
    return response.data;
  }

  async logout() {
    await window.electronAPI?.store.delete('authToken');
  }

  // Recipe methods
  async getRecipes(params = {}) {
    const response = await this.api.get('/api/recipes', { params });
    return response.data;
  }

  async getRecipe(id) {
    const response = await this.api.get(`/api/recipes/${id}`);
    return response.data;
  }

  async createRecipe(formData) {
    const response = await this.api.post('/api/recipes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Check server status
  async checkServerStatus() {
    try {
      await this.api.get('/api/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ElectronApiService;
```

### Step 8: Create Server Manager
Create `src/services/serverManager.js`:

```javascript
const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');

class ServerManager {
  constructor() {
    this.serverProcess = null;
    this.isRunning = false;
  }

  async startServer() {
    if (this.isRunning) {
      return true;
    }

    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, '../../server');
      
      // Start the Node.js server
      this.serverProcess = spawn('npm', ['start'], {
        cwd: serverPath,
        stdio: 'pipe'
      });

      this.serverProcess.stdout.on('data', (data) => {
        console.log(`Server: ${data}`);
        if (data.includes('Server running on port')) {
          this.isRunning = true;
          resolve(true);
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error(`Server Error: ${data}`);
      });

      this.serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        this.isRunning = false;
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!this.isRunning) {
          reject(new Error('Server failed to start within 30 seconds'));
        }
      }, 30000);
    });
  }

  async stopServer() {
    if (this.serverProcess && this.isRunning) {
      this.serverProcess.kill();
      this.isRunning = false;
    }
  }

  async checkHealth() {
    try {
      const response = await axios.get('http://localhost:5000/api/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ServerManager;
```

## Building the App

### Step 9: Create Build Scripts
Create `scripts/build.js`:

```javascript
const { build } = require('electron-builder');
const path = require('path');

async function buildApp() {
  try {
    console.log('Building Electron app...');
    
    await build({
      targets: {
        win: [{ target: 'nsis' }],
        mac: [{ target: 'dmg' }],
        linux: [{ target: 'AppImage' }]
      },
      config: {
        appId: 'com.recipehub.desktop',
        productName: 'RecipeHub',
        directories: {
          output: 'dist'
        },
        files: [
          'src/**/*',
          'assets/**/*',
          'node_modules/**/*',
          '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
          '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
          '!**/node_modules/*.d.ts',
          '!**/node_modules/.bin',
          '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
          '!.editorconfig',
          '!**/._*',
          '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
          '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
          '!**/{appveyor.yml,.travis.yml,circle.yml}',
          '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
        ]
      }
    });
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildApp();
```

### Step 10: Create Assets Directory
Create the `assets` directory and add icons:

```bash
mkdir assets
# Add your app icons:
# - icon.ico (Windows)
# - icon.icns (macOS)  
# - icon.png (Linux)
```

## Development Workflow

### Step 11: Development Commands

```bash
# Start development (runs backend, frontend, and electron)
npm run dev

# Start only electron (assumes backend and frontend are running)
npm start

# Build for distribution
npm run dist

# Build for specific platforms
npm run build-win    # Windows
npm run build-mac    # macOS
npm run build-linux  # Linux
```

### Step 12: Environment Configuration
Create `.env` file in electron-app directory:

```env
NODE_ENV=development
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

## Distribution

### Step 13: Prepare for Distribution

1. **Code Signing (for production)**:
   ```bash
   # Install certificates and update build config
   # Add to package.json build config:
   "win": {
     "certificateFile": "path/to/certificate.p12",
     "certificatePassword": "password"
   }
   ```

2. **Auto-updater Setup**:
   - Configure update server
   - Set up GitHub releases or custom update server

3. **App Store Distribution**:
   - Follow platform-specific guidelines
   - Configure appropriate entitlements

### Step 14: Testing Checklist

- [ ] App starts without errors
- [ ] Backend connection works
- [ ] All routes are accessible
- [ ] Authentication persists between sessions
- [ ] File uploads work correctly
- [ ] App menus function properly
- [ ] Auto-updater works (if configured)
- [ ] App builds successfully for target platforms

## Additional Features

### Offline Support
```javascript
// Add to preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing code ...
  
  // Network status
  isOnline: () => navigator.onLine,
  onOnline: (callback) => window.addEventListener('online', callback),
  onOffline: (callback) => window.addEventListener('offline', callback)
});
```

### System Notifications
```javascript
// Add to main.js
const { Notification } = require('electron');

function showNotification(title, body) {
  new Notification({
    title,
    body,
    icon: path.join(__dirname, '../assets/icon.png')
  }).show();
}
```

### Print Support
```javascript
// Add to main.js
ipcMain.handle('print-recipe', async (event, recipeHtml) => {
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  await printWindow.loadURL(`data:text/html,${encodeURIComponent(recipeHtml)}`);
  printWindow.webContents.print();
});
```

## Troubleshooting

### Common Issues:

1. **Server Connection Failed**: Check if backend is running on correct port
2. **Build Errors**: Ensure all dependencies are installed
3. **Authentication Issues**: Verify token storage and API endpoints
4. **File Upload Problems**: Check file permissions and upload paths

### Debug Mode:
```bash
# Run with debug info
DEBUG=electron* npm start
```

This setup provides a complete desktop application that:
- Connects to your existing backend
- Provides native desktop experience
- Supports auto-updates
- Handles offline scenarios
- Includes proper error handling
- Can be distributed across platforms

Start with the development setup first, test thoroughly, then proceed with building and distribution.