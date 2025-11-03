#!/usr/bin/env node

/**
 * Passenger Entry Point for ReplayHub API
 * Simplest possible startup - just require the built main.js
 */

// Passenger runs from project root, so we need to load from apps/api/dist/src
require('./apps/api/dist/src/main.js');
