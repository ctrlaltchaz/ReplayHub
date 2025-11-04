import { CanActivate, ExecutionContext, ForbiddenException, forwardRef, Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../../database/prisma.service';
import { TenantService } from '../tenant.service';

export interface TenantData {
    id: string;
    slug: string;
    name: string;
}

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            tenant?: TenantData;
            principal?: {
                type: 'org' | 'global-admin';
                id: string;
                tenantId: string;
                permissions?: string[];
            };
            globalUser?: {
                id: string;
                email: string;
            };
        }
    }
}

@Injectable({ scope: Scope.REQUEST })
export class UnifiedTenantAuthGuard implements CanActivate {
    constructor(
        @Inject(forwardRef(() => PrismaService)) private prisma: PrismaService,
        @Inject(forwardRef(() => TenantService)) private tenantService: TenantService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log('[UnifiedTenantAuthGuard] Executing guard #2 in chain');
        const request = context.switchToHttp().getRequest<Request>();

        console.log(`[UnifiedTenantAuth] ===== GUARD CALLED! =====`);
        console.log(`[UnifiedTenantAuth] Request: ${request.method} ${request.url}`);
        console.log(`[UnifiedTenantAuth] Session orgUserId: ${request.session?.orgUserId || 'none'}`);
        console.log(`[UnifiedTenantAuth] Session userId: ${request.session?.userId || 'none'}`);

        // Ensure TenantGuard has run and resolved req.tenant
        if (!request.tenant) {
            console.log(`[UnifiedTenantAuth] FAIL: No tenant context`);
            throw new UnauthorizedException('Tenant context required');
        }

        console.log(`[UnifiedTenantAuth] Tenant: ${request.tenant.slug} (${request.tenant.id})`);

        // Try org session first (req.session.orgUserId)
        if (request.session?.orgUserId) {
            console.log(`[UnifiedTenantAuth] Attempting org session auth...`);
            return await this.handleOrgSession(request);
        }

        // Try global session (req.session.userId)  
        if (request.session?.userId) {
            console.log(`[UnifiedTenantAuth] Attempting global session auth...`);
            return await this.handleGlobalSession(request);
        }

        // No valid session found
        console.log(`[UnifiedTenantAuth] FAIL: No valid session found`);
        throw new UnauthorizedException('Authentication required');
    }

    private async handleOrgSession(request: Request): Promise<boolean> {
        console.log(`[UnifiedTenantAuth] handleOrgSession: DIRECT PRISMA VERSION - orgUserId=${request.session.orgUserId}, tenantId=${request.tenant.id}`);

        try {
            // EXACT same pattern as OrgAuthService.getProfile() - Set RLS context first
            console.log(`[UnifiedTenantAuth] handleOrgSession: Setting RLS context...`);
            await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${request.tenant.id}, true)`;

            // EXACT same query as OrgAuthService.getProfile()
            console.log(`[UnifiedTenantAuth] handleOrgSession: Running findUnique query...`);
            const orgUser = await this.prisma.orgUser.findUnique({
                where: { id: request.session.orgUserId },
                include: {
                    roles: {
                        include: {
                            role: {
                                include: {
                                    permissions: {
                                        include: {
                                            permission: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            console.log(`[UnifiedTenantAuth] handleOrgSession: Query result: ${orgUser ? `FOUND (${orgUser.email})` : 'NULL'}`);

            if (!orgUser) {
                console.log(`[UnifiedTenantAuth] handleOrgSession: ❌ User not found`);
                throw new UnauthorizedException('User not found');
            }

            // EXACT same processing as OrgAuthService.getProfile()
            const roles = orgUser.roles.map(ur => ur.role.name);
            const permissions = [...new Set(
                orgUser.roles.flatMap(ur =>
                    ur.role.permissions.map(rp => rp.permission.key)
                )
            )] as string[];

            // Set request properties
            request.orgUser = {
                id: orgUser.id,
                email: orgUser.email,
                displayName: orgUser.displayName,
                roles: roles,
                permissions: permissions
            };

            request.principal = {
                type: 'org',
                id: orgUser.id,
                tenantId: request.tenant.id,
                permissions: permissions
            };

            // Also set globalUser if this orgUser has one linked
            if (orgUser.globalUserId) {
                request.globalUser = {
                    id: orgUser.globalUserId,
                    email: orgUser.email, // Using orgUser email as fallback
                    name: orgUser.displayName || orgUser.email,
                    isGlobalAdmin: false,
                };
                console.log(`[UnifiedTenantAuth] handleOrgSession: Set globalUser with id=${orgUser.globalUserId}`);
            }

            console.log(`[UnifiedTenantAuth] handleOrgSession: ✅ SUCCESS - User: ${orgUser.email}, Permissions: ${permissions.length}`);
            return true;
        } catch (error) {
            console.log(`[UnifiedTenantAuth] handleOrgSession: ❌ EXCEPTION: ${error.message}`);
            throw new UnauthorizedException('Organisation authentication failed');
        }
    }

    private async handleGlobalSession(request: Request): Promise<boolean> {
        try {
            console.log(`[UnifiedTenantAuth] handleGlobalSession: Looking for globalUser with id=${request.session.userId}`);

            // CRITICAL: Set tenant context for RLS (Row-Level Security)
            await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${request.tenant.id}, true)`;
            console.log(`[UnifiedTenantAuth] handleGlobalSession: Set RLS context to tenantId=${request.tenant.id}`);

            // Load global user
            const globalUser = await this.prisma.globalUser.findFirst({
                where: {
                    id: request.session.userId
                }
            });

            if (!globalUser) {
                throw new UnauthorizedException('Invalid global session');
            }

            // FIRST: Check if global user is linked to an org user in this tenant
            console.log(`[UnifiedTenantAuth] handleGlobalSession: Checking for linked org user...`);
            const linkedOrgUser = await this.prisma.orgUser.findFirst({
                where: {
                    globalUserId: globalUser.id,
                    tenantId: request.tenant.id,
                    isActive: true
                },
                include: {
                    roles: {
                        include: {
                            role: {
                                include: {
                                    permissions: {
                                        include: {
                                            permission: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (linkedOrgUser) {
                console.log(`[UnifiedTenantAuth] handleGlobalSession: Found linked org user ${linkedOrgUser.email}`);

                // Process roles and permissions just like handleOrgSession
                const roles = linkedOrgUser.roles.map(ur => ur.role.name);
                const permissions = [...new Set(
                    linkedOrgUser.roles.flatMap(ur =>
                        ur.role.permissions.map(rp => rp.permission.key)
                    )
                )] as string[];

                // Set request properties as org user
                request.orgUser = {
                    id: linkedOrgUser.id,
                    email: linkedOrgUser.email,
                    displayName: linkedOrgUser.displayName,
                    roles: roles,
                    permissions: permissions
                };

                request.principal = {
                    type: 'org',
                    id: linkedOrgUser.id,
                    tenantId: request.tenant.id,
                    permissions: permissions
                };

                // Also attach global user info
                request.globalUser = {
                    id: globalUser.id,
                    email: globalUser.email,
                    name: globalUser.name || globalUser.email,
                    isGlobalAdmin: globalUser.isGlobalAdmin || false
                };

                console.log(`[UnifiedTenantAuth] handleGlobalSession: ✅ SUCCESS via linked org user - User: ${linkedOrgUser.email}, Permissions: ${permissions.length}`);
                return true;
            }

            // SECOND: Check if user is admin/owner of this org
            console.log(`[UnifiedTenantAuth] handleGlobalSession: No linked org user, checking for org admin...`);
            const orgAdmin = await this.prisma.organisationAdmin.findFirst({
                where: {
                    organisationId: request.tenant.id,
                    globalUserId: globalUser.id
                },
                include: {
                    organisation: true
                }
            });

            if (!orgAdmin) {
                // Global user exists but has no rights in this org
                console.log(`[UnifiedTenantAuth] handleGlobalSession: ❌ No linked org user and not an org admin`);
                throw new ForbiddenException('Access denied to this organisation');
            }

            // Attach globalUser and principal to request
            request.globalUser = {
                id: globalUser.id,
                email: globalUser.email,
                name: globalUser.name || globalUser.email,
                isGlobalAdmin: globalUser.isGlobalAdmin || false
            };

            // Global admins get all permissions in tenant
            request.principal = {
                type: 'global-admin',
                id: globalUser.id,
                tenantId: request.tenant.id,
                permissions: ['*'] // Superadmin permissions
            };

            console.log(`[UnifiedTenantAuth] handleGlobalSession: ✅ SUCCESS via global admin - id=${globalUser.id}, tenantId=${request.tenant.id}`);
            return true;
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw error;
            }
            console.error('Global session validation error:', error);
            throw new UnauthorizedException('Global authentication failed');
        }
    }
}