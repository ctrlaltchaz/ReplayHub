#!/usr/bin/env ts-node
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../app.module';

interface RouteInfo {
    fullPath: string;
    method: string;
    controller: string;
    handler: string;
    guards: string[];
    params: string[];
    order: number;
}

interface RouteManifest {
    generated: string;
    totalRoutes: number;
    targetRoutes: RouteInfo[];
    allRoutes: RouteInfo[];
}

async function generateRouteManifest() {
    console.log('[RouteManifest] Creating NestJS application...');

    const app = await NestFactory.create(AppModule, {
        logger: false // Suppress logs during introspection
    });

    const server = app.getHttpAdapter();
    const router = server.getInstance()._router;

    const routes: RouteInfo[] = [];
    let order = 0;

    // Extract routes from Express router
    if (router && router.stack) {
        router.stack.forEach((layer: any) => {
            if (layer.route) {
                const route = layer.route;
                Object.keys(route.methods).forEach((method) => {
                    const fullPath = `/api${route.path}`;

                    // Extract parameters from path
                    const params = extractParams(route.path);

                    // Get controller and handler info from stack
                    const handlerInfo = getHandlerInfo(route.stack);

                    routes.push({
                        fullPath,
                        method: method.toUpperCase(),
                        controller: handlerInfo.controller,
                        handler: handlerInfo.handler,
                        guards: handlerInfo.guards,
                        params,
                        order: order++
                    });
                });
            }
        });
    }

    // Filter target routes
    const targetBases = [
        '/api/org/:slug/admin',
        '/api/org/:slug/reports',
        '/api/org/:slug/events',
        '/api/org/:slug/calendar',
        '/api/org/:slug/gamelog'
    ];

    const targetRoutes = routes.filter(route =>
        targetBases.some(base => route.fullPath.startsWith(base))
    );

    const manifest: RouteManifest = {
        generated: new Date().toISOString(),
        totalRoutes: routes.length,
        targetRoutes,
        allRoutes: routes
    };

    // Write manifest
    const manifestPath = path.join(__dirname, '../../../../route-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`[RouteManifest] Generated manifest with ${routes.length} total routes`);
    console.log(`[RouteManifest] Target routes: ${targetRoutes.length}`);
    console.log(`[RouteManifest] Saved to: ${manifestPath}`);

    // Print target routes for verification
    console.log('\n=== TARGET ROUTES ===');
    targetRoutes.forEach(route => {
        console.log(`${route.method.padEnd(6)} ${route.fullPath} -> ${route.controller}.${route.handler}`);
    });

    await app.close();
    return manifest;
}

function extractParams(path: string): string[] {
    const params: string[] = [];
    const matches = path.match(/:([^/]+)/g);
    if (matches) {
        matches.forEach(match => {
            params.push(match.substring(1)); // Remove the ':'
        });
    }
    return params;
}

function getHandlerInfo(stack: any[]): { controller: string; handler: string; guards: string[] } {
    const guards: string[] = [];
    let controller = 'Unknown';
    let handler = 'unknown';

    if (stack && stack.length > 0) {
        const lastLayer = stack[stack.length - 1];
        if (lastLayer.handle) {
            const handlerName = lastLayer.handle.name || 'anonymous';
            handler = handlerName;

            // Try to extract controller name from the handler function
            const handlerStr = lastLayer.handle.toString();
            const controllerMatch = handlerStr.match(/class\s+(\w+Controller)/);
            if (controllerMatch) {
                controller = controllerMatch[1];
            }
        }

        // Look for guards in the middleware stack
        stack.forEach(layer => {
            if (layer.handle && layer.handle.name) {
                const name = layer.handle.name;
                if (name.includes('Guard') || name.includes('guard')) {
                    guards.push(name);
                }
            }
        });
    }

    return { controller, handler, guards };
}

if (require.main === module) {
    generateRouteManifest()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Failed to generate route manifest:', error);
            process.exit(1);
        });
}

export { generateRouteManifest };
