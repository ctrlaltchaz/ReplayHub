import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class TenantAccessGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        // Must have tenant context (from TenantResolverMiddleware)
        if (!request.tenant) {
            throw new UnauthorizedException('Tenant context not found');
        }

        // Must have authenticated org user (from OrgAuthGuard)
        if (!request.orgUser) {
            throw new UnauthorizedException('Organization user authentication required');
        }

        // request.orgUser.id now represents the membership ID.
        const membership = await this.prisma.userOrganisationMembership.findUnique({
            where: { id: request.orgUser.id },
            select: { id: true, tenantId: true, email: true },
        });

        // Fallback to legacy org user record for backwards compatibility
        const orgUser = membership
            ? null
            : await this.prisma.orgUser.findUnique({
                where: { id: request.orgUser.id },
                select: { id: true, tenantId: true, email: true },
            });

        if (!membership && !orgUser) {
            throw new UnauthorizedException('User not found');
        }

        const resourceTenantId = membership?.tenantId ?? orgUser!.tenantId;

        if (resourceTenantId !== request.tenant.id) {
            console.warn(
                `[TenantAccessGuard] User ${request.orgUser.id} (tenant: ${resourceTenantId.substring(0, 8)}...) ` +
                `attempted to access tenant ${request.tenant.id.substring(0, 8)}... (${request.tenant.slug})`
            );

            throw new ForbiddenException(
                'Access denied: You do not have permission to access resources in this organization'
            );
        }

        // Check for cross-tenant ID access in route parameters
        const params = request.params;
        if (params) {
            // Common parameter names that should be validated
            const sensitiveParams = ['userId', 'roleId', 'permissionId', 'inviteId', 'orgUserId'];

            for (const paramName of sensitiveParams) {
                if (params[paramName]) {
                    // Log the attempt for audit purposes
                    console.log(
                        `[TenantAccessGuard] User ${request.orgUser.id} accessing ${paramName}: ${params[paramName]} ` +
                        `in tenant ${request.tenant.slug}`
                    );
                }
            }
        }

        // Check for cross-tenant data in request body
        if (request.body && typeof request.body === 'object') {
            // Prevent tenantId manipulation in request body
            if (request.body.tenantId && request.body.tenantId !== request.tenant.id) {
                console.warn(
                    `[TenantAccessGuard] User ${request.orgUser.id} attempted to set tenantId to ${request.body.tenantId} ` +
                    `but belongs to ${request.tenant.id}`
                );

                throw new ForbiddenException(
                    'Access denied: Cannot modify resources in other organizations'
                );
            }

            // Remove tenantId from body to prevent accidental setting
            delete request.body.tenantId;
        }

        console.log(
            `[TenantAccessGuard] Access granted for user ${request.orgUser.id} ` +
            `in tenant ${request.tenant.slug} to ${request.method} ${request.url}`
        ); return true;
    }
}
