#!/usr/bin/env node

/**
 * Passenger-Compatible Next.js Handler
 * Uses Next.js as a request handler instead of starting its own server
 */

const path = require('path');
const http = require('http');

const projectRoot = path.join(__dirname, '..');
const standaloneDir = path.join(projectRoot, 'apps', 'web', '.next', 'standalone');
const nextAppDir = path.join(standaloneDir, 'apps', 'web');

console.log('Initializing Next.js for Passenger...');
console.log('Project root:', projectRoot);
console.log('Standalone directory:', standaloneDir);
console.log('Next.js app directory:', nextAppDir);

// Change to the Next.js app directory
process.chdir(nextAppDir);

// Set environment
process.env.NODE_ENV = 'production';
process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(require(path.join(nextAppDir, 'server.js')));

// Initialize Next.js
const NextServer = require('next/dist/server/next-server').default;
const nextConfig = {
  conf: require(path.join(nextAppDir, '.next/required-server-files.json')).config,
  dir: nextAppDir,
  minimalMode: true,
  customServer: false,
};

const nextServer = new NextServer(nextConfig);
const requestHandler = nextServer.getRequestHandler();

// Prepare Next.js
nextServer.prepare().then(() => {
  console.log('✓ Next.js ready');

  // Create HTTP server for Passenger
  const server = http.createServer(async (req, res) => {
    try {
      await requestHandler(req, res);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  const port = process.env.PORT || 3000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`✓ Server listening on port ${port}`);
  });

  // Export for Passenger
  if (typeof PhusionPassenger !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
  }
}).catch((err) => {
  console.error('Failed to start Next.js:', err);
  process.exit(1);
});
