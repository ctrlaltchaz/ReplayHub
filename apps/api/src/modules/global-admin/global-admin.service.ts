import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
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
    constructor(private prisma: PrismaService) { }

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

    async createOrganisation(dto: CreateOrganisationDto) {
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

        return this.prisma.$transaction(async (tx) => {
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
                    displayName: ownerUser.email
                }
            });

            return organisation;
        });
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

        // Delete the organisation (this should cascade to related records)
        await this.prisma.organisation.delete({
            where: { id: orgId }
        });

        return { message: 'Organisation deleted successfully' };
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
                action: 'LOGIN', // Using existing enum value
                entityType: 'ORGANISATION',
                entityId: dto.orgId,
                userId: globalUserId,
                details: JSON.stringify({
                    type: 'impersonation_start',
                    targetOrgUserId: dto.orgUserId,
                    reason: dto.reason || 'Administrative action'
                })
            }
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
                action: 'LOGOUT', // Using existing enum value
                entityType: 'ORGANISATION',
                entityId: impersonation.targetOrgId,
                userId: impersonation.originalUserId,
                details: JSON.stringify({
                    type: 'impersonation_stop'
                })
            }
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
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

        const users = await this.prisma.orgUser.findMany({
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
    }

    async createOrganisationUser(orgId: string, dto: CreateOrganisationUserDto) {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

        // Check if user already exists
        const existingUser = await this.prisma.orgUser.findFirst({
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
            globalUser = await this.prisma.globalUser.findUnique({
                where: { id: dto.globalUserId }
            });

            if (!globalUser) {
                throw new BadRequestException('Global user not found');
            }

            // Create OrgUser linked to the global user
            user = await this.prisma.orgUser.create({
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
            const existingAdmin = await this.prisma.organisationAdmin.findFirst({
                where: {
                    organisationId: orgId,
                    globalUserId: globalUser.id
                }
            });

            if (!existingAdmin) {
                await this.prisma.organisationAdmin.create({
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

            user = await this.prisma.orgUser.create({
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
            await this.prisma.orgUserRole.createMany({
                data: dto.roleIds.map((roleId: string) => ({
                    orgUserId: user.id,
                    roleId,
                    tenantId: orgId
                }))
            });
        }

        // Log action
        await this.prisma.auditLog.create({
            data: {
                tenantId: orgId,
                action: 'CREATE',
                entityType: 'ORG_USER',
                entityId: user.id,
                orgUserId: user.id,
                details: JSON.stringify({
                    email: dto.email,
                    roles: dto.roleIds
                })
            }
        });

        return user;
    }

    async updateOrganisationUser(orgId: string, userId: string, dto: UpdateOrganisationUserDto) {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

        // Update user
        const displayName = dto.firstName && dto.lastName
            ? `${dto.firstName} ${dto.lastName}`
            : undefined;

        const user = await this.prisma.orgUser.update({
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
            await this.prisma.orgUserRole.deleteMany({
                where: {
                    orgUserId: userId,
                    tenantId: orgId
                }
            });

            // Add new roles
            if (dto.roleIds.length > 0) {
                await this.prisma.orgUserRole.createMany({
                    data: dto.roleIds.map((roleId: string) => ({
                        orgUserId: userId,
                        roleId,
                        tenantId: orgId
                    }))
                });
            }
        }

        // Log action
        await this.prisma.auditLog.create({
            data: {
                tenantId: orgId,
                action: 'UPDATE',
                entityType: 'ORG_USER',
                entityId: userId,
                orgUserId: userId,
                details: JSON.stringify(dto)
            }
        });

        return user;
    }

    async deleteOrganisationUser(orgId: string, userId: string) {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

        // Remove user roles first
        await this.prisma.orgUserRole.deleteMany({
            where: {
                orgUserId: userId,
                tenantId: orgId
            }
        });

        // Delete user
        const user = await this.prisma.orgUser.delete({
            where: {
                id: userId,
                tenantId: orgId
            }
        });

        // Log action
        await this.prisma.auditLog.create({
            data: {
                tenantId: orgId,
                action: 'DELETE',
                entityType: 'ORG_USER',
                entityId: userId,
                orgUserId: userId,
                details: JSON.stringify({
                    email: user.email
                })
            }
        });

        return { success: true };
    }

    // Organization Roles Management
    async getOrganisationRoles(orgId: string) {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

        const roles = await this.prisma.role.findMany({
            where: { tenantId: orgId },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                },
                users: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return roles.map(role => ({
            id: role.id,
            name: role.name,
            description: role.desc,
            userCount: role.users.length,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
            permissions: role.permissions.map(rp => ({
                id: rp.permission.id,
                key: rp.permission.key,
                group: rp.permission.group,
                description: rp.permission.desc
            }))
        }));
    }

    async createOrganisationRole(orgId: string, dto: CreateOrganisationRoleDto) {
        try {
            console.log(`[DEBUG] Creating role for org: ${orgId}`, dto);

            // Set tenant context for RLS
            await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

            // Create role
            const role = await this.prisma.role.create({
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
                await this.prisma.rolePermission.createMany({
                    data: dto.permissionIds.map((permissionId: string) => ({
                        roleId: role.id,
                        permissionId,
                        tenantId: orgId
                    }))
                });
            }

            // Log action
            await this.prisma.auditLog.create({
                data: {
                    tenantId: orgId,
                    action: 'CREATE',
                    entityType: 'ROLE',
                    entityId: role.id,
                    details: JSON.stringify({
                        name: dto.name,
                        permissions: dto.permissionIds
                    })
                }
            });

            console.log(`[DEBUG] Role creation completed successfully`);
            return role;
        } catch (error) {
            console.error(`[ERROR] Failed to create role for org ${orgId}:`, error);
            throw error;
        }
    }

    async updateOrganisationRole(orgId: string, roleId: string, dto: UpdateOrganisationRoleDto) {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

        // Check if role is system role
        const existingRole = await this.prisma.role.findFirst({
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
        const role = await this.prisma.role.update({
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
            await this.prisma.rolePermission.deleteMany({
                where: {
                    roleId,
                    tenantId: orgId
                }
            });

            // Add new permissions
            if (dto.permissionIds.length > 0) {
                await this.prisma.rolePermission.createMany({
                    data: dto.permissionIds.map((permissionId: string) => ({
                        roleId,
                        permissionId,
                        tenantId: orgId
                    }))
                });
            }
        }

        // Log action
        await this.prisma.auditLog.create({
            data: {
                tenantId: orgId,
                action: 'UPDATE',
                entityType: 'ROLE',
                entityId: roleId,
                details: JSON.stringify(dto)
            }
        });

        return role;
    }

    async deleteOrganisationRole(orgId: string, roleId: string) {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

        // Check if role is system role
        const existingRole = await this.prisma.role.findFirst({
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
        await this.prisma.orgUserRole.deleteMany({
            where: {
                roleId,
                tenantId: orgId
            }
        });

        // Remove role permissions
        await this.prisma.rolePermission.deleteMany({
            where: {
                roleId,
                tenantId: orgId
            }
        });

        // Delete role
        await this.prisma.role.delete({
            where: {
                id: roleId,
                tenantId: orgId
            }
        });

        // Log action
        await this.prisma.auditLog.create({
            data: {
                tenantId: orgId,
                action: 'DELETE',
                entityType: 'ROLE',
                entityId: roleId,
                details: JSON.stringify({
                    name: existingRole.name
                })
            }
        });

        return { success: true };
    }

    async getOrganisationPermissions(orgId: string) {
        try {
            console.log(`[DEBUG] Getting permissions for org: ${orgId}`);

            // Set tenant context for RLS
            await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${orgId}, true)`;

            let permissions = await this.prisma.permission.findMany({
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
                await this.createDefaultPermissions(orgId);
                permissions = await this.prisma.permission.findMany({
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
    }

    private async createDefaultPermissions(orgId: string) {
        const defaultPermissions = [
            // Calendar permissions
            { key: 'calendar.view', group: 'calendar', desc: 'View calendar events' },
            { key: 'calendar.manage', group: 'calendar', desc: 'Manage calendar settings and events' },

            // Events permissions
            { key: 'events.view', group: 'events', desc: 'View events' },
            { key: 'events.create', group: 'events', desc: 'Create new events' },
            { key: 'events.edit', group: 'events', desc: 'Edit existing events' },
            { key: 'events.delete', group: 'events', desc: 'Delete events' },
            { key: 'events.manage', group: 'events', desc: 'Full event management (create, edit, delete)' },

            // Runsheet permissions
            { key: 'runsheet.view', group: 'runsheet', desc: 'View runsheets' },
            { key: 'runsheet.edit', group: 'runsheet', desc: 'Edit runsheets' },
            { key: 'runsheet.approve', group: 'runsheet', desc: 'Approve runsheets' },
            { key: 'runsheet.lock', group: 'runsheet', desc: 'Lock runsheets' },

            // Resources permissions
            { key: 'resources.view', group: 'resources', desc: 'View resources' },
            { key: 'resources.manage', group: 'resources', desc: 'Manage resources (create, edit, delete)' },

            // Checklist permissions
            { key: 'checklists.view', group: 'checklists', desc: 'View checklists' },
            { key: 'checklists.run', group: 'checklists', desc: 'Execute checklists' },
            { key: 'checklists.manage', group: 'checklists', desc: 'Manage checklist templates' },

            // Inventory permissions
            { key: 'inventory.view', group: 'inventory', desc: 'View inventory items' },
            { key: 'inventory.update', group: 'inventory', desc: 'Update inventory status' },
            { key: 'inventory.book', group: 'inventory', desc: 'Book inventory items' },

            // Asset permissions
            { key: 'assets.upload', group: 'assets', desc: 'Upload assets' },
            { key: 'assets.approve', group: 'assets', desc: 'Approve uploaded assets' },
            { key: 'assets.manage', group: 'assets', desc: 'Manage asset library' },

            // Roster permissions
            { key: 'roster.view', group: 'roster', desc: 'View team rosters' },
            { key: 'roster.manage', group: 'roster', desc: 'Manage team rosters' },
            { key: 'team.create', group: 'roster', desc: 'Create new teams' },
            { key: 'team.update', group: 'roster', desc: 'Update teams' },
            { key: 'team.archive', group: 'roster', desc: 'Archive teams' },
            { key: 'team.select_lineup', group: 'roster', desc: 'Select team lineups' },

            // Player permissions
            { key: 'player.create', group: 'roster', desc: 'Create new players' },
            { key: 'player.update', group: 'roster', desc: 'Update player profiles' },
            { key: 'player.link_user', group: 'roster', desc: 'Link players to org users' },
            { key: 'players.view', group: 'roster', desc: 'View player profiles' },
            { key: 'players.edit_profile_self', group: 'roster', desc: 'Edit own player profile' },
            { key: 'players.edit_admin', group: 'roster', desc: 'Edit any player profile' },

            // Availability permissions
            { key: 'availability.manage', group: 'roster', desc: 'Manage player availability' },
            { key: 'availability.set_self', group: 'roster', desc: 'Set own availability' },

            // Lineup permissions
            { key: 'lineup.create', group: 'roster', desc: 'Create lineups' },
            { key: 'lineup.update', group: 'roster', desc: 'Update lineups' },
            { key: 'lineup.publish', group: 'roster', desc: 'Publish lineups' },

            // Achievement permissions
            { key: 'achievement.create', group: 'roster', desc: 'Create achievements' },
            { key: 'achievement.approve', group: 'roster', desc: 'Approve achievements' },
            { key: 'achievements.create', group: 'roster', desc: 'Create achievements' },
            { key: 'achievements.approve', group: 'roster', desc: 'Approve achievements' },

            // Game Log permissions
            { key: 'gamelog.view', group: 'gamelog', desc: 'View match logs and results' },
            { key: 'gamelog.manage', group: 'gamelog', desc: 'Create and edit match logs' },
            { key: 'gamelog.approve', group: 'gamelog', desc: 'Approve match logs and lock editing' },

            // Player Stats permissions
            { key: 'stats.record', group: 'stats', desc: 'Record player statistics' },
            { key: 'stats.edit', group: 'stats', desc: 'Edit player statistics' },
            { key: 'stats.approve', group: 'stats', desc: 'Approve player statistics' },

            // Reporting permissions
            { key: 'reports.view', group: 'reports', desc: 'View reports' },
            { key: 'reports.export', group: 'reports', desc: 'Export reports (PDF/CSV)' },

            // Incidents permissions
            { key: 'incidents.view', group: 'incidents', desc: 'View incidents' },
            { key: 'incidents.create', group: 'incidents', desc: 'Create incidents' },
            { key: 'incidents.manage', group: 'incidents', desc: 'Manage incidents (update, delete, assign, RCA)' },

            // User management permissions
            { key: 'users.view', group: 'users', desc: 'View users' },
            { key: 'users.read', group: 'users', desc: 'Read user details' },
            { key: 'users.create', group: 'users', desc: 'Create users' },
            { key: 'users.update', group: 'users', desc: 'Update users' },
            { key: 'users.delete', group: 'users', desc: 'Delete users' },

            // Invite permissions
            { key: 'invites.create', group: 'invites', desc: 'Create invitations' },
            { key: 'invites.read', group: 'invites', desc: 'View invitations' },
            { key: 'invites.delete', group: 'invites', desc: 'Revoke invitations' },

            // Organisation settings
            { key: 'org.settings.view', group: 'org', desc: 'View organisation settings' },
            { key: 'org.settings.manage', group: 'org', desc: 'Manage organisation settings' },

            // Organisation admin permissions
            { key: 'org.users.view', group: 'org', desc: 'View org users' },
            { key: 'org.users.manage', group: 'org', desc: 'Manage org users' },
            { key: 'org.roles.view', group: 'org', desc: 'View roles and permissions' },
            { key: 'org.roles.manage', group: 'org', desc: 'Manage roles and permissions' },
            { key: 'org.invites.view', group: 'org', desc: 'View invitations' },
            { key: 'org.invites.manage', group: 'org', desc: 'Manage invitations' },
            { key: 'org.audit.view', group: 'org', desc: 'View audit logs' },
        ];

        await this.prisma.permission.createMany({
            data: defaultPermissions.map(perm => ({
                ...perm,
                tenantId: orgId
            })),
            skipDuplicates: true
        });
    }
}