#!/usr/bin/env node

/**
 * Passenger Entry Point for ReplayHub API (from startup folder)
 * Loads the built NestJS application with logging to app.log
 */

const fs = require('fs');
const path = require('path');

// Setup logging to app.log
const logFile = path.join(__dirname, '..', 'app.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Redirect console.log to both stdout and app.log
const originalLog = console.log;
const originalError = console.error;

console.log = function (...args) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ${args.join(' ')}\n`;
    logStream.write(message);
    originalLog.apply(console, args);
};

console.error = function (...args) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ERROR: ${args.join(' ')}\n`;
    logStream.write(message);
    originalError.apply(console, args);
};

// Log startup
console.log('=== API Starting ===');

// Go up one directory to project root, then into apps/api/dist/src
require('../apps/api/dist/src/main.js');
