import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

// Models that require tenant isolation
const TENANT_SCOPED_MODELS = [
    'OrgUser',
    'Role',
    'Permission',
    'RolePermission',
    'OrgUserRole',
    'OrgInvite',
    'AuditLog',
    'Note' // Add any other tenant-scoped models
];

// Operations that need tenant filtering
const TENANT_FILTERED_OPERATIONS = [
    'findMany',
    'findFirst',
    'findUnique',
    'update',
    'updateMany',
    'delete',
    'deleteMany',
    'upsert',
    'count',
    'aggregate',
    'groupBy'
];

@Injectable()
export class PrismaTenantMiddleware {

    /**
     * Gets the current tenant ID from PostgreSQL session variable
     */
    private async getCurrentTenantId(next: any): Promise<string | null> {
        try {
            // Create a temporary query to get the tenant ID
            const result = await next({
                model: undefined,
                action: 'queryRaw',
                args: {
                    query: `SELECT current_setting('app.tenant_id', true) as current_setting`,
                    parameters: []
                }
            });

            const tenantId = result?.[0]?.current_setting;

            // Return null if setting is empty string or null
            if (!tenantId || tenantId === '') {
                return null;
            }

            return tenantId;
        } catch (error) {
            console.warn('[PrismaTenantMiddleware] Could not retrieve tenant context:', error.message);
            return null;
        }
    }

    /**
     * Checks if a model requires tenant scoping
     */
    private isTenantScopedModel(model: string): boolean {
        return TENANT_SCOPED_MODELS.includes(model);
    }

    /**
     * Checks if an operation needs tenant filtering
     */
    private needsTenantFiltering(action: string): boolean {
        return TENANT_FILTERED_OPERATIONS.includes(action);
    }

    /**
     * Injects tenantId filter into query arguments
     */
    private injectTenantFilter(args: any, tenantId: string, action: string): any {
        if (!args) {
            args = {};
        }

        // For operations that use 'where' clause
        if (args.where !== undefined) {
            // If where is null, create an object
            if (args.where === null) {
                args.where = { tenantId };
            } else {
                // Add tenantId to existing where clause
                args.where = {
                    ...args.where,
                    tenantId
                };
            }
        } else {
            // For operations without explicit where (like create)
            // Only add tenantId for read operations
            if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'groupBy'].includes(action)) {
                args.where = { tenantId };
            }
        }

        return args;
    }

    /**
     * Injects tenantId into data for create/update operations
     */
    private injectTenantData(args: any, tenantId: string, action: string): any {
        if (!args) {
            args = {};
        }

        // For create operations, ensure tenantId is in the data
        if (action === 'create' && args.data) {
            args.data = {
                ...args.data,
                tenantId
            };
        }

        // For update operations, ensure tenantId cannot be changed
        if (['update', 'upsert'].includes(action) && args.data) {
            // Remove tenantId from data to prevent accidental changes
            const { tenantId: _, ...dataWithoutTenantId } = args.data;
            args.data = dataWithoutTenantId;
        }

        // For createMany operations
        if (action === 'createMany' && args.data && Array.isArray(args.data)) {
            args.data = args.data.map(item => ({
                ...item,
                tenantId
            }));
        }

        return args;
    }

    /**
     * Creates the Prisma middleware function
     */
    createMiddleware() {
        return async (params: any, next: (params: any) => Promise<any>) => {
            const { model, action, args } = params;

            // Skip if no model (raw queries) or not a tenant-scoped model
            if (!model || !this.isTenantScopedModel(model)) {
                return next(params);
            }

            // Get current tenant ID
            const tenantId = await this.getCurrentTenantId(next);

            // If no tenant context, allow the operation (for system operations)
            if (!tenantId) {
                console.warn(`[PrismaTenantMiddleware] No tenant context for ${model}.${action} - allowing operation`);
                return next(params);
            }

            console.log(`[PrismaTenantMiddleware] Applying tenant filter for ${model}.${action} with tenantId: ${tenantId.substring(0, 8)}...`);

            // Clone args to avoid mutation
            let modifiedArgs = JSON.parse(JSON.stringify(args));

            // Inject tenant filtering for read operations
            if (this.needsTenantFiltering(action)) {
                modifiedArgs = this.injectTenantFilter(modifiedArgs, tenantId, action);
            }

            // Inject tenant data for write operations
            if (['create', 'createMany', 'update', 'upsert'].includes(action)) {
                modifiedArgs = this.injectTenantData(modifiedArgs, tenantId, action);
            }

            // Execute with modified parameters
            const result = await next({
                ...params,
                args: modifiedArgs
            });

            return result;
        };
    }

    /**
     * Applies the middleware to a PrismaClient instance
     */
    apply(prisma: PrismaClient): void {
        // Note: $use is deprecated in Prisma v5+, but keeping for backward compatibility
        try {
            if (typeof (prisma as any).$use === 'function') {
                (prisma as any).$use(this.createMiddleware());
                console.log('[PrismaTenantMiddleware] Tenant isolation middleware applied via $use');
            } else {
                console.warn('[PrismaTenantMiddleware] $use method not available - tenant middleware not applied');
            }
        } catch (error) {
            console.error('[PrismaTenantMiddleware] Failed to apply middleware:', error.message);
        }
    }
}
