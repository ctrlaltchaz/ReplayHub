#!/usr/bin/env node

/**
 * Show the actual DATABASE_URL being loaded
 */

const path = require('path');
process.chdir(path.join(__dirname, '..', 'apps', 'api'));
require('dotenv').config();

console.log('DATABASE_URL from environment:');
console.log(process.env.DATABASE_URL);
console.log('');

// Parse it
if (process.env.DATABASE_URL) {
    try {
        const url = new URL(process.env.DATABASE_URL);
        console.log('Parsed components:');
        console.log('  Protocol:', url.protocol);
        console.log('  Username:', url.username);
        console.log('  Password:', url.password);
        console.log('  Host:', url.hostname);
        console.log('  Port:', url.port);
        console.log('  Database:', url.pathname.substring(1));
    } catch (e) {
        console.log('Failed to parse URL:', e.message);
    }
}
