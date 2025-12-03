import { CanActivate, ExecutionContext, Inject, Injectable, Scope, UnauthorizedException, forwardRef } from '@nestjs/common';
import { Request } from 'express';
import { OrgAuthService } from '../../../modules/org-auth/org-auth.service';
import { UniversalAuthService } from '../../../modules/universal-auth/universal-auth.service';
import { UnifiedOrgMembership, UnifiedUserProfile } from '../../../modules/users/dto/unified-user.dto';
import type { RequestGlobalUser, RequestOrgUser, RequestPrincipal, RequestUserIdentity } from '../../../types/request-context';

@Injectable({ scope: Scope.REQUEST })
export class UnifiedTenantAuthGuard implements CanActivate {
    constructor(
        private readonly universalAuthService: UniversalAuthService,
        @Inject(forwardRef(() => OrgAuthService)) private readonly orgAuthService: OrgAuthService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        // Ensure TenantGuard has run and resolved req.tenant
        if (!request.tenant) {
            throw new UnauthorizedException('Tenant context required');
        }
        const profile = await this.ensureUnifiedProfile(request);
        const membership = this.getTenantMembership(profile, request);

        if (membership) {
            return this.attachOrgMembershipContext(request, profile, membership);
        }

        if (this.hasGlobalAdminAccess(profile, request)) {
            this.attachGlobalAdminContext(request, profile);
            return true;
        }

        throw new UnauthorizedException('Access denied to this organisation');
    }

    private async ensureUnifiedProfile(request: Request): Promise<UnifiedUserProfile> {
        if (request.unifiedUser) {
            return request.unifiedUser;
        }

        const profile = await this.universalAuthService.getCurrentSessionProfile(request);
        request.unifiedUser = profile;
        request.user = {
            id: profile.id,
            type: profile.memberships.length ? 'org' : 'global',
            tenantId: profile.activeMembership?.tenantId ?? null,
            email: profile.email,
        };
        return profile;
    }

    private getTenantMembership(profile: UnifiedUserProfile, request: Request): UnifiedOrgMembership | null {
        if (!request.tenant) {
            return null;
        }

        const { id, slug } = request.tenant;

        const fromRequest = request.activeMembership;
        if (fromRequest && (fromRequest.tenantId === id || fromRequest.tenantSlug === slug)) {
            return fromRequest;
        }

        return profile.memberships.find((membership) =>
            membership.tenantId === id || membership.tenantSlug === slug,
        ) ?? null;
    }

    private async attachOrgMembershipContext(
        request: Request,
        profile: UnifiedUserProfile,
        membership: UnifiedOrgMembership,
    ): Promise<boolean> {
        if (!membership.isActive) {
            throw new UnauthorizedException('Organisation account inactive');
        }

        // Validate the membership and get org-specific profile
        const orgProfile = await this.orgAuthService.validateMembership(
            request.tenant!.id,
            membership.membershipId,
        );
        if (!orgProfile) {
            throw new UnauthorizedException('Organisation authentication failed');
        }

        request.activeMembership = membership;
        request.orgUser = {
            id: orgProfile.id,
            email: orgProfile.email,
            displayName: orgProfile.displayName,
            roles: orgProfile.roles,
            permissions: orgProfile.permissions,
        } as RequestOrgUser;

        request.principal = {
            type: 'org',
            id: orgProfile.id,
            tenantId: request.tenant!.id,
            permissions: orgProfile.permissions,
        } as RequestPrincipal;

        request.user = {
            id: orgProfile.id,
            type: 'org',
            tenantId: request.tenant!.id,
            email: orgProfile.email,
        } as RequestUserIdentity;

        if (profile.hasGlobalAccount) {
            request.globalUser = {
                id: profile.id,
                email: profile.email,
                name: profile.name ?? profile.email,
                isGlobalAdmin: profile.isGlobalAdmin,
            } as RequestGlobalUser;
        }

        return true;
    }

    private hasGlobalAdminAccess(profile: UnifiedUserProfile, request: Request): boolean {
        if (!profile.isGlobalAdmin || !request.tenant) {
            return false;
        }

        return profile.globalOrganisations.some((organisation) => organisation.id === request.tenant!.id);
    }

    private attachGlobalAdminContext(request: Request, profile: UnifiedUserProfile): void {
        request.activeMembership = null;
        request.orgUser = undefined;

        request.globalUser = {
            id: profile.id,
            email: profile.email,
            name: profile.name ?? profile.email,
            isGlobalAdmin: true,
        } as RequestGlobalUser;

        request.principal = {
            type: 'global-admin',
            id: profile.id,
            tenantId: request.tenant!.id,
            permissions: ['*'],
        } as RequestPrincipal;

        request.user = {
            id: profile.id,
            type: 'global',
            tenantId: request.tenant!.id,
            email: profile.email,
        } as RequestUserIdentity;
    }
}
