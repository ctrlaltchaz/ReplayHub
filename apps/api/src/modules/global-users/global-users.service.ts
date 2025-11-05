import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class GlobalUsersService {
    constructor(private prisma: PrismaService) { }

    async getUserProfile(userId: string) {
        // First, get the user with just the basic relations that don't have RLS
        const user = await this.prisma.globalUser.findUnique({
            where: { id: userId },
            include: {
                organisations: true,
                organisationAdmins: {
                    include: {
                        organisation: true,
                    },
                },
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Fetch orgUsers with a raw query to bypass RLS (cross-tenant query)
        const orgUsers = await this.prisma.$queryRaw<any[]>`
            SELECT 
                ou.id,
                ou.tenant_id as "tenantId",
                ou.global_user_id as "globalUserId",
                ou.email,
                ou.display_name as "displayName",
                ou.password_hash as "passwordHash",
                ou.is_active as "isActive",
                ou.totp_secret as "totpSecret",
                ou.is_totp_enabled as "isTotpEnabled",
                ou.created_at as "createdAt",
                ou.updated_at as "updatedAt"
            FROM org_users ou
            WHERE ou.global_user_id = ${userId}::uuid
        `;

        // Fetch organizations for each orgUser
        const orgUserTenantIds = orgUsers.map(ou => ou.tenantId);
        const organizations = await this.prisma.organisation.findMany({
            where: {
                id: { in: orgUserTenantIds },
            },
        });

        // Fetch roles for each orgUser (also needs to bypass RLS)
        const orgUserIds = orgUsers.map(ou => ou.id);

        // If no orgUsers, return empty array for roles
        const orgUserRoles = orgUserIds.length > 0
            ? await this.prisma.$queryRaw<any[]>`
                SELECT 
                    our.id,
                    our.org_user_id as "orgUserId",
                    our.role_id as "roleId",
                    our.assigned_at as "assignedAt",
                    r.id as "role_id",
                    r.name as "role_name",
                    r.organization_id as "role_organizationId"
                FROM org_user_roles our
                INNER JOIN roles r ON our.role_id = r.id
                WHERE our.org_user_id = ANY(SELECT unnest(${orgUserIds}::uuid[]))
            `
            : [];

        // Map roles to orgUsers
        const orgUsersWithDetails = orgUsers.map(orgUser => {
            const roles = orgUserRoles
                .filter(r => r.orgUserId === orgUser.id)
                .map(r => ({
                    id: r.id,
                    orgUserId: r.orgUserId,
                    roleId: r.roleId,
                    assignedAt: r.assignedAt,
                    role: {
                        id: r.role_id,
                        name: r.role_name,
                        organizationId: r.role_organizationId,
                    },
                }));

            return {
                ...orgUser,
                roles,
                organisation: organizations.find(org => org.id === orgUser.tenantId),
            };
        });

        // Return user without password hash
        const { passwordHash: _, ...userResponse } = user;
        return {
            ...userResponse,
            orgUsers: orgUsersWithDetails,
        };
    }

    async updateUserProfile(userId: string, updateProfileDto: UpdateProfileDto) {
        const user = await this.prisma.globalUser.update({
            where: { id: userId },
            data: {
                bio: updateProfileDto.bio,
                location: updateProfileDto.location,
                timezone: updateProfileDto.timezone,
                socialLinks: updateProfileDto.socialLinks as any,
            },
            include: {
                organisations: true,
                organisationAdmins: {
                    include: {
                        organisation: true,
                    },
                },
                orgUsers: {
                    include: {
                        roles: {
                            include: {
                                role: true,
                            },
                        },
                    },
                },
            },
        });

        // Return user without password hash
        const { passwordHash: _, ...userResponse } = user;
        return userResponse;
    }
}