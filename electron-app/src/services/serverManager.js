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