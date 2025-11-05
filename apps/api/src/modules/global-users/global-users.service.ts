import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class GlobalUsersService {
    constructor(private prisma: PrismaService) { }

    async getUserProfile(userId: string) {
        console.log('=== getUserProfile START ===');
        console.log('userId:', userId);
        
        try {
            // First, get the user with just the basic relations that don't have RLS
            console.log('Fetching global user...');
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
            console.log('Global user found:', user.email);

            // Fetch orgUsers with a raw query to bypass RLS (cross-tenant query)
            console.log('Fetching orgUsers with raw query...');
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
            console.log('OrgUsers found:', orgUsers.length);

            // Fetch organizations for each orgUser
            const orgUserTenantIds = orgUsers.map(ou => ou.tenantId);
            console.log('Fetching organizations for tenants:', orgUserTenantIds);
            const organizations = await this.prisma.organisation.findMany({
                where: {
                    id: { in: orgUserTenantIds },
                },
            });
            console.log('Organizations found:', organizations.length);

            // Fetch roles for each orgUser separately (bypass RLS for each one)
            console.log('Fetching roles for each orgUser...');
            const orgUsersWithDetails = await Promise.all(
                orgUsers.map(async (orgUser) => {
                    const roles = await this.prisma.$queryRaw<any[]>`
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
                        WHERE our.org_user_id = ${orgUser.id}::uuid
                    `;

                    return {
                        ...orgUser,
                        roles: roles.map(r => ({
                            id: r.id,
                            orgUserId: r.orgUserId,
                            roleId: r.roleId,
                            assignedAt: r.assignedAt,
                            role: {
                                id: r.role_id,
                                name: r.role_name,
                                organizationId: r.role_organizationId,
                            },
                        })),
                        organisation: organizations.find(org => org.id === orgUser.tenantId),
                    };
                })
            );
            console.log('All orgUsers with roles fetched successfully');

            // Return user without password hash
            const { passwordHash: _, ...userResponse } = user;
            console.log('=== getUserProfile SUCCESS ===');
            return {
                ...userResponse,
                orgUsers: orgUsersWithDetails,
            };
        } catch (error) {
            console.error('=== getUserProfile ERROR ===');
            console.error('Error:', error);
            console.error('Stack:', error.stack);
            throw error;
        }
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