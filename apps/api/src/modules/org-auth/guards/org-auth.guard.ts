import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UniversalAuthService } from '../../universal-auth/universal-auth.service';
import { OrgAuthService } from '../org-auth.service';

@Injectable()
export class OrgAuthGuard implements CanActivate {
    constructor(
        private readonly universalAuthService: UniversalAuthService,
        private readonly orgAuthService: OrgAuthService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        console.log('🔍 [OrgAuthGuard] Entry:', {
            path: request.path,
            method: request.method,
            hasTenant: !!request.tenant,
            tenantSlug: request.tenant?.slug,
        });

        // Check if we have tenant context from TenantGuard
        if (!request.tenant) {
            console.log('❌ [OrgAuthGuard] No tenant context');
            throw new UnauthorizedException('Tenant context required');
        }

        try {
            const profile = request.unifiedUser ?? await this.universalAuthService.getCurrentSessionProfile(request);

            console.log('🔍 [OrgAuthGuard] Profile:', {
                hasProfile: !!profile,
                profileId: profile?.id,
                email: profile?.email,
                membershipCount: profile?.memberships?.length,
            });

            const membership = profile.memberships.find((membership) =>
                membership.tenantId === request.tenant.id || membership.tenantSlug === request.tenant.slug,
            );

            console.log('🔍 [OrgAuthGuard] Membership:', {
                found: !!membership,
                membershipId: membership?.membershipId,
                tenantId: membership?.tenantId,
                tenantSlug: membership?.tenantSlug,
            });

            if (!membership) {
                console.log('❌ [OrgAuthGuard] No membership found for tenant');
                throw new UnauthorizedException('Organisation authentication required');
            }

            console.log('🔍 [OrgAuthGuard] Fetching org user profile...', {
                tenantId: request.tenant.id,
                membershipId: membership.membershipId,
            });

            // Use getProfileFromMembership instead of validateOrgUser (which expects old orgUserId)
            const orgUser = await this.orgAuthService.getProfileFromMembership(request.tenant.id, membership.membershipId);
            console.log('🔍 [OrgAuthGuard] OrgUser result:', {
                hasOrgUser: !!orgUser,
                orgUserId: orgUser?.id,
                email: orgUser?.email,
                roles: orgUser?.roles,
            });

            if (!orgUser) {
                console.log('❌ [OrgAuthGuard] No orgUser returned');
                throw new UnauthorizedException('Invalid org session');
            }

            // Attach org user to request (orgUser.id is now membership.id)
            request.orgUser = {
                id: orgUser.id,
                email: orgUser.email,
                displayName: orgUser.displayName,
                roles: orgUser.roles,
                permissions: orgUser.permissions,
            };

            request.activeMembership = membership;
            request.user = {
                id: membership.membershipId,
                type: 'org',
                tenantId: membership.tenantId,
                email: membership.email,
            };

            if (profile.hasGlobalAccount) {
                request.globalUser = {
                    id: profile.id,
                    email: profile.email,
                    name: profile.name ?? profile.email,
                    isGlobalAdmin: profile.isGlobalAdmin,
                };
            }

            console.log('✅ [OrgAuthGuard] Auth successful');
            return true;
        } catch (error) {
            console.log('❌ [OrgAuthGuard] Error:', error.message);
            throw new UnauthorizedException('Organisation authentication failed');
        }
    }
}
