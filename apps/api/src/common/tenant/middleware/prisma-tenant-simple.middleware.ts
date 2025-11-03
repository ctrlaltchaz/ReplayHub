import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Models that require tenant isolation
const TENANT_SCOPED_MODELS = [
    'OrgUser',
    'Role',
    'Permission',
    'RolePermission',
    'OrgUserRole',
    'OrgInvite',
    'AuditLog',
    'Note'
];

@Injectable()
export class PrismaTenantMiddleware {
    private prismaClient: PrismaClient;

    /**
     * Gets the current tenant ID from PostgreSQL session variable
     */
    private async getCurrentTenantId(): Promise<string | null> {
        try {
            const result = await this.prismaClient.$queryRawUnsafe(
                "SELECT current_setting('app.tenant_id', true) as current_setting"
            );

            const tenantId = (result as any)?.[0]?.current_setting;

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
     * Injects tenantId filter into where clause
     */
    private injectTenantFilter(args: any, tenantId: string): any {
        if (!args) {
            args = {};
        }

        // Handle where clause
        if (args.where) {
            args.where = {
                ...args.where,
                tenantId
            };
        } else {
            args.where = { tenantId };
        }

        return args;
    }

    /**
     * Injects tenantId into data for create operations
     */
    private injectTenantData(args: any, tenantId: string, action: string): any {
        if (!args) {
            args = {};
        }

        // For create operations
        if (action === 'create' && args.data) {
            args.data = {
                ...args.data,
                tenantId
            };
        }

        // For createMany operations
        if (action === 'createMany' && args.data && Array.isArray(args.data)) {
            args.data = args.data.map((item: any) => ({
                ...item,
                tenantId
            }));
        }

        // For update operations, remove tenantId from data to prevent changes
        if (['update', 'upsert'].includes(action) && args.data) {
            const { tenantId: _, ...dataWithoutTenantId } = args.data;
            args.data = dataWithoutTenantId;
        }

        return args;
    }

    /**
     * Creates the Prisma middleware function
     */
    createMiddleware() {
        return async (params: any, next: (params: any) => Promise<any>) => {
            const { model, action, args } = params;

            // Skip if no model or not a tenant-scoped model
            if (!model || !this.isTenantScopedModel(model)) {
                return next(params);
            }

            // Get current tenant ID
            const tenantId = await this.getCurrentTenantId();

            // If no tenant context, allow the operation (for system operations)
            if (!tenantId) {
                console.warn(`[PrismaTenantMiddleware] No tenant context for ${model}.${action} - allowing operation`);
                return next(params);
            }

            console.log(`[PrismaTenantMiddleware] Applying tenant filter for ${model}.${action} with tenantId: ${tenantId.substring(0, 8)}...`);

            // Clone args to avoid mutation
            let modifiedArgs = args ? JSON.parse(JSON.stringify(args)) : {};

            // Apply tenant filtering based on operation type
            switch (action) {
                case 'create':
                case 'createMany':
                    modifiedArgs = this.injectTenantData(modifiedArgs, tenantId, action);
                    break;

                case 'findMany':
                case 'findFirst':
                case 'findUnique':
                case 'count':
                case 'aggregate':
                case 'groupBy':
                    modifiedArgs = this.injectTenantFilter(modifiedArgs, tenantId);
                    break;

                case 'update':
                case 'updateMany':
                case 'delete':
                case 'deleteMany':
                case 'upsert':
                    modifiedArgs = this.injectTenantFilter(modifiedArgs, tenantId);
                    modifiedArgs = this.injectTenantData(modifiedArgs, tenantId, action);
                    break;

                default:
                    // For unknown operations, just apply tenant filter if args have where
                    if (modifiedArgs.where !== undefined) {
                        modifiedArgs = this.injectTenantFilter(modifiedArgs, tenantId);
                    }
                    break;
            }

            // Execute with modified parameters
            return next({
                ...params,
                args: modifiedArgs
            });
        };
    }

    /**
     * Applies the middleware to a PrismaClient instance
     */
    apply(prisma: PrismaClient): void {
        this.prismaClient = prisma;
        // Note: $use is deprecated in Prisma v5+, but keeping for backward compatibility
        // In production, consider using $extends with query middleware
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