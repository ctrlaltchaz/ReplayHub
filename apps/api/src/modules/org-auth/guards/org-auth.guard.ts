import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { OrgAuthService } from '../org-auth.service';

declare module 'express-session' {
    interface SessionData {
        orgUserId?: string;
        orgTenant?: string;
    }
}

declare global {
    namespace Express {
        interface Request {
            orgUser?: {
                id: string;
                email: string;
                displayName: string;
                roles: string[];
                permissions: string[];
            };
        }
    }
}

@Injectable()
export class OrgAuthGuard implements CanActivate {
    constructor(private orgAuthService: OrgAuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        // Check if we have tenant context from TenantGuard
        if (!request.tenant) {
            throw new UnauthorizedException('Tenant context required');
        }

        // Check for org session in cookies
        const orgSession = request.session.orgUserId;
        if (!orgSession) {
            throw new UnauthorizedException('Organisation authentication required');
        }

        // Validate org user exists and is active
        try {
            const orgUser = await this.orgAuthService.validateOrgUser(request.tenant.id, orgSession);
            if (!orgUser) {
                throw new UnauthorizedException('Invalid org session');
            }

            // Attach org user to request
            request.orgUser = {
                id: orgUser.id,
                email: orgUser.email,
                displayName: orgUser.displayName,
                roles: orgUser.roles,
                permissions: orgUser.permissions,
            };

            return true;
        } catch (error) {
            throw new UnauthorizedException('Organisation authentication failed');
        }
    }
}