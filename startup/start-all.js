#!/usr/bin/env node

/**
 * ReplayHub - Start Both Servers
 * Starts both API and Web servers concurrently
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('================================');
console.log('  ReplayHub - Full Stack');
console.log('================================');
console.log('');
console.log('🚀 Starting both servers...');
console.log('');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Start API server
console.log('📡 Starting API server on port 3001...');
const apiServer = spawn('node', ['start-api.js'], {
    cwd: __dirname,
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: true
});

// Wait a moment before starting web server
setTimeout(() => {
    console.log('');
    console.log('🌐 Starting Web server on port 3000...');
    const webServer = spawn('node', ['start-web.js'], {
        cwd: __dirname,
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
    });

    // Handle web server exit
    webServer.on('exit', (code) => {
        if (code !== 0) {
            console.error(`❌ Web server exited with code ${code}`);
            apiServer.kill();
            process.exit(code);
        }
    });

    // Handle process termination
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down all servers...');
        webServer.kill('SIGINT');
        apiServer.kill('SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down all servers...');
        webServer.kill('SIGTERM');
        apiServer.kill('SIGTERM');
        process.exit(0);
    });

}, 2000);

// Handle API server exit
apiServer.on('exit', (code) => {
    if (code !== 0) {
        console.error(`❌ API server exited with code ${code}`);
        process.exit(code);
    }
});

apiServer.on('error', (error) => {
    console.error('❌ Failed to start API server:', error);
    process.exit(1);
});

console.log('');
console.log('================================');
console.log('Press Ctrl+C to stop all servers');
console.log('================================');
