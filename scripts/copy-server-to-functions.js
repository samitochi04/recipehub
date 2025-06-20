const fs = require('fs');
const path = require('path');

async function copyDirectory(src, dest) {
  try {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  } catch (error) {
    console.error(`Error copying ${src} to ${dest}:`, error.message);
  }
}

async function copyServerToFunctions() {
  try {
    console.log('Copying server files to functions directory...');
    
    // Define source and destination paths
    const serverPath = path.join(__dirname, '..', 'server');
    const functionsPath = path.join(__dirname, '..', 'functions');
    
    // Create functions directory if it doesn't exist
    if (!fs.existsSync(functionsPath)) {
      fs.mkdirSync(functionsPath, { recursive: true });
    }
    
    // Directories to copy
    const dirsTooCopy = ['routes', 'controllers', 'middleware', 'config'];
    
    for (const dir of dirsTooCopy) {
      const sourcePath = path.join(serverPath, dir);
      const destPath = path.join(functionsPath, dir);
      
      if (fs.existsSync(sourcePath)) {
        await copyDirectory(sourcePath, destPath);
        console.log(`✓ Copied ${dir}/`);
      } else {
        console.log(`⚠ Directory ${dir}/ not found in server`);
      }
    }
    
    // Copy .env file if it exists
    const envPath = path.join(serverPath, '.env');
    const envDestPath = path.join(functionsPath, '.env');
    
    if (fs.existsSync(envPath)) {
      fs.copyFileSync(envPath, envDestPath);
      console.log('✓ Copied .env file');
    }
    
    console.log('✅ Server files copied successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Update database config in functions/config/db.js');
    console.log('   2. Uncomment routes in functions/index.js');
    console.log('   3. Install functions dependencies: npm run functions:install');
    console.log('   4. Set up Firebase Functions environment variables');
    
  } catch (error) {
    console.error('❌ Error copying server files:', error);
    process.exit(1);
  }
}

copyServerToFunctions();
