const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

async function checkPorts() {
  return new Promise((resolve) => {
    exec('netstat -ano | findstr :5173', (error, stdout) => {
      const port5173InUse = stdout.includes(':5173');
      exec('netstat -ano | findstr :5000', (error, stdout) => {
        const port5000InUse = stdout.includes(':5000');
        resolve({ port5173InUse, port5000InUse });
      });
    });
  });
}

async function waitForPorts() {
  console.log('Checking if required ports are available...');
  const { port5173InUse, port5000InUse } = await checkPorts();
  
  if (port5173InUse) {
    console.log('Port 5173 is already in use. This might be from a previous session.');
  }
  
  if (port5000InUse) {
    console.log('Port 5000 is already in use. This might be from a previous session.');
  }
  
  console.log('Starting development servers...');
}

async function createAssetsDir() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log('Created assets directory');
    
    // Create a simple icon placeholder
    const iconPath = path.join(assetsDir, 'icon.png');
    const iconContent = `<!-- Placeholder for app icon -->
<!-- Replace this with actual icon files:
     - icon.png (512x512 for Linux)
     - icon.ico (for Windows)
     - icon.icns (for macOS) -->`;
    
    fs.writeFileSync(path.join(assetsDir, 'README.md'), iconContent);
  }
}

async function main() {
  await createAssetsDir();
  await waitForPorts();
  console.log('Development setup completed!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkPorts, waitForPorts, createAssetsDir };
