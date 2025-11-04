const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const fs = require('fs');
const path = require('path');

async function generateRouteManifest() {
    const app = await NestFactory.create(AppModule, { logger: false });

    const httpAdapterHost = app.get('HttpAdapterHost');
    const httpServer = httpAdapterHost.httpAdapter;
    const router = httpServer._router;

    const routes = [];

    // Get all routes from Express router
    if (router && router.stack) {
        router.stack.forEach(layer => {
            if (layer.route) {
                const route = layer.route;
                const path = route.path;
                const methods = Object.keys(route.methods);

                methods.forEach(method => {
                    if (path.startsWith('/org/:slug/inventory') || path.startsWith('/org/:slug/assets')) {
                        routes.push({
                            method: method.toUpperCase(),
                            path: path
                        });
                    }
                });
            }
        });
    }

    console.log('Routes discovered:', routes.length);

    // Write manifest
    const manifestPath = path.join(__dirname, '../security.route-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(routes, null, 2));

    await app.close();
    return routes;
}

// Runtime execution
if (require.main === module) {
    generateRouteManifest()
        .then(routes => {
            console.log(`Generated manifest with ${routes.length} routes`);
            process.exit(0);
        })
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}

module.exports = { generateRouteManifest };