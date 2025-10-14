#!/usr/bin/env node

/**
 * Start ALwrity frontend with Privacy Mode support
 * This script starts the React development server with all necessary dependencies
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    console.log('❌ Node.js 16 or higher is required');
    process.exit(1);
  }
  console.log(`✅ Node.js ${nodeVersion}`);
}

function checkDependencies() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found');
    process.exit(1);
  }
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('⚠️  node_modules not found. Installing dependencies...');
    try {
      execSync('npm install', { stdio: 'inherit', cwd: __dirname });
      console.log('✅ Dependencies installed');
    } catch (error) {
      console.log('❌ Failed to install dependencies');
      process.exit(1);
    }
  } else {
    console.log('✅ Dependencies are available');
  }
}

function checkEnvironmentFile() {
  const envFile = path.join(__dirname, '.env');
  const envExample = path.join(__dirname, 'env_template.txt');
  
  if (!fs.existsSync(envFile)) {
    if (fs.existsSync(envExample)) {
      console.log('⚠️  .env file not found. Creating from template...');
      fs.copyFileSync(envExample, envFile);
      console.log('✅ .env file created from template');
    } else {
      console.log('⚠️  .env file not found and no template available');
      console.log('   You may need to create one manually');
    }
  } else {
    console.log('✅ .env file exists');
  }
}

function startDevServer() {
  console.log('\n🚀 Starting ALwrity Frontend with Privacy Mode support...');
  console.log('📍 Frontend will be available at: http://localhost:3000');
  console.log('📍 Privacy Mode components are integrated into the API key step');
  console.log('\nPress Ctrl+C to stop the server\n');
  
  try {
    const child = spawn('npm', ['start'], {
      stdio: 'inherit',
      cwd: __dirname,
      shell: true
    });
    
    child.on('error', (error) => {
      console.log(`❌ Error starting development server: ${error.message}`);
      process.exit(1);
    });
    
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping development server...');
      child.kill('SIGINT');
      process.exit(0);
    });
    
  } catch (error) {
    console.log(`❌ Error starting development server: ${error.message}`);
    process.exit(1);
  }
}

function main() {
  console.log('🔧 ALwrity Frontend Setup with Privacy Mode');
  console.log('=' * 50);
  
  checkNodeVersion();
  checkDependencies();
  checkEnvironmentFile();
  startDevServer();
}

main();
