import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class GlobalUsersService {
    constructor(private prisma: PrismaService) { }

    async getUserProfile(userId: string) {
        // Note: We intentionally bypass RLS here because this is a cross-tenant query
        // fetching all orgUsers for a global user across multiple tenants
        const user = await this.prisma.globalUser.findUnique({
            where: { id: userId },
            include: {
                organisations: true,
                organisationAdmins: {
                    include: {
                        organisation: true,
                    },
                },
                orgUsers: {
                    include: {
                        // Don't include organisation here - RLS blocks it
                        roles: {
                            include: {
                                role: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Manually fetch organizations for each orgUser by tenantId
        // This bypasses RLS since organisations table doesn't have RLS enabled
        const orgUserTenantIds = user.orgUsers.map(ou => ou.tenantId);
        const organizations = await this.prisma.organisation.findMany({
            where: {
                id: { in: orgUserTenantIds },
            },
        });

        // Map organizations to orgUsers
        const orgUsersWithOrganization = user.orgUsers.map(orgUser => ({
            ...orgUser,
            organisation: organizations.find(org => org.id === orgUser.tenantId),
        }));

        // Return user without password hash
        const { passwordHash: _, orgUsers, ...userResponse } = user;
        return {
            ...userResponse,
            orgUsers: orgUsersWithOrganization,
        };
    } async updateUserProfile(userId: string, updateProfileDto: UpdateProfileDto) {
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