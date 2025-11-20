#!/usr/bin/env node

/**
 * Passenger Entry Point for ReplayHub API (from startup folder)
 * Loads the built NestJS application with logging to app.log
 */

const fs = require('fs');
const path = require('path');

// Setup logging to logs/app.log (Plesk exposes /logs)
const logDir = path.resolve(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFile = path.join(logDir, 'app.log');

// Ensure we can write to the log file
try {
  fs.appendFileSync(logFile, ''); // Create if doesn't exist
  console.log(`Logging to: ${logFile}`);
} catch (err) {
  console.error('Failed to create log file:', err);
}

const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Handle stream errors
logStream.on('error', err => {
  console.error('Log stream error:', err);
});

// Redirect console.log to both stdout and app.log
const originalLog = console.log;
const originalError = console.error;

console.log = function (...args) {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ${args.join(' ')}\n`;
  try {
    logStream.write(message);
  } catch (err) {
    originalError('Failed to write to log:', err);
  }
  originalLog.apply(console, args);
};

console.error = function (...args) {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ERROR: ${args.join(' ')}\n`;
  try {
    logStream.write(message);
  } catch (err) {
    originalError('Failed to write error to log:', err);
  }
  originalError.apply(console, args);
};

// Capture unhandled errors to ensure they hit the log file
process.on('unhandledRejection', reason => {
  console.error(
    'UnhandledRejection:',
    reason instanceof Error ? reason.stack || reason.message : reason
  );
});

process.on('uncaughtException', err => {
  console.error('UncaughtException:', err.stack || err.message || err);
});

process.on('warning', warning => {
  console.error('ProcessWarning:', warning.stack || warning.message || warning);
});

// Log startup
console.log('=== API Starting ===');
console.log('Process CWD:', process.cwd());
console.log('__dirname:', __dirname);

// Go up one directory to project root, then into apps/api/dist/src
require('../apps/api/dist/src/main.js');
