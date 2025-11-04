const fs = require('fs');
const path = require('path');

function extractRouteMetadata() {
    const routes = [];

    // Read inventory controller
    const inventoryControllerPath = path.join(__dirname, '../src/modules/inventory/controllers/inventory.controller.ts');
    const inventoryContent = fs.readFileSync(inventoryControllerPath, 'utf8');

    // Read asset controller
    const assetControllerPath = path.join(__dirname, '../src/modules/inventory/controllers/asset.controller.ts');
    const assetContent = fs.readFileSync(assetControllerPath, 'utf8');

    // Parse inventory controller
    parseController(inventoryContent, 'inventory', routes);

    // Parse asset controller  
    parseController(assetContent, 'assets', routes);

    return routes;
}

function parseController(content, baseModule, routes) {
    const lines = content.split('\n');
    let currentMethod = null;
    let currentPath = null;
    let currentGuards = [];
    let currentPermission = null;
    let classLevelGuards = [];

    // First pass: find class-level guards
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Parse class-level UseGuards
        const classGuardsMatch = line.match(/@UseGuards\s*\(\s*([^)]+)\s*\)/);
        if (classGuardsMatch) {
            const nextLine = lines[i + 1]?.trim();
            // Check if next line is class declaration
            if (nextLine && nextLine.startsWith('export class')) {
                classLevelGuards = classGuardsMatch[1].split(',').map(g => g.trim());
            }
        }
    }

    // Second pass: parse methods
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Parse HTTP method decorators
        const httpMatch = line.match(/@(Get|Post|Put|Delete|Patch)\s*\(\s*['"`]([^'"`]*?)['"`]\s*\)/);
        if (httpMatch) {
            currentMethod = httpMatch[1].toUpperCase();
            let pathSegment = httpMatch[2] || '';
            // Ensure proper path formatting
            if (pathSegment && !pathSegment.startsWith('/')) {
                pathSegment = '/' + pathSegment;
            }
            currentPath = `/org/:slug/${baseModule}${pathSegment}`;
        }

        // Parse method decorators without parameters
        const httpNoParamMatch = line.match(/@(Get|Post|Put|Delete|Patch)\s*\(\s*\)/);
        if (httpNoParamMatch) {
            currentMethod = httpNoParamMatch[1].toUpperCase();
            currentPath = `/org/:slug/${baseModule}`;
        }

        // Parse UseGuards decorator
        const guardsMatch = line.match(/@UseGuards\s*\(\s*([^)]+)\s*\)/);
        if (guardsMatch) {
            currentGuards = guardsMatch[1].split(',').map(g => g.trim().replace(/Guard$/, 'Guard'));
        }

        // Parse Can decorator
        const canMatch = line.match(/@Can\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
        if (canMatch) {
            currentPermission = canMatch[1];
        }

        // Check if we hit a method definition
        const methodMatch = line.match(/async\s+(\w+)\s*\(/);
        if (methodMatch && currentMethod && currentPath) {
            // Combine class-level and method-level guards, removing duplicates
            const allGuards = [...new Set([...classLevelGuards, ...currentGuards])];

            routes.push({
                method: currentMethod,
                path: currentPath.replace(/\s/g, ''), // Remove any spaces
                guards: allGuards,
                permission: currentPermission
            });

            // Reset for next method
            currentMethod = null;
            currentPath = null;
            currentGuards = [];
            currentPermission = null;
        }
    }
}

function staticAuditMissingCan(routes) {
    const violations = [];

    routes.forEach(route => {
        // Check if mutation route (POST/PUT/DELETE) has @Can
        if (['POST', 'PUT', 'DELETE'].includes(route.method)) {
            if (!route.permission) {
                violations.push({
                    route: `${route.method} ${route.path}`,
                    issue: 'Missing @Can decorator on mutation route'
                });
            }
        }
    });

    return violations;
}

async function main() {
    console.log('=== Task 1: Route → Guards → Permission Manifest ===\n');

    // Generate runtime manifest
    const routes = extractRouteMetadata();

    console.log('RUNTIME INTROSPECTION:');
    console.log(JSON.stringify(routes, null, 2));

    // Write to file
    const manifestPath = path.join(__dirname, '../security.route-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(routes, null, 2));
    console.log(`\nManifest written to: ${manifestPath}`);

    // Static audit
    console.log('\nSTATIC AUDIT - Missing @Can on Mutations:');
    const violations = staticAuditMissingCan(routes);
    if (violations.length === 0) {
        console.log('✅ All mutation routes have @Can decorators');
    } else {
        console.log('❌ Violations found:');
        violations.forEach(v => console.log(`  - ${v.route}: ${v.issue}`));
    }

    return {
        routeCount: routes.length,
        violations: violations.length,
        manifest: routes
    };
}

if (require.main === module) {
    main().then(result => {
        console.log(`\n📊 Summary: ${result.routeCount} routes, ${result.violations} violations`);
        process.exit(result.violations > 0 ? 1 : 0);
    }).catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}

module.exports = { main, extractRouteMetadata, staticAuditMissingCan };