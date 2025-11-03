#!/usr/bin/env node

/**
 * ReplayHub API Server Startup Script
 * Starts the NestJS backend server
 */

const { spawn } = require('child_process');
const path = require('path');

const API_DIR = path.join(__dirname, 'apps', 'api');
const PORT = process.env.PORT || 3001;

console.log('================================');
console.log('  ReplayHub API Server');
console.log('================================');
console.log('');
console.log(`📂 Directory: ${API_DIR}`);
console.log(`🔌 Port: ${PORT}`);
console.log('');
console.log('🚀 Starting NestJS backend...');
console.log('');

// Change to API directory and start the server
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const server = spawn(npm, ['run', 'start:dev'], {
    cwd: API_DIR,
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        PORT: PORT,
        NODE_ENV: 'development'
    }
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down API server...');
    server.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down API server...');
    server.kill('SIGTERM');
    process.exit(0);
});

server.on('error', (error) => {
    console.error('❌ Failed to start API server:', error);
    process.exit(1);
});

server.on('exit', (code) => {
    if (code !== 0) {
        console.error(`❌ API server exited with code ${code}`);
        process.exit(code);
    }
});
