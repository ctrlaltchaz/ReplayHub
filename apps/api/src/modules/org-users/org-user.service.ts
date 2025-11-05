import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { AssignRolesDto, CreateOrgUserDto, OrgUserListDto, UpdateOrgUserDto } from './dto';

@Injectable()
export class OrgUserService {
    constructor(private prisma: PrismaService) { }

    async createUser(
        tenantId: string,
        createUserDto: CreateOrgUserDto,
        createdById: string,
    ): Promise<{ orgUser: OrgUserListDto; needsPasswordSetup?: boolean }> {
        return await this.prisma.$transaction(async (tx) => {
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

            const orgUser = await tx.orgUser.create({
                data: {
                    tenantId,
                    email: createUserDto.email,
                    passwordHash,
                    displayName: createUserDto.displayName,
                    isActive: true,
                },
            });

            return {
                orgUser: {
                    id: orgUser.id,
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
    }

    async getUsers(tenantId: string): Promise<OrgUserListDto[]> {
        return await this.prisma.$transaction(async (tx) => {
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

            return users.map(user => ({
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                isActive: user.isActive,
                isTotpEnabled: user.isTotpEnabled,
                roles: user.roles.map(ur => ur.role.name),
                createdAt: user.createdAt,
            }));
        });
    }

    async getUserById(tenantId: string, userId: string): Promise<OrgUserListDto | null> {
        return await this.prisma.$transaction(async (tx) => {
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

            return {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                isActive: user.isActive,
                isTotpEnabled: user.isTotpEnabled,
                roles: user.roles.map(ur => ur.role.name),
                createdAt: user.createdAt,
            };
        });
    }

    async updateUser(
        tenantId: string,
        userId: string,
        updateUserDto: UpdateOrgUserDto,
    ): Promise<OrgUserListDto> {
        return await this.prisma.$transaction(async (tx) => {
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

            return {
                id: updatedUser.id,
                email: updatedUser.email,
                displayName: updatedUser.displayName,
                isActive: updatedUser.isActive,
                isTotpEnabled: updatedUser.isTotpEnabled,
                roles: updatedUser.roles.map(ur => ur.role.name),
                createdAt: updatedUser.createdAt,
            };
        });
    }

    async assignRoles(
        tenantId: string,
        userId: string,
        assignRolesDto: AssignRolesDto,
    ): Promise<OrgUserListDto> {
        return await this.prisma.$transaction(async (tx) => {
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

            // Remove existing roles
            await tx.orgUserRole.deleteMany({
                where: {
                    tenantId,
                    orgUserId: userId,
                },
            });

            // Assign new roles
            if (roles.length > 0) {
                await tx.orgUserRole.createMany({
                    data: roles.map(role => ({
                        tenantId,
                        orgUserId: userId,
                        roleId: role.id,
                    })),
                });
            }

            // TODO: Log role changes
            const currentRoleNames = currentRoles.map(cr => cr.role.name).sort();
            const newRoleNames = assignRolesDto.roles.sort();

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
    }

    async deactivateUser(tenantId: string, userId: string): Promise<OrgUserListDto> {
        return this.updateUser(tenantId, userId, { isActive: false });
    }

    async reactivateUser(tenantId: string, userId: string): Promise<OrgUserListDto> {
        return this.updateUser(tenantId, userId, { isActive: true });
    }

    async deleteUser(tenantId: string, userId: string): Promise<void> {
        return await this.prisma.$transaction(async (tx) => {
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

            // Delete user roles for this org user
            await tx.orgUserRole.deleteMany({
                where: {
                    tenantId,
                    orgUserId: userId,
                },
            });

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
                            `Cannot delete user - they own ${ownedOrgs.length} organization(s). Transfer ownership first.`,
                        );
                    }

                    // Delete the global user
                    await tx.globalUser.delete({
                        where: { id: orgUser.globalUserId },
                    });
                }
            }
        });
    }
}