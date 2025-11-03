#!/usr/bin/env node

/**
 * Custom Passenger Entry Point with Static File Serving
 * Wraps Next.js standalone with express to serve static files
 */

const express = require('express');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const standaloneDir = path.join(projectRoot, 'apps', 'web', '.next', 'standalone');
const staticDir = path.join(standaloneDir, '.next', 'static');
const publicDir = path.join(standaloneDir, 'apps', 'web', 'public');

console.log('Starting custom Next.js server with static file support...');
console.log('Project root:', projectRoot);
console.log('Standalone directory:', standaloneDir);
console.log('Static directory:', staticDir);
console.log('Public directory:', publicDir);

// Change working directory
process.chdir(standaloneDir);

// Create express app
const app = express();

// Serve static files from .next/static
app.use('/_next/static', express.static(staticDir, {
    maxAge: '365d',
    immutable: true
}));

// Serve public files
app.use(express.static(publicDir, {
    maxAge: '1d'
}));

// Load and start Next.js server
const nextServer = require(path.join(standaloneDir, 'apps', 'web', 'server.js'));

// If Next.js exports a handler, use it
if (typeof nextServer === 'function') {
    app.use(nextServer);
} else if (nextServer && typeof nextServer.default === 'function') {
    app.use(nextServer.default);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✓ Server listening on port ${port}`);
});

module.exports = app;
