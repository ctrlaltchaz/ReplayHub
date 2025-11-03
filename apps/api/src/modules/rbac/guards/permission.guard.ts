import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSION_KEY } from '../decorators/can.decorator';
import { PermissionService } from '../services/permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionService: PermissionService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log('[PermissionGuard] Executing guard #3 in chain');
        const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermission) {
            console.log('[PermissionGuard] No permission requirement - access granted');
            return true; // No permission requirement
        }

        const request = context.switchToHttp().getRequest<Request>();

        // Must have tenant and principal context from UnifiedTenantAuthGuard
        if (!request.tenant || !request.principal) {
            throw new ForbiddenException('Authentication context required');
        }

        // Store permission key for logging middleware
        request['permissionKey'] = requiredPermission;

        const principal = request.principal;
        let hasPermission = false;
        let userIdentifier = '';

        // Check permissions based on principal type
        if (principal.type === 'global-admin') {
            // Global admins have all permissions (superadmin)
            hasPermission = principal.permissions?.includes('*') || false;
            userIdentifier = request.globalUser?.email || principal.id;
        } else if (principal.type === 'org') {
            // Org users use their flattened permissions
            hasPermission = principal.permissions?.includes(requiredPermission) || false;
            userIdentifier = request.orgUser?.email || principal.id;
        }

        if (!hasPermission) {
            console.log(`[PermissionGuard] Missing permission '${requiredPermission}' for ${principal.type} user ${userIdentifier}`);
            console.log(`[PermissionGuard] User permissions: [${principal.permissions?.join(', ') || 'none'}]`);
            throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
        }

        console.log(`[PermissionGuard] Access granted for '${requiredPermission}' to ${principal.type} user ${userIdentifier}`);
        return true;
    }
}