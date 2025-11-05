import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface CreateRoleDto {
    name: string;
    description?: string;
    permissions: string[]; // permission keys
}

export interface UpdateRoleDto {
    name?: string;
    description?: string;
    permissions?: string[];
}

export interface AssignRoleDto {
    orgUserId: string;
    roleIds: string[];
}

export interface RemoveRoleDto {
    orgUserId: string;
    roleIds: string[];
}

export interface RoleWithPermissionsDto {
    id: string;
    name: string;
    description?: string;
    permissions: {
        id: string;
        key: string;
        group?: string;
        description?: string;
    }[];
    userCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class RoleService {
    constructor(private prisma: PrismaService) { }

    async createRole(tenantId: string, createRoleDto: CreateRoleDto): Promise<RoleWithPermissionsDto> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Check if role name already exists
            const existingRole = await tx.role.findUnique({
                where: {
                    tenantId_name: {
                        tenantId,
                        name: createRoleDto.name,
                    },
                },
            });

            if (existingRole) {
                throw new ConflictException('Role name already exists');
            }

            // Verify all permissions exist
            const permissions = await tx.permission.findMany({
                where: {
                    tenantId,
                    key: { in: createRoleDto.permissions },
                },
            });

            if (permissions.length !== createRoleDto.permissions.length) {
                const foundKeys = permissions.map(p => p.key);
                const missing = createRoleDto.permissions.filter(key => !foundKeys.includes(key));
                throw new BadRequestException(`Invalid permissions: ${missing.join(', ')}`);
            }

            // Create role
            const role = await tx.role.create({
                data: {
                    tenantId,
                    name: createRoleDto.name,
                    desc: createRoleDto.description,
                },
            });

            // Add permissions
            await tx.rolePermission.createMany({
                data: permissions.map(permission => ({
                    tenantId,
                    roleId: role.id,
                    permissionId: permission.id,
                })),
            });

            // Return role with permissions
            const result = await tx.role.findUnique({
                where: { id: role.id },
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });

            return this.mapRoleToDto(result!);
        });
    }

    async getRoles(tenantId: string): Promise<RoleWithPermissionsDto[]> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const roles = await tx.role.findMany({
                where: { tenantId },
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
                orderBy: { name: 'asc' },
            });

            return roles.map(role => this.mapRoleToDto(role));
        });
    }

    async getRoleById(tenantId: string, roleId: string): Promise<RoleWithPermissionsDto | null> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const role = await tx.role.findFirst({
                where: {
                    id: roleId,
                    tenantId,
                },
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                    users: true, // Include users to get count
                },
            });

            if (!role) return null;

            // Get user count (includes both org users and global users with this role)
            const userCount = await tx.orgUserRole.count({
                where: {
                    roleId: roleId,
                    tenantId,
                },
            });

            return this.mapRoleToDto(role, userCount);
        });
    }

    async updateRole(tenantId: string, roleId: string, updateRoleDto: UpdateRoleDto): Promise<RoleWithPermissionsDto> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Check role exists
            const existingRole = await tx.role.findFirst({
                where: {
                    id: roleId,
                    tenantId,
                },
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });

            if (!existingRole) {
                throw new NotFoundException('Role not found');
            }

            // Check if new name conflicts
            if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
                const nameConflict = await tx.role.findUnique({
                    where: {
                        tenantId_name: {
                            tenantId,
                            name: updateRoleDto.name,
                        },
                    },
                });

                if (nameConflict) {
                    throw new ConflictException('Role name already exists');
                }
            }

            // Update role basic info
            await tx.role.update({
                where: { id: roleId },
                data: {
                    name: updateRoleDto.name,
                    desc: updateRoleDto.description,
                },
            });

            // Update permissions if provided
            if (updateRoleDto.permissions) {
                // Verify new permissions exist
                const permissions = await tx.permission.findMany({
                    where: {
                        tenantId,
                        key: { in: updateRoleDto.permissions },
                    },
                });

                if (permissions.length !== updateRoleDto.permissions.length) {
                    const foundKeys = permissions.map(p => p.key);
                    const missing = updateRoleDto.permissions.filter(key => !foundKeys.includes(key));
                    throw new BadRequestException(`Invalid permissions: ${missing.join(', ')}`);
                }

                // Remove existing permissions
                await tx.rolePermission.deleteMany({
                    where: {
                        tenantId,
                        roleId,
                    },
                });

                // Add new permissions
                await tx.rolePermission.createMany({
                    data: permissions.map(permission => ({
                        tenantId,
                        roleId,
                        permissionId: permission.id,
                    })),
                });
            }

            // Return updated role
            const result = await tx.role.findUnique({
                where: { id: roleId },
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });

            return this.mapRoleToDto(result!);
        });
    }

    async deleteRole(tenantId: string, roleId: string): Promise<{ success: boolean }> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Check role exists
            const role = await tx.role.findFirst({
                where: {
                    id: roleId,
                    tenantId,
                },
            });

            if (!role) {
                throw new NotFoundException('Role not found');
            }

            // Check if role is assigned to any users
            const assignedUsers = await tx.orgUserRole.count({
                where: {
                    tenantId,
                    roleId,
                },
            });

            if (assignedUsers > 0) {
                throw new BadRequestException('Cannot delete role that is assigned to users');
            }

            await tx.role.delete({
                where: { id: roleId },
            });

            return { success: true };
        });
    }

    async seedDefaultRoles(tenantId: string): Promise<{ created: string[] }> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const created: string[] = [];

            // Define default roles
            const defaultRoles = [
                {
                    name: 'ops_admin',
                    description: 'Operations Administrator - Full access to all features',
                    permissions: [
                        'calendar.view', 'calendar.manage',
                        'events.view', 'events.create', 'events.edit', 'events.delete', 'events.manage',
                        'runsheet.view', 'runsheet.edit', 'runsheet.approve',
                        'checklists.run', 'checklists.manage',
                        'inventory.view', 'inventory.update', 'inventory.book',
                        'assets.upload', 'assets.approve', 'assets.manage',
                        'roster.view', 'roster.manage', 'team.create', 'team.select_lineup',
                        'players.view', 'players.edit_profile_self', 'players.edit_admin',
                        'achievements.create', 'achievements.approve',
                        'gamelog.view', 'gamelog.manage', 'gamelog.approve',
                        'stats.record', 'stats.edit', 'stats.approve',
                        'reports.view', 'reports.export',
                        'org.settings.view', 'org.settings.manage',
                    ],
                },
                {
                    name: 'producer',
                    description: 'Event Producer - Manage events, runsheets, and rosters',
                    permissions: [
                        'calendar.view', 'calendar.manage',
                        'events.view', 'events.create', 'events.edit', 'events.manage',
                        'runsheet.view', 'runsheet.edit',
                        'checklists.manage',
                        'roster.view', 'roster.manage', 'team.create',
                        'players.view',
                        'gamelog.view', 'gamelog.manage',
                        'stats.record', 'stats.edit',
                        'reports.view', 'reports.export',
                    ],
                },
                {
                    name: 'tech',
                    description: 'Technical Operator - Execute runsheets and manage inventory',
                    permissions: [
                        'calendar.view',
                        'events.create',
                        'runsheet.view',
                        'checklists.run',
                        'inventory.view', 'inventory.update',
                        'assets.upload',
                        'players.view',
                    ],
                },
                {
                    name: 'viewer',
                    description: 'Read-only access to most features',
                    permissions: [
                        'calendar.view',
                        'runsheet.view',
                        'inventory.view',
                        'roster.view',
                        'players.view',
                        'gamelog.view',
                        'reports.view',
                        'org.settings.view',
                    ],
                },
            ];

            for (const roleData of defaultRoles) {
                try {
                    await this.createRole(tenantId, roleData);
                    created.push(roleData.name);
                } catch (error) {
                    // Role might already exist, continue
                    continue;
                }
            }

            return { created };
        });
    }

    /**
     * Assign roles to a user
     */
    async assignRoles(tenantId: string, assignRoleDto: AssignRoleDto, assignedByUserId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Verify user exists and belongs to tenant
            const orgUser = await tx.orgUser.findUnique({
                where: {
                    id: assignRoleDto.orgUserId,
                    tenantId,
                },
            });

            if (!orgUser) {
                throw new NotFoundException('User not found in this organization');
            }

            // Verify all roles exist and belong to tenant
            const roles = await tx.role.findMany({
                where: {
                    id: { in: assignRoleDto.roleIds },
                    tenantId,
                },
            });

            if (roles.length !== assignRoleDto.roleIds.length) {
                throw new BadRequestException('One or more roles not found in this organization');
            }

            // Check for existing assignments to avoid duplicates
            const existingAssignments = await tx.orgUserRole.findMany({
                where: {
                    orgUserId: assignRoleDto.orgUserId,
                    roleId: { in: assignRoleDto.roleIds },
                    tenantId,
                },
            });

            const existingRoleIds = existingAssignments.map(assignment => assignment.roleId);
            const newRoleIds = assignRoleDto.roleIds.filter(roleId => !existingRoleIds.includes(roleId));

            if (newRoleIds.length === 0) {
                throw new ConflictException('All roles are already assigned to this user');
            }

            // Create new role assignments
            const assignments = await Promise.all(
                newRoleIds.map(roleId =>
                    tx.orgUserRole.create({
                        data: {
                            tenantId,
                            orgUserId: assignRoleDto.orgUserId,
                            roleId,
                        },
                    })
                )
            );

            return {
                message: `Successfully assigned ${assignments.length} roles to user`,
                assignedRoles: newRoleIds,
                skippedRoles: existingRoleIds
            };
        });
    }

    /**
     * Remove roles from a user
     */
    async removeRoles(tenantId: string, removeRoleDto: RemoveRoleDto, removedByUserId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Verify user exists and belongs to tenant
            const orgUser = await tx.orgUser.findUnique({
                where: {
                    id: removeRoleDto.orgUserId,
                    tenantId,
                },
            });

            if (!orgUser) {
                throw new NotFoundException('User not found in this organization');
            }

            // Remove role assignments
            const result = await tx.orgUserRole.deleteMany({
                where: {
                    orgUserId: removeRoleDto.orgUserId,
                    roleId: { in: removeRoleDto.roleIds },
                    tenantId,
                },
            });

            return {
                message: `Successfully removed ${result.count} role assignments`,
                removedCount: result.count
            };
        });
    }

    /**
     * Get user's roles
     */
    async getUserRoles(tenantId: string, orgUserId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const userRoles = await tx.orgUserRole.findMany({
                where: {
                    orgUserId,
                    tenantId,
                },
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
            });

            return {
                roles: userRoles.map(userRole => this.mapRoleToDto(userRole.role))
            };
        });
    }

    private mapRoleToDto(role: any, userCount?: number): RoleWithPermissionsDto {
        return {
            id: role.id,
            name: role.name,
            description: role.desc,
            permissions: role.permissions.map((rp: any) => ({
                id: rp.permission.id,
                key: rp.permission.key,
                group: rp.permission.group,
                description: rp.permission.desc,
            })),
            userCount: userCount,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
        };
    }
}