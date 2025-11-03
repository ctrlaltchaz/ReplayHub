#!/usr/bin/env node

/**
 * Inspect the Next.js server.js to understand its structure
 */

const path = require('path');

const projectRoot = path.join(__dirname, '..');
const standaloneDir = path.join(projectRoot, 'apps', 'web', '.next', 'standalone');
const serverPath = path.join(standaloneDir, 'apps', 'web', 'server.js');

console.log('Inspecting Next.js server.js...');
console.log('Server path:', serverPath);
console.log('');

// Change to standalone directory
process.chdir(standaloneDir);

// Read the server file
const fs = require('fs');
const serverContent = fs.readFileSync(serverPath, 'utf8');

console.log('=== First 50 lines of server.js ===');
const lines = serverContent.split('\n').slice(0, 50);
console.log(lines.join('\n'));
console.log('');
console.log('=== Last 30 lines of server.js ===');
const lastLines = serverContent.split('\n').slice(-30);
console.log(lastLines.join('\n'));
