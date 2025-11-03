#!/usr/bin/env node

/**
 * ReplayHub API Server Startup Script
 * Starts the NestJS backend server
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Go up one level from startup folder to project root
const PROJECT_ROOT = path.join(__dirname, '..');
const API_DIR = path.join(PROJECT_ROOT, 'apps', 'api');
const LOG_FILE = path.join(PROJECT_ROOT, 'api-startup.log');
const PORT = process.env.PORT || 3001;

// Log function that writes to both console and file
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(LOG_FILE, logMessage);
}

log('================================');
log('  ReplayHub API Server');
log('================================');
log('');
log(`📂 Project Root: ${PROJECT_ROOT}`);
log(`📂 API Directory: ${API_DIR}`);
log(`📂 Log File: ${LOG_FILE}`);
log(`🔌 Port: ${PORT}`);
log(`🌍 Node Environment: ${process.env.NODE_ENV || 'development'}`);

// Check if API directory exists
if (!fs.existsSync(API_DIR)) {
    log(`❌ ERROR: API directory not found at ${API_DIR}`);
    process.exit(1);
}

// Check if package.json exists
const packageJsonPath = path.join(API_DIR, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    log(`❌ ERROR: package.json not found at ${packageJsonPath}`);
    process.exit(1);
}

log('✓ API directory found');
log('✓ package.json found');
log('');
log('🚀 Starting NestJS backend...');
log('');

// Change to API directory and start the server
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const mode = process.env.NODE_ENV === 'production' ? 'start:prod' : 'start:dev';

log(`Running: npm run ${mode}`);

const server = spawn(npm, ['run', mode], {
    cwd: API_DIR,
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        PORT: PORT
    }
});

log('✓ Server process started');

// Handle process termination
process.on('SIGINT', () => {
    log('\n🛑 Shutting down API server (SIGINT)...');
    server.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    log('\n🛑 Shutting down API server (SIGTERM)...');
    server.kill('SIGTERM');
    process.exit(0);
});

server.on('error', (error) => {
    log(`❌ Failed to start API server: ${error.message}`);
    log(`Error stack: ${error.stack}`);
    process.exit(1);
});

server.on('exit', (code) => {
    log(`Server process exited with code ${code}`);
    if (code !== 0) {
        log(`❌ API server exited with code ${code}`);
        process.exit(code);
    }
});
