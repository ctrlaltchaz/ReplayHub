#!/usr/bin/env node

/**
 * ReplayHub Web Server Startup Script
 * Starts the Next.js frontend server
 */

const { spawn } = require('child_process');
const path = require('path');

const WEB_DIR = path.join(__dirname, 'apps', 'web');
const PORT = process.env.PORT || 3000;

console.log('================================');
console.log('  ReplayHub Web Server');
console.log('================================');
console.log('');
console.log(`📂 Directory: ${WEB_DIR}`);
console.log(`🔌 Port: ${PORT}`);
console.log('');
console.log('🚀 Starting Next.js frontend...');
console.log('');

// Change to web directory and start the server
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const server = spawn(npm, ['run', 'dev'], {
    cwd: WEB_DIR,
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
    console.log('\n🛑 Shutting down web server...');
    server.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down web server...');
    server.kill('SIGTERM');
    process.exit(0);
});

server.on('error', (error) => {
    console.error('❌ Failed to start web server:', error);
    process.exit(1);
});

server.on('exit', (code) => {
    if (code !== 0) {
        console.error(`❌ Web server exited with code ${code}`);
        process.exit(code);
    }
});
