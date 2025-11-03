#!/usr/bin/env node

/**
 * Passenger-compatible startup file
 * This is a simple entry point for Plesk/Passenger
 */

// Change to the API directory
const path = require('path');
const apiDir = path.join(__dirname, '..', 'apps', 'api');

process.chdir(apiDir);

// Load the built NestJS application
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log'],
    });

    // Enable CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'https://app.replayhub.app',
        credentials: true,
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);

    console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((err) => {
    console.error('Failed to start application:', err);
    process.exit(1);
});
