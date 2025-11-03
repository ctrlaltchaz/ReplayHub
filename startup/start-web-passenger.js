#!/usr/bin/env node

/**
 * Passenger Entry Point for ReplayHub Web App (from startup folder)
 * Loads the built Next.js application with static file handling
 */

const path = require('path');

// Set the working directory to standalone output
const projectRoot = path.join(__dirname, '..');
const standaloneDir = path.join(projectRoot, 'apps', 'web', '.next', 'standalone');

console.log('Starting Next.js standalone server...');
console.log('Project root:', projectRoot);
console.log('Standalone directory:', standaloneDir);

// Change to standalone directory so Next.js finds its files
process.chdir(standaloneDir);

// Start the Next.js server
require(path.join(standaloneDir, 'apps', 'web', 'server.js'));