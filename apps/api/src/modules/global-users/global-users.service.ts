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
                        organisation: true, // Now includes the organization via Prisma relation
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

        // Return user without password hash
        const { passwordHash: _, ...userResponse } = user;
        return userResponse;
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