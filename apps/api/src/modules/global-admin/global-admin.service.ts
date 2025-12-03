import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { OrganisationProvisioningService } from '../global-organisations/organisation-provisioning.service';
import { DEFAULT_PERMISSION_DEFINITIONS } from '../rbac/permission-definitions';
import {
    CreateGlobalUserDto,
    CreateOrganisationDto,
    CreateOrganisationRoleDto,
    CreateOrganisationUserDto,
    ImpersonateDto,
    UpdateGlobalUserDto,
    UpdateOrganisationDto,
    UpdateOrganisationRoleDto,
    UpdateOrganisationUserDto
} from './dto/admin.dto';

@Injectable()
export class GlobalAdminService {
    private readonly logger = new Logger(GlobalAdminService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly provisioningService: OrganisationProvisioningService,
    ) { }

    // Overview stats
    async getOverview() {
        const [organisationCount, globalUserCount, recentIncidents] = await Promise.all([
            this.prisma.organisation.count(),
            this.prisma.globalUser.count(),
            this.prisma.incident.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                }
            })
        ]);

        // Count active tenants (orgs with users active in last 30 days)
        const activeTenants = await this.prisma.organisation.count();

        return {
            organisationCount,
            globalUserCount,
            activeTenantCount: activeTenants,
            recentIncidentCount: recentIncidents
        };
    }

    // Organisation management
    async getOrganisations(page = 1, limit = 20, search?: string) {
        const where = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { slug: { contains: search, mode: 'insensitive' as const } }
            ]
        } : {};

        const [organisations, total] = await Promise.all([
            this.prisma.organisation.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.organisation.count({ where })
        ]);

        return {
            organisations,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async createOrganisation(dto: CreateOrganisationDto, creatorGlobalUserId?: string) {
        // Check if slug already exists
        const existing = await this.prisma.organisation.findUnique({
            where: { slug: dto.slug }
        });

        if (existing) {
            throw new BadRequestException('Organisation slug already exists');
        }

        // Find or create global user for owner
        let ownerUser = await this.prisma.globalUser.findUnique({
            where: { email: dto.ownerEmail }
        });

        if (!ownerUser) {
            // Create temporary password - user will need to reset
            const tempPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            ownerUser = await this.prisma.globalUser.create({
                data: {
                    email: dto.ownerEmail,
                    passwordHash: hashedPassword
                }
            });
        }

        const organisation = await this.prisma.$transaction(async (tx) => {
            // Create organisation
            const organisation = await tx.organisation.create({
                data: {
                    name: dto.name,
                    slug: dto.slug,
                    ownerId: ownerUser.id
                }
            });

            // Create organisation admin record
            await tx.organisationAdmin.create({
                data: {
                    organisationId: organisation.id,
                    globalUserId: ownerUser.id,
                    role: 'owner'
                }
            });

            // Create OrgUser record for organization authentication
            await tx.orgUser.create({
                data: {
                    tenantId: organisation.id,
                    email: ownerUser.email,
                    passwordHash: ownerUser.passwordHash,
                    displayName: ownerUser.name || ownerUser.email,
                    globalUserId: ownerUser.id,
                    isActive: true,
                }
            });

            return organisation;
        });

        try {
            await this.provisioningService.provisionNewOrganisation(organisation.id, ownerUser.id);
            if (creatorGlobalUserId && creatorGlobalUserId !== ownerUser.id) {
                await this.ensureCreatorAccess(organisation.id, creatorGlobalUserId);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Provisioning failed for organisation ${organisation.id}: ${message}`);
        }

        return organisation;
    }

    async getOrganisation(orgId: string) {
        const organisation = await this.prisma.organisation.findUnique({
            where: { id: orgId },
            include: {
                owner: { select: { id: true, email: true } },
                admins: {
                    include: {
                        globalUser: { select: { id: true, email: true } }
                    }
                }
            }
        });

        if (!organisation) {
            throw new BadRequestException('Organisation not found');
        }

        return organisation;
    }

    async updateOrganisation(orgId: string, dto: UpdateOrganisationDto) {
        return this.prisma.organisation.update({
            where: { id: orgId },
            data: dto
        });
    }

    async deleteOrganisation(orgId: string) {
        const organisation = await this.prisma.organisation.findUnique({
            where: { id: orgId }
        });

        if (!organisation) {
            throw new BadRequestException('Organisation not found');
        }

        // Delete all related records manually to avoid foreign key constraint issues
        // This ensures everything is cleaned up properly

        // 1. Delete org users and their related data
        const orgUsers = await this.prisma.orgUser.findMany({
            where: { tenantId: orgId },
            select: { id: true }
        });

        const orgUserIds = orgUsers.map(u => u.id);

        // Delete audit logs for org users
        await this.prisma.auditLog.deleteMany({
            where: { orgUserId: { in: orgUserIds } }
        });

        // Delete org user roles
        await this.prisma.orgUserRole.deleteMany({
            where: { orgUserId: { in: orgUserIds } }
        });

        // Delete org users
        await this.prisma.orgUser.deleteMany({
            where: { tenantId: orgId }
        });

        // 2. Delete roles and permissions
        const roles = await this.prisma.role.findMany({
            where: { tenantId: orgId },
            select: { id: true }
        });

        const roleIds = roles.map(r => r.id);

        await this.prisma.rolePermission.deleteMany({
            where: { roleId: { in: roleIds } }
        });

        await this.prisma.role.deleteMany({
            where: { tenantId: orgId }
        });

        // 3. Delete Discord config
        await this.prisma.organizationDiscord.deleteMany({
            where: { tenantId: orgId }
        });

        // 4. Delete invites
        await this.prisma.orgInvite.deleteMany({
            where: { tenantId: orgId }
        });

        // 5. Delete organisation admins
        await this.prisma.organisationAdmin.deleteMany({
            where: { organisationId: orgId }
        });

        // 6. Finally delete the organisation
        await this.prisma.organisation.delete({
            where: { id: orgId }
        });

        return { message: 'Organisation and all related data deleted successfully' };
    }

    // Global user management
    async getGlobalUsers(page = 1, limit = 20, search?: string) {
        const where = search ? {
            OR: [
                { email: { contains: search, mode: 'insensitive' as const } },
                { name: { contains: search, mode: 'insensitive' as const } }
            ]
        } : {};

        const [users, total] = await Promise.all([
            this.prisma.globalUser.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    isGlobalAdmin: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.globalUser.count({ where })
        ]);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async createGlobalUser(dto: CreateGlobalUserDto) {
        const existing = await this.prisma.globalUser.findUnique({
            where: { email: dto.email }
        });

        if (existing) {
            throw new BadRequestException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        return this.prisma.globalUser.create({
            data: {
                email: dto.email,
                name: dto.name,
                passwordHash: hashedPassword,
                isGlobalAdmin: dto.isSuperAdmin || false
            },
            select: {
                id: true,
                email: true,
                name: true,
                isGlobalAdmin: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }

    async getGlobalUser(userId: string) {
        const user = await this.prisma.globalUser.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                isGlobalAdmin: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return user;
    }

    async updateGlobalUser(userId: string, dto: UpdateGlobalUserDto) {
        const user = await this.prisma.globalUser.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return this.prisma.globalUser.update({
            where: { id: userId },
            data: {
                ...(dto.email && { email: dto.email }),
                ...(dto.name && { name: dto.name }),
                ...(dto.isGlobalAdmin !== undefined && { isGlobalAdmin: dto.isGlobalAdmin }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive })
            },
            select: {
                id: true,
                email: true,
                name: true,
                isGlobalAdmin: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }

    async deleteGlobalUser(userId: string) {
        const user = await this.prisma.globalUser.findUnique({
            where: { id: userId },
            include: {
                organisations: true,
                organisationAdmins: true
            }
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Check if user owns any organizations
        if (user.organisations.length > 0) {
            throw new BadRequestException('Cannot delete user who owns organizations. Transfer ownership first.');
        }

        // Remove organization admin relationships
        await this.prisma.organisationAdmin.deleteMany({
            where: { globalUserId: userId }
        });

        // Delete the user
        await this.prisma.globalUser.delete({
            where: { id: userId }
        });

        return { message: 'User deleted successfully' };
    }

    // Audit logs
    async getGlobalAudit(page = 1, limit = 50) {
        const [audits, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, email: true } }
                }
            }),
            this.prisma.auditLog.count()
        ]);

        return {
            audits,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Impersonation
    async startImpersonation(globalUserId: string, dto: ImpersonateDto, req: any) {
        // Verify user exists (superadmin check will be done by guard)
        const user = await this.prisma.globalUser.findUnique({
            where: { id: globalUserId }
        });

        if (!user) {
            throw new ForbiddenException('User not found');
        }

        // Verify organisation exists
        const organisation = await this.prisma.organisation.findUnique({
            where: { id: dto.orgId }
        });

        if (!organisation) {
            throw new BadRequestException('Organisation not found');
        }

        // Log impersonation start
        await this.prisma.auditLog.create({
            data: {
                tenantId: dto.orgId,
                action: 'auth.impersonation.start',
                entity: 'organisation',
                entityType: 'ORGANISATION',
                entityId: dto.orgId,
                description: 'Global admin impersonation session started',
                metadata: {
                    type: 'impersonation_start',
                    targetOrgUserId: dto.orgUserId,
                    reason: dto.reason ?? 'Administrative action',
                },
                userId: globalUserId,
            },
        });

        // Set impersonation session (expires in 1 hour)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        req.session.impersonation = {
            originalUserId: globalUserId,
            targetOrgId: dto.orgId,
            targetOrgUserId: dto.orgUserId,
            expiresAt,
            reason: dto.reason
        };

        return {
            success: true,
            expiresAt,
            targetOrg: organisation.slug
        };
    }

    async stopImpersonation(req: any) {
        const impersonation = req.session.impersonation;

        if (!impersonation) {
            throw new BadRequestException('No active impersonation session');
        }

        // Log impersonation end
        await this.prisma.auditLog.create({
            data: {
                tenantId: impersonation.targetOrgId,
                action: 'auth.impersonation.stop',
                entity: 'organisation',
                entityType: 'ORGANISATION',
                entityId: impersonation.targetOrgId,
                description: 'Global admin impersonation session ended',
                metadata: {
                    type: 'impersonation_stop',
                    targetOrgUserId: impersonation.targetOrgUserId,
                },
                userId: impersonation.originalUserId,
            },
        });

        // Clear impersonation
        delete req.session.impersonation;

        return { success: true };
    }

    async getImpersonationStatus(req: any) {
        const impersonation = req.session.impersonation;

        if (!impersonation) {
            return {
                isImpersonating: false
            };
        }

        // Check if impersonation has expired
        if (new Date() > new Date(impersonation.expiresAt)) {
            delete req.session.impersonation;
            return {
                isImpersonating: false
            };
        }

        // Get organization details
        const organisation = await this.prisma.organisation.findUnique({
            where: { id: impersonation.targetOrgId },
            select: { id: true, name: true, slug: true }
        });

        return {
            isImpersonating: true,
            targetOrg: organisation,
            originalUserId: impersonation.originalUserId,
            expiresAt: impersonation.expiresAt,
            reason: impersonation.reason
        };
    }

    // Organization Users Management
    async getOrganisationUsers(orgId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

            const users = await tx.orgUser.findMany({
                where: { tenantId: orgId },
                include: {
                    roles: {
                        include: {
                            role: {
                                include: {
                                    permissions: {
                                        include: {
                                            permission: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return users.map(user => ({
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                isActive: user.isActive,
                joinedAt: user.createdAt,
                roles: user.roles.map(ur => ({
                    id: ur.role.id,
                    name: ur.role.name,
                    permissions: ur.role.permissions.map(rp => ({
                        id: rp.permission.id,
                        key: rp.permission.key,
                        group: rp.permission.group,
                        description: rp.permission.desc
                    }))
                }))
            }));
        });
    }

    async createOrganisationUser(orgId: string, dto: CreateOrganisationUserDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

            // Check if user already exists
            const existingUser = await tx.orgUser.findFirst({
                where: {
                    email: dto.email,
                    tenantId: orgId
                }
            });

            if (existingUser) {
                throw new BadRequestException('User with this email already exists in the organization');
            }

            let user;
            let globalUser = null;

            // If globalUserId is provided, link existing global user
            if (dto.globalUserId) {
                globalUser = await tx.globalUser.findUnique({
                    where: { id: dto.globalUserId }
                });

                if (!globalUser) {
                    throw new BadRequestException('Global user not found');
                }

                // Create OrgUser linked to the global user
                user = await tx.orgUser.create({
                    data: {
                        email: globalUser.email,
                        displayName: globalUser.name || globalUser.email,
                        tenantId: orgId,
                        isActive: dto.isActive ?? true,
                        passwordHash: globalUser.passwordHash, // Use same password as global user
                        globalUserId: globalUser.id // Link to global user
                    }
                });

                // CRITICAL: Create organisationAdmin record so global user can access org endpoints
                const existingAdmin = await tx.organisationAdmin.findFirst({
                    where: {
                        organisationId: orgId,
                        globalUserId: globalUser.id
                    }
                });

                if (!existingAdmin) {
                    await tx.organisationAdmin.create({
                        data: {
                            organisationId: orgId,
                            globalUserId: globalUser.id,
                            role: 'admin' // Default role for added users
                        }
                    });
                    console.log(`[GlobalAdminService] Created organisationAdmin record for ${globalUser.email} in org ${orgId}`);
                }
            } else {
                // Create new standalone user
                if (!dto.firstName || !dto.lastName) {
                    throw new BadRequestException('First name and last name are required for new users');
                }

                user = await tx.orgUser.create({
                    data: {
                        email: dto.email,
                        displayName: `${dto.firstName} ${dto.lastName}`,
                        tenantId: orgId,
                        isActive: dto.isActive ?? true,
                        // If password provided, hash it, otherwise generate a random one
                        passwordHash: dto.password
                            ? await bcrypt.hash(dto.password, 10)
                            : await bcrypt.hash(Math.random().toString(36), 10)
                    }
                });
            }

            // Assign roles if provided
            if (dto.roleIds && dto.roleIds.length > 0) {
                await tx.orgUserRole.createMany({
                    data: dto.roleIds.map((roleId: string) => ({
                        orgUserId: user.id,
                        roleId,
                        tenantId: orgId
                    }))
                });
            }

            // Log action
            await tx.auditLog.create({
                data: {
                    tenantId: orgId,
                    action: 'org.user.create',
                    entity: 'org_user',
                    entityType: 'ORG_USER',
                    entityId: user.id,
                    description: `Organisation user ${user.email} created`,
                    metadata: {
                        email: dto.email,
                        roles: dto.roleIds,
                    },
                    orgUserId: user.id,
                },
            });

            return user;
        });
    }

    async updateOrganisationUser(orgId: string, userId: string, dto: UpdateOrganisationUserDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

            // Update user
            const displayName = dto.firstName && dto.lastName
                ? `${dto.firstName} ${dto.lastName}`
                : undefined;

            const user = await tx.orgUser.update({
                where: {
                    id: userId,
                    tenantId: orgId
                },
                data: {
                    ...(displayName && { displayName }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive })
                }
            });

            // Update roles if provided
            if (dto.roleIds !== undefined) {
                // Remove existing roles
                await tx.orgUserRole.deleteMany({
                    where: {
                        orgUserId: userId,
                        tenantId: orgId
                    }
                });

                // Add new roles
                if (dto.roleIds.length > 0) {
                    await tx.orgUserRole.createMany({
                        data: dto.roleIds.map((roleId: string) => ({
                            orgUserId: userId,
                            roleId,
                            tenantId: orgId
                        }))
                    });
                }
            }

            // Log action
            await tx.auditLog.create({
                data: {
                    tenantId: orgId,
                    action: 'org.user.update',
                    entity: 'org_user',
                    entityType: 'ORG_USER',
                    entityId: userId,
                    description: `Organisation user ${user.email} updated`,
                    metadata: {
                        ...(dto.firstName && { firstName: dto.firstName }),
                        ...(dto.lastName && { lastName: dto.lastName }),
                        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                        ...(dto.roleIds !== undefined && { roleIds: dto.roleIds }),
                    },
                    orgUserId: userId,
                },
            });

            return user;
        });
    }

    async deleteOrganisationUser(orgId: string, userId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

            // Remove user roles first
            await tx.orgUserRole.deleteMany({
                where: {
                    orgUserId: userId,
                    tenantId: orgId
                }
            });

            // Delete user
            const user = await tx.orgUser.delete({
                where: {
                    id: userId,
                    tenantId: orgId
                }
            });

            // Log action
            await tx.auditLog.create({
                data: {
                    tenantId: orgId,
                    action: 'org.user.delete',
                    entity: 'org_user',
                    entityType: 'ORG_USER',
                    entityId: userId,
                    description: `Organisation user ${user.email} deleted`,
                    metadata: {
                        email: user.email,
                    },
                    orgUserId: userId,
                },
            });

            return { success: true };
        });
    }

    // Organization Roles Management
    async getOrganisationRoles(orgId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

            const roles = await tx.role.findMany({
                where: { tenantId: orgId },
                include: {
                    permissions: {
                        include: {
                            permission: true
                        }
                    },
                    membershipRoles: {
                        select: {
                            id: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' }
            });

            return roles.map(role => ({
                id: role.id,
                name: role.name,
                description: role.desc,
                userCount: role.membershipRoles.length,
                createdAt: role.createdAt,
                updatedAt: role.updatedAt,
                permissions: role.permissions.map(rp => ({
                    id: rp.permission.id,
                    key: rp.permission.key,
                    group: rp.permission.group,
                    description: rp.permission.desc
                }))
            }));
        });
    }

    async createOrganisationRole(orgId: string, dto: CreateOrganisationRoleDto) {
        return await this.prisma.$transaction(async (tx) => {
            try {
                console.log(`[DEBUG] Creating role for org: ${orgId}`, dto);

                // Set tenant context for RLS
                await tx.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

                // Create role
                const role = await tx.role.create({
                    data: {
                        name: dto.name,
                        desc: dto.description,
                        tenantId: orgId
                    }
                });

                console.log(`[DEBUG] Created role:`, role);

                // Assign permissions if provided
                if (dto.permissionIds && dto.permissionIds.length > 0) {
                    console.log(`[DEBUG] Assigning ${dto.permissionIds.length} permissions to role`);
                    await tx.rolePermission.createMany({
                        data: dto.permissionIds.map((permissionId: string) => ({
                            roleId: role.id,
                            permissionId,
                            tenantId: orgId
                        }))
                    });
                }

                // Log action
                await tx.auditLog.create({
                    data: {
                        tenantId: orgId,
                        action: 'org.role.create',
                        entity: 'role',
                        entityType: 'ROLE',
                        entityId: role.id,
                        description: `Role ${dto.name} created`,
                        metadata: {
                            name: dto.name,
                            permissions: dto.permissionIds,
                        },
                    },
                });

                console.log(`[DEBUG] Role creation completed successfully`);
                return role;
            } catch (error) {
                console.error(`[ERROR] Failed to create role for org ${orgId}:`, error);
                throw error;
            }
        });
    }

    async updateOrganisationRole(orgId: string, roleId: string, dto: UpdateOrganisationRoleDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

            // Check if role is system role
            const existingRole = await tx.role.findFirst({
                where: {
                    id: roleId,
                    tenantId: orgId
                }
            });

            if (!existingRole) {
                throw new BadRequestException('Role not found');
            }

            // For now, we don't have system roles concept in the schema
            // This check can be added later if needed

            // Update role
            const role = await tx.role.update({
                where: {
                    id: roleId,
                    tenantId: orgId
                },
                data: {
                    name: dto.name,
                    desc: dto.description
                }
            });

            // Update permissions if provided
            if (dto.permissionIds !== undefined) {
                // Remove existing permissions
                await tx.rolePermission.deleteMany({
                    where: {
                        roleId,
                        tenantId: orgId
                    }
                });

                // Add new permissions
                if (dto.permissionIds.length > 0) {
                    await tx.rolePermission.createMany({
                        data: dto.permissionIds.map((permissionId: string) => ({
                            roleId,
                            permissionId,
                            tenantId: orgId
                        }))
                    });
                }
            }

            const metadata: Prisma.JsonObject = {};
            if (dto.name !== undefined) {
                metadata.name = dto.name;
            }
            if (dto.description !== undefined) {
                metadata.description = dto.description;
            }
            if (dto.permissionIds !== undefined) {
                metadata.permissionIds = dto.permissionIds;
            }

            // Log action
            await tx.auditLog.create({
                data: {
                    tenantId: orgId,
                    action: 'org.role.update',
                    entity: 'role',
                    entityType: 'ROLE',
                    entityId: roleId,
                    description: `Role ${dto.name ?? existingRole.name} updated`,
                    metadata: Object.keys(metadata).length ? metadata : Prisma.JsonNull,
                },
            });

            return role;
        });
    }

    async deleteOrganisationRole(orgId: string, roleId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

            // Check if role is system role
            const existingRole = await tx.role.findFirst({
                where: {
                    id: roleId,
                    tenantId: orgId
                }
            });

            if (!existingRole) {
                throw new BadRequestException('Role not found');
            }

            // For now, we don't have system roles concept in the schema
            // This check can be added later if needed

            // Remove role from users
            await tx.orgUserRole.deleteMany({
                where: {
                    roleId,
                    tenantId: orgId
                }
            });

            // Remove role permissions
            await tx.rolePermission.deleteMany({
                where: {
                    roleId,
                    tenantId: orgId
                }
            });

            // Delete role
            await tx.role.delete({
                where: {
                    id: roleId,
                    tenantId: orgId
                }
            });

            // Log action
            await tx.auditLog.create({
                data: {
                    tenantId: orgId,
                    action: 'org.role.delete',
                    entity: 'role',
                    entityType: 'ROLE',
                    entityId: roleId,
                    description: `Role ${existingRole.name} deleted`,
                    metadata: {
                        name: existingRole.name,
                    },
                },
            });

            return { success: true };
        });
    }

    async getOrganisationPermissions(orgId: string) {
        return await this.prisma.$transaction(async (tx) => {
            try {
                console.log(`[DEBUG] Getting permissions for org: ${orgId}`);

                // Set tenant context for RLS
                await tx.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

                let permissions = await tx.permission.findMany({
                    where: { tenantId: orgId },
                    orderBy: [
                        { group: 'asc' },
                        { key: 'asc' }
                    ]
                });

                console.log(`[DEBUG] Found ${permissions.length} permissions`);

                // If no permissions exist, create default permissions
                if (permissions.length === 0) {
                    console.log(`[DEBUG] Creating default permissions for org: ${orgId}`);
                    await this.createDefaultPermissions(tx, orgId);
                    permissions = await tx.permission.findMany({
                        where: { tenantId: orgId },
                        orderBy: [
                            { group: 'asc' },
                            { key: 'asc' }
                        ]
                    });
                    console.log(`[DEBUG] Created ${permissions.length} default permissions`);
                }

                const result = permissions.map(permission => ({
                    id: permission.id,
                    key: permission.key,
                    group: permission.group,
                    description: permission.desc
                }));

                console.log(`[DEBUG] Returning permissions:`, result);
                return result;
            } catch (error) {
                console.error(`[ERROR] Failed to get permissions for org ${orgId}:`, error);
                throw error;
            }
        });
    }

    private async createDefaultPermissions(tx: Prisma.TransactionClient, orgId: string) {
        await tx.permission.createMany({
            data: DEFAULT_PERMISSION_DEFINITIONS.map(permission => ({
                key: permission.key,
                group: permission.group,
                desc: permission.description,
                tenantId: orgId,
            })),
            skipDuplicates: true,
        });
    }

    private async ensureCreatorAccess(orgId: string, creatorGlobalUserId: string) {
        await this.ensureOrganisationAdminRecord(orgId, creatorGlobalUserId, 'admin');
        await this.provisioningService.ensureOrgUserWithRole(orgId, creatorGlobalUserId, 'ADMIN');
        await this.provisioningService.ensureOrgUserWithRole(orgId, creatorGlobalUserId, 'ops_admin');
    }

    private async ensureOrganisationAdminRecord(orgId: string, globalUserId: string, role: 'owner' | 'admin' = 'admin') {
        const existing = await this.prisma.organisationAdmin.findFirst({
            where: {
                organisationId: orgId,
                globalUserId,
            },
        });

        if (existing) {
            if (existing.role !== role) {
                await this.prisma.organisationAdmin.update({
                    where: { id: existing.id },
                    data: { role },
                });
            }
            return;
        }

        await this.prisma.organisationAdmin.create({
            data: {
                organisationId: orgId,
                globalUserId,
                role,
            },
        });
    }
}
