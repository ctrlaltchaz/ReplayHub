#!/usr/bin/env node

/**
 * Passenger Entry Point for ReplayHub Web App
 * Serves Next.js with proper static file handling
 */

const path = require('path');
const express = require('express');

const projectRoot = path.join(__dirname, '..');
const standaloneDir = path.join(projectRoot, 'apps', 'web', '.next', 'standalone');
const staticDir = path.join(standaloneDir, '.next', 'static');
const webDir = path.join(projectRoot, 'apps', 'web');

console.log('🚀 Starting ReplayHub Web App...');
console.log('Project root:', projectRoot);
console.log('Standalone directory:', standaloneDir);
console.log('Static files:', staticDir);
console.log('');

// Change working directory
process.chdir(standaloneDir);

// Create Express app to serve static files
const app = express();

// Serve static files from .next/static
app.use('/_next/static', express.static(staticDir));

// Serve public files
const publicDir = path.join(standaloneDir, 'apps', 'web', 'public');
app.use(express.static(publicDir));

// Load and mount the Next.js server
const nextHandler = require(path.join(standaloneDir, 'apps', 'web', 'server.js'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
