import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UnifiedOrgMembership, UnifiedUserProfile } from '../../users/dto/unified-user.dto';
import { UniversalAuthService } from '../universal-auth.service';

@Injectable()
export class UnifiedSessionGuard implements CanActivate {
    constructor(private readonly universalAuthService: UniversalAuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const session = request.session;

        if (!session) {
            throw new UnauthorizedException('Not authenticated');
        }

        const hasGlobal = Boolean(session.userId);
        const hasMembership = Boolean(session.membershipId);

        if (!hasGlobal && !hasMembership) {
            throw new UnauthorizedException('Not authenticated');
        }

        if (session.requiresTotp && !session.totpVerified) {
            throw new UnauthorizedException('TOTP verification required');
        }

        const profile = await this.universalAuthService.getCurrentSessionProfile(request);
        const activeMembership = this.resolveActiveMembership(profile, request);

        request.unifiedUser = profile;
        request.activeMembership = activeMembership;

        const effectiveUserId = activeMembership?.membershipId ?? profile.id;
        const effectiveEmail = activeMembership?.email ?? profile.email;
        const userType: 'global' | 'org' = activeMembership ? 'org' : 'global';

        request.user = {
            id: effectiveUserId,
            type: userType,
            tenantId: activeMembership?.tenantId ?? null,
            email: effectiveEmail,
        };

        return true;
    }

    private resolveActiveMembership(profile: UnifiedUserProfile, request: Request): UnifiedOrgMembership | null {
        if (!profile.memberships.length) {
            return null;
        }

        if (request.session?.membershipId) {
            const byId = profile.memberships.find((membership) => membership.membershipId === request.session.membershipId);
            if (byId) {
                return byId;
            }
        }

        if (request.session?.orgTenant) {
            const byTenant = profile.memberships.find((membership) => membership.tenantSlug === request.session.orgTenant || membership.tenantId === request.session.orgTenant);
            if (byTenant) {
                return byTenant;
            }
        }

        return profile.activeMembership ?? profile.memberships[0] ?? null;
    }
}
