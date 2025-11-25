import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { AssignRolesDto, CreateOrgUserDto, OrgUserListDto, UpdateOrgUserDto } from './dto';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class OrgUserService {
  constructor(
    private prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async createUser(
    tenantId: string,
    createUserDto: CreateOrgUserDto,
    createdById: string,
    createdByEmail?: string | null
  ): Promise<{ orgUser: OrgUserListDto; needsPasswordSetup?: boolean }> {
    const result = await this.prisma.$transaction(async tx => {
      // Set tenant context
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      // Check if user already exists
      const existingUser = await tx.orgUser.findUnique({
        where: {
          tenantId_email: {
            tenantId,
            email: createUserDto.email,
          },
        },
      });

      if (existingUser) {
        throw new ConflictException('User already exists in this organisation');
      }

      let passwordHash: string;
      let needsPasswordSetup = false;

      if (createUserDto.password) {
        // Password provided - hash it
        passwordHash = await bcrypt.hash(createUserDto.password, 12);
      } else {
        // No password - generate temporary one that forces reset
        const tempPassword = crypto.randomBytes(16).toString('hex');
        passwordHash = await bcrypt.hash(tempPassword, 12);
        needsPasswordSetup = true;
      }

      // Ensure there is a global user (for unified membership/permissions)
      let globalUser = await tx.globalUser.findUnique({
        where: { email: createUserDto.email },
      });

      if (!globalUser) {
        globalUser = await tx.globalUser.create({
          data: {
            email: createUserDto.email,
            passwordHash,
            name: createUserDto.displayName,
            isActive: true,
          },
        });
      }

      const orgUser = await tx.orgUser.create({
        data: {
          tenantId,
          email: createUserDto.email,
          passwordHash,
          displayName: createUserDto.displayName,
          globalUserId: globalUser.id,
          isActive: true,
        },
      });

      // Create membership for unified auth
      const membership = await tx.userOrganisationMembership.create({
        data: {
          tenantId,
          userId: globalUser.id,
          email: createUserDto.email,
          displayName: createUserDto.displayName,
          isActive: true,
        },
      });

      return {
        orgUser: {
          id: orgUser.id,
          membershipId: membership.id,
          globalUserId: orgUser.globalUserId,
          email: orgUser.email,
          displayName: orgUser.displayName,
          isActive: orgUser.isActive,
          isTotpEnabled: orgUser.isTotpEnabled,
          roles: [],
          createdAt: orgUser.createdAt,
        },
        needsPasswordSetup,
      };
    });

    const actorOrgUserId = await this.resolveActorOrgUserId(tenantId, createdById, createdByEmail);

    await this.auditService.log({
      tenantId,
      action: 'user.create',
      entity: 'user',
      entityType: 'ORG_USER',
      entityId: result.orgUser.id,
      description: 'Created organisation user',
      orgUserId: actorOrgUserId,
      metadata: {
        email: result.orgUser.email,
        displayName: result.orgUser.displayName,
        needsPasswordSetup: result.needsPasswordSetup ?? false,
      },
    });

    return result;
  }

  async getUsers(tenantId: string): Promise<OrgUserListDto[]> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const users = await tx.orgUser.findMany({
        where: { tenantId },
        include: {
          roles: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Fetch memberships for these users (by globalUserId/email fallback)
      const globalUserIds = users.map(u => u.globalUserId).filter(Boolean) as string[];
      const emails = users.map(u => u.email);

      const memberships = await tx.userOrganisationMembership.findMany({
        where: {
          tenantId,
          OR: [{ userId: { in: globalUserIds } }, { email: { in: emails } }],
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      const membershipByUserId = new Map<string, (typeof memberships)[number]>();
      memberships.forEach(m => {
        if (m.userId) {
          membershipByUserId.set(m.userId, m);
        }
      });
      const membershipByEmail = new Map<string, (typeof memberships)[number]>();
      memberships.forEach(m => {
        membershipByEmail.set(m.email, m);
      });

      return users.map(user => {
        const membership =
          (user.globalUserId && membershipByUserId.get(user.globalUserId)) ||
          membershipByEmail.get(user.email);

        const membershipRoles = membership ? membership.roles.map(mr => mr.role.name) : [];

        const orgUserRoles = user.roles.map(ur => ur.role.name);

        return {
          id: user.id,
          membershipId: membership?.id,
          globalUserId: user.globalUserId,
          email: user.email,
          displayName: membership?.displayName || user.displayName,
          isActive: membership?.isActive ?? user.isActive,
          isTotpEnabled: user.isTotpEnabled,
          roles: membershipRoles.length ? membershipRoles : orgUserRoles,
          createdAt: user.createdAt,
        };
      });
    });
  }

  async getUserById(tenantId: string, userId: string): Promise<OrgUserListDto | null> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const user = await tx.orgUser.findFirst({
        where: {
          id: userId,
          tenantId,
        },
        include: {
          roles: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      const membership = user.globalUserId
        ? await tx.userOrganisationMembership.findFirst({
            where: { tenantId, userId: user.globalUserId },
            include: {
              roles: {
                include: { role: true },
              },
            },
          })
        : null;

      const membershipRoles = membership ? membership.roles.map(mr => mr.role.name) : [];

      return {
        id: user.id,
        membershipId: membership?.id,
        globalUserId: user.globalUserId,
        email: user.email,
        displayName: membership?.displayName || user.displayName,
        isActive: membership?.isActive ?? user.isActive,
        isTotpEnabled: user.isTotpEnabled,
        roles: membershipRoles.length ? membershipRoles : user.roles.map(ur => ur.role.name),
        createdAt: user.createdAt,
      };
    });
  }

  async updateUser(
    tenantId: string,
    userId: string,
    updateUserDto: UpdateOrgUserDto,
    actorOrgUserId?: string,
    actorEmail?: string | null
  ): Promise<OrgUserListDto> {
    let auditBefore: { displayName?: string; isActive?: boolean } | null = null;
    let auditAfter: { displayName?: string; isActive?: boolean } | null = null;

    const result = await this.prisma.$transaction(async tx => {
      // Set tenant context
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      // Check user exists first
      const user = await tx.orgUser.findFirst({
        where: {
          id: userId,
          tenantId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      auditBefore = {
        displayName: user.displayName,
        isActive: user.isActive,
      };

      const updatedUser = await tx.orgUser.update({
        where: { id: userId },
        data: {
          displayName: updateUserDto.displayName,
          isActive: updateUserDto.isActive,
        },
        include: {
          roles: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      // Keep membership in sync
      if (updatedUser.globalUserId) {
        await tx.userOrganisationMembership.updateMany({
          where: { tenantId, userId: updatedUser.globalUserId },
          data: {
            displayName: updateUserDto.displayName,
            isActive: updateUserDto.isActive,
          },
        });
      }

      const membership = updatedUser.globalUserId
        ? await tx.userOrganisationMembership.findFirst({
            where: { tenantId, userId: updatedUser.globalUserId },
            include: { roles: { include: { role: true } } },
          })
        : null;

      const membershipRoles = membership ? membership.roles.map(mr => mr.role.name) : [];

      auditAfter = {
        displayName: membership?.displayName || updatedUser.displayName,
        isActive: membership?.isActive ?? updatedUser.isActive,
      };

      return {
        id: updatedUser.id,
        membershipId: membership?.id,
        globalUserId: updatedUser.globalUserId,
        email: updatedUser.email,
        displayName: membership?.displayName || updatedUser.displayName,
        isActive: membership?.isActive ?? updatedUser.isActive,
        isTotpEnabled: updatedUser.isTotpEnabled,
        roles: membershipRoles.length ? membershipRoles : updatedUser.roles.map(ur => ur.role.name),
        createdAt: updatedUser.createdAt,
      };
    });

    const actorId = await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail);

    await this.auditService.log({
      tenantId,
      action: 'user.update',
      entity: 'user',
      entityType: 'ORG_USER',
      entityId: userId,
      description: 'Updated organisation user profile',
      orgUserId: actorId,
      metadata: {
        before: auditBefore,
        after: auditAfter,
        changes: {
          displayName:
            auditBefore?.displayName !== auditAfter?.displayName
              ? { before: auditBefore?.displayName ?? null, after: auditAfter?.displayName ?? null }
              : undefined,
          isActive:
            auditBefore?.isActive !== auditAfter?.isActive
              ? { before: auditBefore?.isActive ?? null, after: auditAfter?.isActive ?? null }
              : undefined,
        },
      },
    });

    return result;
  }

  async assignRoles(
    tenantId: string,
    userId: string,
    assignRolesDto: AssignRolesDto,
    actorOrgUserId?: string,
    actorEmail?: string | null
  ): Promise<OrgUserListDto> {
    let auditEmail: string | null = null;
    let auditDisplayName: string | null = null;
    let currentRoleNames: string[] = [];
    let newRoleNames: string[] = [];

    const result = await this.prisma.$transaction(async tx => {
      // Set tenant context
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      // Check user exists
      const user = await tx.orgUser.findFirst({
        where: {
          id: userId,
          tenantId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Validate roles exist
      const roles = await tx.role.findMany({
        where: {
          tenantId,
          name: { in: assignRolesDto.roles },
        },
      });

      if (roles.length !== assignRolesDto.roles.length) {
        const foundRoles = roles.map(r => r.name);
        const missingRoles = assignRolesDto.roles.filter(role => !foundRoles.includes(role));
        throw new BadRequestException(`Invalid roles: ${missingRoles.join(', ')}`);
      }

      // Get current roles for audit logging
      const currentRoles = await tx.orgUserRole.findMany({
        where: { tenantId, orgUserId: userId },
        include: { role: true },
      });
      currentRoleNames = currentRoles.map(cr => cr.role.name).sort();

      // Remove existing orgUser roles
      await tx.orgUserRole.deleteMany({
        where: {
          tenantId,
          orgUserId: userId,
        },
      });

      // Assign new orgUser roles
      if (roles.length > 0) {
        await tx.orgUserRole.createMany({
          data: roles.map(role => ({
            tenantId,
            orgUserId: userId,
            roleId: role.id,
          })),
        });
      }

      // Sync membership roles (preferred permission source)
      if (user.globalUserId) {
        let membership = await tx.userOrganisationMembership.findFirst({
          where: {
            tenantId,
            userId: user.globalUserId,
          },
        });

        // Create membership if missing
        if (!membership) {
          membership = await tx.userOrganisationMembership.create({
            data: {
              tenantId,
              userId: user.globalUserId,
              email: user.email,
              displayName: user.displayName,
              isActive: user.isActive,
            },
          });
        }

        await tx.membershipRole.deleteMany({
          where: {
            tenantId,
            membershipId: membership.id,
          },
        });

        if (roles.length > 0) {
          await tx.membershipRole.createMany({
            data: roles.map(role => ({
              tenantId,
              membershipId: membership.id,
              roleId: role.id,
            })),
          });
        }
      }

      // TODO: Log role changes
      newRoleNames = [...assignRolesDto.roles].sort();
      auditEmail = user.email;
      auditDisplayName = user.displayName;

      // Return updated user
      const updatedUser = await tx.orgUser.findFirst({
        where: {
          id: userId,
          tenantId,
        },
        include: {
          roles: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        id: updatedUser!.id,
        email: updatedUser!.email,
        displayName: updatedUser!.displayName,
        isActive: updatedUser!.isActive,
        isTotpEnabled: updatedUser!.isTotpEnabled,
        roles: updatedUser!.roles.map(ur => ur.role.name),
        createdAt: updatedUser!.createdAt,
      };
    });

    const actorId = await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail);

    await this.auditService.log({
      tenantId,
      action: 'user.role.change',
      entity: 'user',
      entityType: 'ORG_USER',
      entityId: userId,
      description: 'Updated user roles',
      orgUserId: actorId,
      metadata: {
        email: auditEmail,
        displayName: auditDisplayName,
        beforeRoles: currentRoleNames,
        afterRoles: newRoleNames,
        changes: {
          roles: { before: currentRoleNames, after: newRoleNames },
        },
      },
    });

    return result;
  }

  async deactivateUser(
    tenantId: string,
    userId: string,
    actorOrgUserId?: string,
    actorEmail?: string | null
  ): Promise<OrgUserListDto> {
    const actorId = await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail);
    const updated = await this.updateUser(
      tenantId,
      userId,
      { isActive: false },
      actorId ?? undefined,
      actorEmail
    );

    // Also deactivate membership
    await this.prisma.userOrganisationMembership.updateMany({
      where: {
        tenantId,
        OR: [{ email: updated.email }, { userId: updated.globalUserId ?? undefined }].filter(
          Boolean
        ) as any,
      },
      data: { isActive: false },
    });

    await this.auditService.log({
      tenantId,
      action: 'user.deactivate',
      entity: 'user',
      entityType: 'ORG_USER',
      entityId: userId,
      description: 'Deactivated organisation user',
      orgUserId: actorId,
      metadata: {
        email: updated.email,
        displayName: updated.displayName,
      },
    });

    return updated;
  }

  async reactivateUser(
    tenantId: string,
    userId: string,
    actorOrgUserId?: string,
    actorEmail?: string | null
  ): Promise<OrgUserListDto> {
    const actorId = await this.resolveActorOrgUserId(tenantId, actorOrgUserId ?? null, actorEmail);
    const updated = await this.updateUser(
      tenantId,
      userId,
      { isActive: true },
      actorId ?? undefined,
      actorEmail
    );

    // Also reactivate membership
    await this.prisma.userOrganisationMembership.updateMany({
      where: {
        tenantId,
        OR: [{ email: updated.email }, { userId: updated.globalUserId ?? undefined }].filter(
          Boolean
        ) as any,
      },
      data: { isActive: true },
    });

    await this.auditService.log({
      tenantId,
      action: 'user.reactivate',
      entity: 'user',
      entityType: 'ORG_USER',
      entityId: userId,
      description: 'Reactivated organisation user',
      orgUserId: actorId,
      metadata: {
        email: updated.email,
        displayName: updated.displayName,
      },
    });

    return updated;
  }

  async deleteUser(
    tenantId: string,
    userId: string,
    actorOrgUserId?: string,
    actorEmail?: string | null
  ): Promise<void> {
    let auditEmail: string | null = null;
    let auditDisplayName: string | null = null;

    await this.prisma.$transaction(async tx => {
      // Set tenant context
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const orgUser = await tx.orgUser.findFirst({
        where: {
          id: userId,
          tenantId,
        },
      });

      if (!orgUser) {
        throw new NotFoundException('User not found');
      }

      auditEmail = orgUser.email;
      auditDisplayName = orgUser.displayName;

      // Delete user roles for this org user
      await tx.orgUserRole.deleteMany({
        where: {
          tenantId,
          orgUserId: userId,
        },
      });

      // Delete membership roles and membership
      if (orgUser.globalUserId) {
        const membership = await tx.userOrganisationMembership.findFirst({
          where: {
            tenantId,
            userId: orgUser.globalUserId,
          },
        });

        if (membership) {
          await tx.membershipRole.deleteMany({
            where: {
              tenantId,
              membershipId: membership.id,
            },
          });
          await tx.userOrganisationMembership.delete({
            where: { id: membership.id },
          });
        }
      }

      // Delete the org user
      await tx.orgUser.delete({
        where: {
          id: userId,
        },
      });

      // If this org user is linked to a global user, check if we should delete global user too
      if (orgUser.globalUserId) {
        // Check if the global user has any other org memberships
        const otherOrgUsers = await tx.orgUser.findMany({
          where: {
            globalUserId: orgUser.globalUserId,
          },
        });

        // If no other org memberships exist, delete the global user completely
        if (otherOrgUsers.length === 0) {
          // Delete all global user related data
          await tx.auditLog.deleteMany({
            where: { userId: orgUser.globalUserId },
          });

          await tx.organisationAdmin.deleteMany({
            where: { globalUserId: orgUser.globalUserId },
          });

          // Check if user owns any organizations
          const ownedOrgs = await tx.organisation.findMany({
            where: { ownerId: orgUser.globalUserId },
          });

          if (ownedOrgs.length > 0) {
            throw new BadRequestException(
              `Cannot delete user - they own ${ownedOrgs.length} organization(s). Transfer ownership first.`
            );
          }

          // Delete the global user
          await tx.globalUser.delete({
            where: { id: orgUser.globalUserId },
          });
        }
      }
    });

    const actorId = await this.resolveActorOrgUserId(tenantId, actorOrgUserId ?? null, actorEmail);

    await this.auditService.log({
      tenantId,
      action: 'user.delete',
      entity: 'user',
      entityType: 'ORG_USER',
      entityId: userId,
      description: 'Deleted organisation user',
      orgUserId: actorId,
      metadata: {
        email: auditEmail,
        displayName: auditDisplayName,
      },
    });
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
