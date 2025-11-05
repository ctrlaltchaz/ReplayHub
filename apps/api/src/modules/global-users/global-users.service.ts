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

        // Fetch organizations for each orgUser by tenantId
        const orgUserTenantIds = user.orgUsers.map(ou => ou.tenantId);
        console.log('Fetching organizations for tenant IDs:', orgUserTenantIds);
        const organizations = await this.prisma.organisation.findMany({
            where: {
                id: { in: orgUserTenantIds },
            },
        });
        console.log('Found organizations:', organizations.map(o => ({ id: o.id, name: o.name, slug: o.slug })));

        // Map organizations to orgUsers
        const orgUsersWithOrganization = user.orgUsers.map(orgUser => {
            const org = organizations.find(org => org.id === orgUser.tenantId);
            console.log(`Mapping orgUser ${orgUser.id} (tenantId: ${orgUser.tenantId}) to org:`, org ? `${org.name} (${org.id})` : 'NOT FOUND');
            return {
                ...orgUser,
                organisation: org,
            };
        });

        // Return user without password hash
        const { passwordHash: _, orgUsers, ...userResponse } = user;
        return {
            ...userResponse,
            orgUsers: orgUsersWithOrganization,
        };
    }    async updateUserProfile(userId: string, updateProfileDto: UpdateProfileDto) {
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