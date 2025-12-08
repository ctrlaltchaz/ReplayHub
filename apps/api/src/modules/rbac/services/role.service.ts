import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';

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
  membershipId: string;
  roleIds: string[];
}

export interface RemoveRoleDto {
  membershipId: string;
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
  constructor(
    private prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async createRole(
    tenantId: string,
    createRoleDto: CreateRoleDto,
    actorOrgUserId?: string,
    actorEmail?: string | null
  ): Promise<RoleWithPermissionsDto> {
    const role = await this.prisma.$transaction(async tx => {
      // Set tenant context
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

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

    const actorId = await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail);

    if (actorId) {
      await this.auditService.log({
        tenantId,
        action: 'role.create',
        entity: 'role',
        entityType: 'ROLE',
        entityId: role.id,
        description: `Created role ${role.name}`,
        orgUserId: actorId,
        metadata: {
          name: role.name,
          permissions: role.permissions.map(p => p.key).sort(),
          actorEmail,
        },
      });
    }

    return role;
  }

  async getRoles(tenantId: string): Promise<RoleWithPermissionsDto[]> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

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
    return await this.prisma.$transaction(async tx => {
      // Set tenant context
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

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
          membershipRoles: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!role) return null;

      // Get user count from membershipRoles
      const userCount = await tx.membershipRole.count({
        where: {
          roleId: roleId,
          membership: {
            tenantId,
          },
        },
      });

      return this.mapRoleToDto(role, userCount);
    });
  }

  async updateRole(
    tenantId: string,
    roleId: string,
    updateRoleDto: UpdateRoleDto,
    actorOrgUserId?: string,
    actorEmail?: string | null
  ): Promise<RoleWithPermissionsDto> {
    let beforeSnapshot: {
      name?: string | null;
      description?: string | null;
      permissions: string[];
    } = {
      permissions: [],
    };

    const role = await this.prisma.$transaction(async tx => {
      // Set tenant context
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

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

      beforeSnapshot = {
        name: existingRole.name,
        description: existingRole.desc,
        permissions: existingRole.permissions.map(p => p.permission.key).sort(),
      };

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

    const actorId = await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail);

    if (actorId) {
      const afterPermissions = role.permissions.map(p => p.key).sort();
      await this.auditService.log({
        tenantId,
        action: 'role.update',
        entity: 'role',
        entityType: 'ROLE',
        entityId: roleId,
        description: `Updated role ${role.name}`,
        orgUserId: actorId,
        metadata: {
          name: role.name,
          before: beforeSnapshot,
          after: {
            name: role.name,
            description: role.description,
            permissions: afterPermissions,
          },
          actorEmail,
          changes: {
            name:
              beforeSnapshot.name !== role.name
                ? { before: beforeSnapshot.name ?? null, after: role.name ?? null }
                : undefined,
            description:
              beforeSnapshot.description !== role.description
                ? { before: beforeSnapshot.description ?? null, after: role.description ?? null }
                : undefined,
            permissions:
              JSON.stringify(beforeSnapshot.permissions) !== JSON.stringify(afterPermissions)
                ? { before: beforeSnapshot.permissions, after: afterPermissions }
                : undefined,
          },
        },
      });
    }

    return role;
  }

  async deleteRole(
    tenantId: string,
    roleId: string,
    actorOrgUserId?: string,
    actorEmail?: string | null
  ): Promise<{ success: boolean }> {
    let roleName: string | null = null;
    let permissions: string[] = [];

    const result = await this.prisma.$transaction(async tx => {
      // Set tenant context
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

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

      roleName = role.name;

      const rolePermissions = await tx.rolePermission.findMany({
        where: { tenantId, roleId },
        include: { permission: true },
      });
      permissions = rolePermissions.map(rp => rp.permission.key).sort();

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

    const actorId = await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail);

    if (actorId) {
      await this.auditService.log({
        tenantId,
        action: 'role.delete',
        entity: 'role',
        entityType: 'ROLE',
        entityId: roleId,
        description: `Deleted role ${roleName ?? roleId}`,
        orgUserId: actorId,
        metadata: {
          name: roleName,
          permissions,
          actorEmail,
        },
      });
    }

    return result;
  }

  async seedDefaultRoles(tenantId: string): Promise<{ created: string[] }> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const created: string[] = [];

      // Fetch all current permission keys so ops_admin always has complete access
      const allPermissionKeys = (
        await tx.permission.findMany({
          where: { tenantId },
          select: { key: true },
        })
      )
        .map(permission => permission.key)
        .sort();

      // Define default roles
      const defaultRoles = [
        {
          name: 'ADMIN',
          description: 'Administrator - Full access to all features',
          permissions: allPermissionKeys,
        },
        {
          name: 'ops_admin',
          description: 'Operations Administrator - Full access to all features',
          permissions: allPermissionKeys,
        },
        {
          name: 'TUTOR',
          description: 'Tutor - manages Wednesday attendance and rosters',
          permissions: [
            'calendar.view',
            'calendar.manage',
            'events.view',
            'events.create',
            'events.edit',
            'roster.view',
            'roster.manage',
            'team.create',
            'team.update',
            'team.select_lineup',
            'player.create',
            'player.update',
            'players.view',
            'players.edit_admin',
            'availability.manage',
            'availability.set_self',
            'lineup.create',
            'lineup.update',
            'gamelog.view',
            'stats.record',
            'stats.edit',
            'reports.view',
            'checklists.view',
            'checklists.run',
            'users.view',
            'users.read',
            'feedback.submit',
            'attendance.view',
            'attendance.manage',
            'attendance.export',
          ],
        },
        {
          name: 'producer',
          description: 'Event Producer - Manage events, runsheets, and rosters',
          permissions: [
            'calendar.view',
            'calendar.manage',
            'events.view',
            'events.create',
            'events.edit',
            'events.manage',
            'runsheet.view',
            'runsheet.edit',
            'checklists.manage',
            'roster.view',
            'roster.manage',
            'team.create',
            'players.view',
            'gamelog.view',
            'gamelog.manage',
            'stats.record',
            'stats.edit',
            'reports.view',
            'reports.export',
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
            'inventory.view',
            'inventory.update',
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
          if (error instanceof ConflictException) {
            await this.syncRolePermissions(tx, tenantId, roleData);
            console.info(
              `[RoleService] Role ${roleData.name} already exists for tenant ${tenantId}; synchronised permissions instead`
            );
          } else {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(
              `[RoleService] Failed to seed role ${roleData.name} for tenant ${tenantId}: ${message}`
            );
          }
          continue;
        }
      }

      return { created };
    });
  }

  private async syncRolePermissions(
    tx: Prisma.TransactionClient,
    tenantId: string,
    roleData: { name: string; description?: string; permissions: string[] }
  ) {
    const role = await tx.role.findUnique({
      where: {
        tenantId_name: {
          tenantId,
          name: roleData.name,
        },
      },
    });

    if (!role) {
      return;
    }

    if (roleData.description && role.desc !== roleData.description) {
      await tx.role.update({
        where: { id: role.id },
        data: { desc: roleData.description },
      });
    }

    const permissions = await tx.permission.findMany({
      where: {
        tenantId,
        key: { in: roleData.permissions },
      },
      select: { id: true, key: true },
    });

    const foundKeys = new Set(permissions.map(permission => permission.key));
    const missingKeys = roleData.permissions.filter(key => !foundKeys.has(key));

    if (missingKeys.length > 0) {
      console.warn(
        `[RoleService] Missing permissions while syncing role ${roleData.name} for tenant ${tenantId}: ${missingKeys.join(', ')}`
      );
    }

    const desiredPermissionIds = new Set(permissions.map(permission => permission.id));

    const existingAssignments = await tx.rolePermission.findMany({
      where: {
        tenantId,
        roleId: role.id,
      },
      select: { permissionId: true },
    });

    const existingPermissionIds = new Set(
      existingAssignments.map(assignment => assignment.permissionId)
    );

    const permissionsToAdd = permissions.filter(
      permission => !existingPermissionIds.has(permission.id)
    );
    const permissionIdsToRemove = [...existingPermissionIds].filter(
      permissionId => !desiredPermissionIds.has(permissionId)
    );

    if (permissionIdsToRemove.length > 0) {
      await tx.rolePermission.deleteMany({
        where: {
          tenantId,
          roleId: role.id,
          permissionId: { in: permissionIdsToRemove },
        },
      });
    }

    if (permissionsToAdd.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionsToAdd.map(permission => ({
          tenantId,
          roleId: role.id,
          permissionId: permission.id,
        })),
        skipDuplicates: true,
      });
    }
  }

  /**
   * Assign roles to a user
   */
  async assignRoles(
    tenantId: string,
    assignRoleDto: AssignRoleDto,
    actorOrgUserId: string,
    actorEmail?: string | null
  ) {
    let membershipEmail: string | null = null;
    let membershipDisplayName: string | null = null;
    let assignedRoles: string[] = [];
    let assignedRoleNames: string[] = [];

    const result = await this.prisma.$transaction(async tx => {
      // Set tenant context
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      // Verify membership exists and belongs to tenant
      const membership = await tx.userOrganisationMembership.findFirst({
        where: {
          id: assignRoleDto.membershipId,
          tenantId,
        },
      });

      if (!membership) {
        throw new NotFoundException('User membership not found in this organization');
      }
      membershipEmail = membership.email;
      membershipDisplayName = membership.displayName;

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
      const existingAssignments = await tx.membershipRole.findMany({
        where: {
          membershipId: assignRoleDto.membershipId,
          roleId: { in: assignRoleDto.roleIds },
          tenantId,
        },
      });

      const existingRoleIds = existingAssignments.map(assignment => assignment.roleId);
      const newRoleIds = assignRoleDto.roleIds.filter(roleId => !existingRoleIds.includes(roleId));
      assignedRoles = newRoleIds;
      assignedRoleNames = roles
        .filter(r => newRoleIds.includes(r.id))
        .map(r => r.name)
        .sort();

      if (newRoleIds.length === 0) {
        throw new ConflictException('All roles are already assigned to this user');
      }

      // Create new role assignments in MembershipRole
      const assignments = await Promise.all(
        newRoleIds.map(roleId =>
          tx.membershipRole.create({
            data: {
              tenantId,
              membershipId: assignRoleDto.membershipId,
              roleId,
            },
          })
        )
      );

      return {
        message: `Successfully assigned ${assignments.length} roles to user`,
        assignedRoles: newRoleIds,
        skippedRoles: existingRoleIds,
      };
    });

    await this.auditService.log({
      tenantId,
      action: 'role.assign',
      entity: 'role',
      entityType: 'ROLE',
      entityId: assignRoleDto.membershipId,
      description: 'Assigned roles to user',
      orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
      metadata: {
        membershipId: assignRoleDto.membershipId,
        email: membershipEmail,
        displayName: membershipDisplayName,
        addedRoleIds: assignedRoles,
        addedRoleNames: assignedRoleNames,
        actorEmail,
      },
    });

    return result;
  }

  /**
   * Remove roles from a user
   */
  async removeRoles(
    tenantId: string,
    removeRoleDto: RemoveRoleDto,
    actorOrgUserId: string,
    actorEmail?: string | null
  ) {
    let membershipEmail: string | null = null;
    let membershipDisplayName: string | null = null;
    let removedRoleIds: string[] = [];
    let removedRoleNames: string[] = [];

    const result = await this.prisma.$transaction(async tx => {
      // Set tenant context
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      // Verify membership exists and belongs to tenant
      const membership = await tx.userOrganisationMembership.findFirst({
        where: {
          id: removeRoleDto.membershipId,
          tenantId,
        },
      });

      if (!membership) {
        throw new NotFoundException('User membership not found in this organization');
      }
      membershipEmail = membership.email;
      membershipDisplayName = membership.displayName;

      // Remove role assignments from MembershipRole
      const roles = await tx.role.findMany({
        where: {
          tenantId,
          id: { in: removeRoleDto.roleIds },
        },
      });
      removedRoleNames = roles.map(r => r.name).sort();

      const result = await tx.membershipRole.deleteMany({
        where: {
          membershipId: removeRoleDto.membershipId,
          roleId: { in: removeRoleDto.roleIds },
          tenantId,
        },
      });
      removedRoleIds = removeRoleDto.roleIds;

      return {
        message: `Successfully removed ${result.count} role assignments`,
        removedCount: result.count,
      };
    });

    await this.auditService.log({
      tenantId,
      action: 'role.remove',
      entity: 'role',
      entityType: 'ROLE',
      entityId: removeRoleDto.membershipId,
      description: 'Removed roles from user',
      orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
      metadata: {
        membershipId: removeRoleDto.membershipId,
        email: membershipEmail,
        displayName: membershipDisplayName,
        removedRoleIds,
        removedRoleNames,
        actorEmail,
      },
    });

    return result;
  }

  /**
   * Get user's roles
   */
  async getUserRoles(tenantId: string, membershipId: string) {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context
      await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const userRoles = await tx.membershipRole.findMany({
        where: {
          membershipId,
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
        roles: userRoles.map(userRole => this.mapRoleToDto(userRole.role)),
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

  private async resolveActorOrgUserId(
    tenantId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    if (actorOrgUserId) {
      const found = await this.prisma.orgUser.findFirst({
        where: { id: actorOrgUserId, tenantId },
        select: { id: true },
      });
      if (found) {
        return actorOrgUserId;
      }
    }

    if (actorEmail) {
      const foundByEmail = await this.prisma.orgUser.findFirst({
        where: { tenantId, email: actorEmail },
        select: { id: true },
      });
      if (foundByEmail) {
        return foundByEmail.id;
      }
    }

    return null;
  }
}

