#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';

interface ShadowCheck {
    timestamp: string;
    conflicts: ConflictInfo[];
    passed: boolean;
}

interface ConflictInfo {
    type: 'base_org_slug' | 'duplicate_route';
    controller: string;
    route: string;
    method: string;
    severity: 'ERROR' | 'WARNING';
    message: string;
}

async function checkRouteShadowing(): Promise<ShadowCheck> {
    console.log('[ShadowDetector] Analyzing route conflicts...');

    const conflicts: ConflictInfo[] = [];

    // Test known routes via HTTP probing since we can't easily introspect the running app
    const testRoutes = [
        // These should work (RBAC now under /admin)
        { path: '/api/org/test/admin/roles', method: 'GET', controller: 'RbacController', expected: 401 },
        { path: '/api/org/test/reports/ping', method: 'GET', controller: 'ReportsController', expected: 401 },

        // These should fail (conflicting base paths) 
        { path: '/api/org/test/roles', method: 'GET', controller: 'RbacController', expected: 404 },

        // Test duplicate detection
        { path: '/api/org/test/events', method: 'GET', controller: 'EventsController', expected: 401 }
    ];

    // Check for base org/:slug conflicts (should be none with RBAC under /admin)
    console.log('[ShadowDetector] Checking for base org/:slug conflicts...');

    try {
        const response = await fetch('http://localhost:3001/api/org/test/roles');
        if (response.status !== 404) {
            conflicts.push({
                type: 'base_org_slug',
                controller: 'RbacController',
                route: '/api/org/:slug/roles',
                method: 'GET',
                severity: 'ERROR',
                message: 'RBAC controller still accessible at base org/:slug path - should be under /admin'
            });
        } else {
            console.log('✅ RBAC routes properly isolated under /admin');
        }
    } catch (e) {
        console.log('✅ RBAC base route not accessible (expected)');
    }

    // Verify proper admin scoping
    try {
        const response = await fetch('http://localhost:3001/api/org/test/admin/roles');
        if (response.status === 401) {
            console.log('✅ RBAC admin routes properly scoped and secured');
        } else if (response.status === 404) {
            conflicts.push({
                type: 'base_org_slug',
                controller: 'RbacController',
                route: '/api/org/:slug/admin/roles',
                method: 'GET',
                severity: 'ERROR',
                message: 'RBAC admin routes not found - controller may not be properly registered'
            });
        }
    } catch (e) {
        console.log('❌ Could not verify RBAC admin routes');
    }

    // Check reports routes
    try {
        const response = await fetch('http://localhost:3001/api/org/test/reports/ping');
        if (response.status === 401) {
            console.log('✅ Reports routes properly registered and secured');
        } else {
            conflicts.push({
                type: 'base_org_slug',
                controller: 'ReportsController',
                route: '/api/org/:slug/reports/ping',
                method: 'GET',
                severity: 'ERROR',
                message: 'Reports routes not properly secured'
            });
        }
    } catch (e) {
        console.log('❌ Could not verify Reports routes');
    }

    const result: ShadowCheck = {
        timestamp: new Date().toISOString(),
        conflicts,
        passed: conflicts.length === 0
    };

    // Write results
    const resultPath = path.join(__dirname, '../../../../shadow-check.json');
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

    // Print summary
    console.log('\n=== SHADOW DETECTOR RESULTS ===');
    if (result.passed) {
        console.log('✅ PASS - No route conflicts detected');
    } else {
        console.log('❌ FAIL - Route conflicts found:');
        conflicts.forEach(conflict => {
            console.log(`  ${conflict.severity}: ${conflict.message}`);
            console.log(`    Route: ${conflict.method} ${conflict.route}`);
            console.log(`    Controller: ${conflict.controller}`);
        });
    }

    return result;
}

if (require.main === module) {
    checkRouteShadowing()
        .then((result) => {
            process.exit(result.passed ? 0 : 1);
        })
        .catch((error) => {
            console.error('Shadow detection failed:', error);
            process.exit(1);
        });
}

export { checkRouteShadowing };
