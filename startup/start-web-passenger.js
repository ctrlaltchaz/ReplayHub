#!/usr/bin/env node

/**
 * Passenger Entry Point for ReplayHub Web App (from startup folder)
 * Loads the built Next.js application with static file handling
 */

const path = require('path');

// Set working directory to the standalone server location
const webDir = path.join(__dirname, '..', 'apps', 'web');
const standaloneDir = path.join(webDir, '.next', 'standalone');

// Important: Set the working directory so Next.js can find its files
process.chdir(standaloneDir);

// Tell Next.js where to find static files
process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify({
  basePath: '',
  i18n: null,
  compress: true,
});

// Start the Next.js server
require(path.join(standaloneDir, 'apps', 'web', 'server.js'));
