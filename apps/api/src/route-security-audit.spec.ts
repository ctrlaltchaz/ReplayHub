import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AssetController } from './modules/inventory/controllers/asset.controller';
import { InventoryController } from './modules/inventory/controllers/inventory.controller';

describe('Route Security Metadata Audit', () => {

    /**
     * Helper function to get metadata from a controller method
     */
    function getMethodMetadata(controllerClass: any, methodName: string) {
        const method = controllerClass.prototype[methodName];
        if (!method) {
            throw new Error(`Method ${methodName} not found on controller`);
        }

        const guards = Reflect.getMetadata(GUARDS_METADATA, method) || [];
        const canPermissions = Reflect.getMetadata('permissions', method) || [];
        const httpMethod = getHttpMethod(controllerClass, methodName);

        return {
            methodName,
            httpMethod,
            guards: guards.map((guard: any) => guard.name || guard.constructor?.name || 'Unknown'),
            canPermissions
        };
    }

    /**
     * Helper to extract HTTP method from decorators
     */
    function getHttpMethod(controllerClass: any, methodName: string): string {
        const method = controllerClass.prototype[methodName];
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
    function getControllerMethods(controllerClass: any): string[] {
        const methods = Object.getOwnPropertyNames(controllerClass.prototype)
            .filter(name => {
                if (name === 'constructor') return false;

                const descriptor = Object.getOwnPropertyDescriptor(controllerClass.prototype, name);
                return descriptor && typeof descriptor.value === 'function';
            });

        // Filter to only HTTP endpoint methods (those with HTTP decorators)
        return methods.filter(methodName => {
            const httpMethod = getHttpMethod(controllerClass, methodName);
            return httpMethod !== 'UNKNOWN';
        });
    }

    describe('Critical Security Verification', () => {
        it('should have PermissionGuard on all inventory routes (CRITICAL FIX VERIFICATION)', () => {
            const inventoryMethods = getControllerMethods(InventoryController);
            const violations: string[] = [];

            for (const methodName of inventoryMethods) {
                const metadata = getMethodMetadata(InventoryController, methodName);

                if (!metadata.guards.includes('PermissionGuard')) {
                    violations.push(`${metadata.httpMethod} ${methodName}: Missing PermissionGuard`);
                }
            }

            if (violations.length > 0) {
                console.error('CRITICAL: PermissionGuard violations found on inventory routes:');
                violations.forEach(v => console.error(`- ${v}`));
            }

            expect(violations).toHaveLength(0);
        });

        it('should have PermissionGuard on all asset routes (CRITICAL FIX VERIFICATION)', () => {
            const assetMethods = getControllerMethods(AssetController);
            const violations: string[] = [];

            for (const methodName of assetMethods) {
                const metadata = getMethodMetadata(AssetController, methodName);

                if (!metadata.guards.includes('PermissionGuard')) {
                    violations.push(`${metadata.httpMethod} ${methodName}: Missing PermissionGuard`);
                }
            }

            if (violations.length > 0) {
                console.error('CRITICAL: PermissionGuard violations found on asset routes:');
                violations.forEach(v => console.error(`- ${v}`));
            }

            expect(violations).toHaveLength(0);
        });

        it('should generate security audit summary', () => {
            const inventoryMethods = getControllerMethods(InventoryController);
            const assetMethods = getControllerMethods(AssetController);

            console.log('\\n=== SECURITY AUDIT SUMMARY ===');
            console.log(`Total inventory routes: ${inventoryMethods.length}`);
            console.log(`Total asset routes: ${assetMethods.length}`);
            console.log(`Total routes audited: ${inventoryMethods.length + assetMethods.length}`);

            let secureRoutes = 0;
            let totalRoutes = 0;

            // Check inventory routes
            for (const method of inventoryMethods) {
                const metadata = getMethodMetadata(InventoryController, method);
                totalRoutes++;
                if (metadata.guards.includes('PermissionGuard') &&
                    metadata.guards.includes('OrgAuthGuard') &&
                    metadata.guards.includes('TenantGuard')) {
                    secureRoutes++;
                }
            }

            // Check asset routes
            for (const method of assetMethods) {
                const metadata = getMethodMetadata(AssetController, method);
                totalRoutes++;
                if (metadata.guards.includes('PermissionGuard') &&
                    metadata.guards.includes('OrgAuthGuard') &&
                    metadata.guards.includes('TenantGuard')) {
                    secureRoutes++;
                }
            }

            console.log(`Secure routes: ${secureRoutes}/${totalRoutes}`);
            console.log(`All routes secure: ${secureRoutes === totalRoutes ? '✅ YES' : '❌ NO'}`);
            console.log('=== END AUDIT SUMMARY ===\\n');

            expect(secureRoutes).toBe(totalRoutes);
        });
    });
});
