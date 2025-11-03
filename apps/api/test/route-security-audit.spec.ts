import { GUARDS_METADATA, ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AssetController } from '../src/modules/inventory/controllers/asset.controller';
import { InventoryController } from '../src/modules/inventory/controllers/inventory.controller';

describe('Route Security Metadata Audit', () => {
    let inventoryController: InventoryController;
    let assetController: AssetController;
    let reflector: Reflector;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InventoryController, AssetController],
            providers: [
                Reflector,
                // Mock services to prevent DI errors
                {
                    provide: 'InventoryService',
                    useValue: {}
                },
                {
                    provide: 'AssetService',
                    useValue: {}
                },
                {
                    provide: 'PrismaService',
                    useValue: {}
                }
            ]
        }).compile();

        inventoryController = module.get<InventoryController>(InventoryController);
        assetController = module.get<AssetController>(AssetController);
        reflector = module.get<Reflector>(Reflector);
    });

    /**
     * Helper function to get metadata from a controller method
     */
    function getMethodMetadata(controller: any, methodName: string) {
        const method = controller.constructor.prototype[methodName];
        if (!method) {
            throw new Error(`Method ${methodName} not found on controller`);
        }

        const guards = Reflect.getMetadata(GUARDS_METADATA, method) || [];
        const canPermissions = Reflect.getMetadata('permissions', method) || [];
        const routeArgs = Reflect.getMetadata(ROUTE_ARGS_METADATA, controller.constructor, methodName) || {};
        const httpMethod = getHttpMethod(controller.constructor, methodName);

        return {
            methodName,
            httpMethod,
            guards: guards.map((guard: any) => guard.name || guard.constructor?.name || 'Unknown'),
            canPermissions,
            hasRouteArgs: Object.keys(routeArgs).length > 0
        };
    }

    /**
     * Helper to extract HTTP method from decorators
     */
    function getHttpMethod(controllerConstructor: any, methodName: string): string {
        const method = controllerConstructor.prototype[methodName];
        const httpMethods = ['Get', 'Post', 'Put', 'Delete', 'Patch', 'Options', 'Head'];

        for (const httpMethod of httpMethods) {
            if (Reflect.hasMetadata(`__${httpMethod.toLowerCase()}__`, method)) {
                return httpMethod.toUpperCase();
            }
        }
        return 'UNKNOWN';
    }

    /**
     * Helper to get all public methods from a controller
     */
    function getControllerMethods(controller: any): string[] {
        const methods = Object.getOwnPropertyNames(controller.constructor.prototype)
            .filter(name => {
                if (name === 'constructor') return false;

                const descriptor = Object.getOwnPropertyDescriptor(controller.constructor.prototype, name);
                return descriptor && typeof descriptor.value === 'function';
            });

        // Filter to only HTTP endpoint methods (those with HTTP decorators)
        return methods.filter(methodName => {
            const httpMethod = getHttpMethod(controller.constructor, methodName);
            return httpMethod !== 'UNKNOWN';
        });
    }

    /**
     * Required security configuration for inventory/asset routes
     */
    const REQUIRED_GUARDS = [
        'TenantGuard',
        'OrgAuthGuard',
        'PermissionGuard'
    ];

    /**
     * Expected permissions for inventory routes
     */
    const INVENTORY_PERMISSIONS = {
        // GET methods (viewing)
        'findAll': ['inventory.view'],
        'findOne': ['inventory.view'],
        'getMovements': ['inventory.view'],

        // POST methods (creating)
        'create': ['inventory.update'],
        'createKit': ['inventory.update'],
        'createMovement': ['inventory.update'],

        // PUT/PATCH methods (updating)
        'update': ['inventory.update'],
        'updateKit': ['inventory.update'],
        'book': ['inventory.book'],
        'return': ['inventory.update']
    };

    /**
     * Expected permissions for asset routes
     */
    const ASSET_PERMISSIONS = {
        // GET methods
        'findAll': ['assets.manage'],
        'findOne': ['assets.manage'],
        'download': ['assets.manage'],
        'getVersions': ['assets.manage'],

        // POST methods
        'upload': ['assets.upload'],

        // PUT methods
        'approve': ['assets.approve'],
        'update': ['assets.manage'],

        // DELETE methods
        'delete': ['assets.manage']
    };

    describe('Inventory Controller Route Security', () => {
        let inventoryMethods: string[];

        beforeAll(() => {
            inventoryMethods = getControllerMethods(inventoryController);
        });

        it('should have at least 8 HTTP endpoint methods', () => {
            expect(inventoryMethods.length).toBeGreaterThanOrEqual(8);
            console.log('Inventory methods found:', inventoryMethods);
        });

        it('should have all required guards on all methods', () => {
            const violations: Array<{ method: string, issue: string }> = [];

            for (const methodName of inventoryMethods) {
                const metadata = getMethodMetadata(inventoryController, methodName);

                for (const requiredGuard of REQUIRED_GUARDS) {
                    if (!metadata.guards.includes(requiredGuard)) {
                        violations.push({
                            method: `${metadata.httpMethod} ${methodName}`,
                            issue: `Missing required guard: ${requiredGuard}`
                        });
                    }
                }
            }

            if (violations.length > 0) {
                console.error('Guard violations found:');
                violations.forEach(v => console.error(`- ${v.method}: ${v.issue}`));
            }

            expect(violations).toHaveLength(0);
        });

        it('should have proper @Can permissions on all methods', () => {
            const violations: Array<{ method: string, issue: string }> = [];

            for (const methodName of inventoryMethods) {
                const metadata = getMethodMetadata(inventoryController, methodName);
                const expectedPermissions = INVENTORY_PERMISSIONS[methodName];

                if (!expectedPermissions) {
                    violations.push({
                        method: `${metadata.httpMethod} ${methodName}`,
                        issue: `No expected permissions defined - please update test`
                    });
                    continue;
                }

                if (metadata.canPermissions.length === 0) {
                    violations.push({
                        method: `${metadata.httpMethod} ${methodName}`,
                        issue: `Missing @Can decorator - expected: ${expectedPermissions.join(', ')}`
                    });
                    continue;
                }

                // Check if at least one expected permission is present
                const hasValidPermission = expectedPermissions.some(perm =>
                    metadata.canPermissions.includes(perm)
                );

                if (!hasValidPermission) {
                    violations.push({
                        method: `${metadata.httpMethod} ${methodName}`,
                        issue: `Invalid permissions [${metadata.canPermissions.join(', ')}] - expected one of: ${expectedPermissions.join(', ')}`
                    });
                }
            }

            if (violations.length > 0) {
                console.error('Permission violations found:');
                violations.forEach(v => console.error(`- ${v.method}: ${v.issue}`));
            }

            expect(violations).toHaveLength(0);
        });

        it('should follow org-scoped route pattern', () => {
            const violations: string[] = [];

            for (const methodName of inventoryMethods) {
                const metadata = getMethodMetadata(inventoryController, methodName);

                // All inventory routes should be under /org/:slug/inventory
                // This is enforced by the controller-level @Controller decorator
                // We verify by checking for proper tenant context handling

                if (!metadata.guards.includes('TenantGuard')) {
                    violations.push(`${metadata.httpMethod} ${methodName}: Missing TenantGuard for org-scoped route`);
                }
            }

            expect(violations).toHaveLength(0);
        });
    });

    describe('Asset Controller Route Security', () => {
        let assetMethods: string[];

        beforeAll(() => {
            assetMethods = getControllerMethods(assetController);
        });

        it('should have at least 5 HTTP endpoint methods', () => {
            expect(assetMethods.length).toBeGreaterThanOrEqual(5);
            console.log('Asset methods found:', assetMethods);
        });

        it('should have all required guards on all methods', () => {
            const violations: Array<{ method: string, issue: string }> = [];

            for (const methodName of assetMethods) {
                const metadata = getMethodMetadata(assetController, methodName);

                for (const requiredGuard of REQUIRED_GUARDS) {
                    if (!metadata.guards.includes(requiredGuard)) {
                        violations.push({
                            method: `${metadata.httpMethod} ${methodName}`,
                            issue: `Missing required guard: ${requiredGuard}`
                        });
                    }
                }
            }

            if (violations.length > 0) {
                console.error('Guard violations found:');
                violations.forEach(v => console.error(`- ${v.method}: ${v.issue}`));
            }

            expect(violations).toHaveLength(0);
        });

        it('should have proper @Can permissions on all methods', () => {
            const violations: Array<{ method: string, issue: string }> = [];

            for (const methodName of assetMethods) {
                const metadata = getMethodMetadata(assetController, methodName);
                const expectedPermissions = ASSET_PERMISSIONS[methodName];

                if (!expectedPermissions) {
                    violations.push({
                        method: `${metadata.httpMethod} ${methodName}`,
                        issue: `No expected permissions defined - please update test`
                    });
                    continue;
                }

                if (metadata.canPermissions.length === 0) {
                    violations.push({
                        method: `${metadata.httpMethod} ${methodName}`,
                        issue: `Missing @Can decorator - expected: ${expectedPermissions.join(', ')}`
                    });
                    continue;
                }

                // Check if at least one expected permission is present
                const hasValidPermission = expectedPermissions.some(perm =>
                    metadata.canPermissions.includes(perm)
                );

                if (!hasValidPermission) {
                    violations.push({
                        method: `${metadata.httpMethod} ${methodName}`,
                        issue: `Invalid permissions [${metadata.canPermissions.join(', ')}] - expected one of: ${expectedPermissions.join(', ')}`
                    });
                }
            }

            if (violations.length > 0) {
                console.error('Permission violations found:');
                violations.forEach(v => console.error(`- ${v.method}: ${v.issue}`));
            }

            expect(violations).toHaveLength(0);
        });

        it('should follow org-scoped route pattern', () => {
            const violations: string[] = [];

            for (const methodName of assetMethods) {
                const metadata = getMethodMetadata(assetController, methodName);

                if (!metadata.guards.includes('TenantGuard')) {
                    violations.push(`${metadata.httpMethod} ${methodName}: Missing TenantGuard for org-scoped route`);
                }
            }

            expect(violations).toHaveLength(0);
        });
    });

    describe('Security Best Practices Audit', () => {
        it('should have consistent guard ordering across all controllers', () => {
            const allMethods = [
                ...getControllerMethods(inventoryController).map(m => ({ controller: 'inventory', method: m })),
                ...getControllerMethods(assetController).map(m => ({ controller: 'assets', method: m }))
            ];

            const guardOrderViolations: string[] = [];

            for (const { controller, method } of allMethods) {
                const controllerInstance = controller === 'inventory' ? inventoryController : assetController;
                const metadata = getMethodMetadata(controllerInstance, method);

                // Expected order: TenantGuard, OrgAuthGuard, PermissionGuard
                const guardOrder = metadata.guards;
                const tenantIndex = guardOrder.indexOf('TenantGuard');
                const orgAuthIndex = guardOrder.indexOf('OrgAuthGuard');
                const permissionIndex = guardOrder.indexOf('PermissionGuard');

                if (tenantIndex > orgAuthIndex || orgAuthIndex > permissionIndex) {
                    guardOrderViolations.push(
                        `${controller}::${method} - Guard order: [${guardOrder.join(', ')}] should be [TenantGuard, OrgAuthGuard, PermissionGuard]`
                    );
                }
            }

            if (guardOrderViolations.length > 0) {
                console.error('Guard order violations:');
                guardOrderViolations.forEach(v => console.error(`- ${v}`));
            }

            expect(guardOrderViolations).toHaveLength(0);
        });

        it('should not have any routes without permission decorators', () => {
            const allMethods = [
                ...getControllerMethods(inventoryController).map(m => ({ controller: 'inventory', method: m })),
                ...getControllerMethods(assetController).map(m => ({ controller: 'assets', method: m }))
            ];

            const missingPermissions: string[] = [];

            for (const { controller, method } of allMethods) {
                const controllerInstance = controller === 'inventory' ? inventoryController : assetController;
                const metadata = getMethodMetadata(controllerInstance, method);

                if (metadata.canPermissions.length === 0) {
                    missingPermissions.push(`${controller}::${method}`);
                }
            }

            if (missingPermissions.length > 0) {
                console.error('Methods missing @Can permissions:');
                missingPermissions.forEach(m => console.error(`- ${m}`));
            }

            expect(missingPermissions).toHaveLength(0);
        });

        it('should not have any public routes (without authentication)', () => {
            const allMethods = [
                ...getControllerMethods(inventoryController).map(m => ({ controller: 'inventory', method: m })),
                ...getControllerMethods(assetController).map(m => ({ controller: 'assets', method: m }))
            ];

            const publicRoutes: string[] = [];

            for (const { controller, method } of allMethods) {
                const controllerInstance = controller === 'inventory' ? inventoryController : assetController;
                const metadata = getMethodMetadata(controllerInstance, method);

                // Route is public if it doesn't have OrgAuthGuard
                if (!metadata.guards.includes('OrgAuthGuard')) {
                    publicRoutes.push(`${controller}::${method}`);
                }
            }

            if (publicRoutes.length > 0) {
                console.error('Public routes found (missing OrgAuthGuard):');
                publicRoutes.forEach(r => console.error(`- ${r}`));
            }

            expect(publicRoutes).toHaveLength(0);
        });
    });

    describe('Route Coverage Report', () => {
        it('should generate comprehensive security audit report', () => {
            const inventoryMethods = getControllerMethods(inventoryController);
            const assetMethods = getControllerMethods(assetController);

            const report = {
                auditTimestamp: new Date().toISOString(),
                summary: {
                    totalRoutes: inventoryMethods.length + assetMethods.length,
                    inventoryRoutes: inventoryMethods.length,
                    assetRoutes: assetMethods.length,
                    requiredGuards: REQUIRED_GUARDS,
                },
                inventory: inventoryMethods.map(method => {
                    const metadata = getMethodMetadata(inventoryController, method);
                    return {
                        method: `${metadata.httpMethod} ${method}`,
                        guards: metadata.guards,
                        permissions: metadata.canPermissions,
                        isSecure: metadata.guards.includes('TenantGuard') &&
                            metadata.guards.includes('OrgAuthGuard') &&
                            metadata.guards.includes('PermissionGuard') &&
                            metadata.canPermissions.length > 0
                    };
                }),
                assets: assetMethods.map(method => {
                    const metadata = getMethodMetadata(assetController, method);
                    return {
                        method: `${metadata.httpMethod} ${method}`,
                        guards: metadata.guards,
                        permissions: metadata.canPermissions,
                        isSecure: metadata.guards.includes('TenantGuard') &&
                            metadata.guards.includes('OrgAuthGuard') &&
                            metadata.guards.includes('PermissionGuard') &&
                            metadata.canPermissions.length > 0
                    };
                })
            };

            console.log('\\n=== SECURITY AUDIT REPORT ===');
            console.log(JSON.stringify(report, null, 2));
            console.log('\\n=== END AUDIT REPORT ===\\n');

            // Verify all routes are secure
            const allRoutes = [...report.inventory, ...report.assets];
            const insecureRoutes = allRoutes.filter(route => !route.isSecure);

            if (insecureRoutes.length > 0) {
                console.error('SECURITY VIOLATIONS FOUND:');
                insecureRoutes.forEach(route => {
                    console.error(`- ${route.method}: Guards=[${route.guards.join(',')}], Permissions=[${route.permissions.join(',')}]`);
                });
            }

            expect(insecureRoutes).toHaveLength(0);
            expect(report.summary.totalRoutes).toBeGreaterThan(10);
        });
    });
});