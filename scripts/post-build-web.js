#!/usr/bin/env node

/**
 * Post-build script for Next.js
 * Copies static assets to standalone output
 */

const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, '..', 'apps', 'web');
const standaloneRoot = path.join(webDir, '.next', 'standalone');
const standaloneAppWeb = path.join(standaloneRoot, 'apps', 'web');

console.log('📦 Copying static assets for standalone deployment...');
console.log('');
console.log(`Web directory: ${webDir}`);
console.log(`Standalone root: ${standaloneRoot}`);
console.log(`Standalone app/web: ${standaloneAppWeb}`);
console.log('');

// Copy .next/static to standalone/apps/web/.next/static
// (Next.js server.js runs from apps/web/ and expects .next relative to that)
const staticSrc = path.join(webDir, '.next', 'static');
const staticDest = path.join(standaloneAppWeb, '.next', 'static');

console.log(`Copying static files:`);
console.log(`  From: ${staticSrc}`);
console.log(`  To: ${staticDest}`);

if (fs.existsSync(staticSrc)) {
    // Remove existing if it exists
    if (fs.existsSync(staticDest)) {
        fs.rmSync(staticDest, { recursive: true, force: true });
    }

    // Create parent directory
    fs.mkdirSync(path.dirname(staticDest), { recursive: true });

    // Copy recursively
    fs.cpSync(staticSrc, staticDest, { recursive: true });
    console.log('✓ Static files copied');
} else {
    console.log('⚠ Warning: .next/static not found');
}

console.log('');

// Copy public folder to standalone/apps/web/public
const publicSrc = path.join(webDir, 'public');
const publicDest = path.join(standaloneAppWeb, 'public');

console.log(`Copying public files:`);
console.log(`  From: ${publicSrc}`);
console.log(`  To: ${publicDest}`);

if (fs.existsSync(publicSrc)) {
    // Remove existing if it exists
    if (fs.existsSync(publicDest)) {
        fs.rmSync(publicDest, { recursive: true, force: true });
    }

    // Copy recursively
    fs.cpSync(publicSrc, publicDest, { recursive: true });
    console.log('✓ Public files copied');
} else {
    console.log('⚠ Warning: public folder not found');
}

console.log('');
console.log('✅ Post-build complete!');
console.log('');
console.log('Files should now be available at:');
console.log(`  Static: ${staticDest}`);
console.log(`  Public: ${publicDest}`);
