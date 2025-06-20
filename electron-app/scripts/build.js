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