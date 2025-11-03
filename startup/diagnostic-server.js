#!/usr/bin/env node

/**
 * Simple diagnostic HTTP server
 * Run this to test if Node.js is working in Plesk
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const PROJECT_ROOT = path.join(__dirname, '..');
const LOG_FILE = path.join(PROJECT_ROOT, 'diagnostic.log');

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(LOG_FILE, logMessage);
}

const server = http.createServer((req, res) => {
    log(`${req.method} ${req.url}`);

    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            message: 'Diagnostic server is running',
            timestamp: new Date().toISOString(),
            port: PORT,
            nodeVersion: process.version,
            platform: process.platform,
            cwd: process.cwd(),
            projectRoot: PROJECT_ROOT,
            env: {
                NODE_ENV: process.env.NODE_ENV,
                DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
            }
        }, null, 2));
    } else if (req.url === '/logs') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        if (fs.existsSync(LOG_FILE)) {
            const logs = fs.readFileSync(LOG_FILE, 'utf-8');
            res.end(logs);
        } else {
            res.end('No logs found');
        }
    } else if (req.url === '/startup-logs') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        const startupLogFile = path.join(PROJECT_ROOT, 'api-startup.log');
        if (fs.existsSync(startupLogFile)) {
            const logs = fs.readFileSync(startupLogFile, 'utf-8');
            res.end(logs);
        } else {
            res.end('No startup logs found');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    log(`================================`);
    log(`Diagnostic Server Running`);
    log(`================================`);
    log(`Port: ${PORT}`);
    log(`Project Root: ${PROJECT_ROOT}`);
    log(`Log File: ${LOG_FILE}`);
    log(``);
    log(`Available endpoints:`);
    log(`  GET /health - Server status`);
    log(`  GET /logs - View diagnostic logs`);
    log(`  GET /startup-logs - View API startup logs`);
    log(``);
    log(`✓ Server is ready`);
});

server.on('error', (error) => {
    log(`❌ Server error: ${error.message}`);
    if (error.code === 'EADDRINUSE') {
        log(`Port ${PORT} is already in use`);
    }
    process.exit(1);
});
