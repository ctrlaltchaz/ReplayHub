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
        const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermission) {
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
        const permissions = principal.permissions ?? [];
        const isSuperAdmin = principal.type === 'global-admin' && permissions.includes('*');
        const hasPermission = isSuperAdmin || permissions.includes(requiredPermission);
        const userIdentifier =
            principal.type === 'global-admin'
                ? request.globalUser?.email ?? request.unifiedUser?.email ?? principal.id
                : request.orgUser?.email ?? principal.id;

        if (!hasPermission) {
            throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
        }
        return true;
    }
}
