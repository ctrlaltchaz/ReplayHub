import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AchievementQueryDto, CreateAchievementDto } from '../dto';

@Injectable()
export class AchievementService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, createAchievementDto: CreateAchievementDto) {
        // Validate that either teamId or playerId is provided
        if (!createAchievementDto.teamId && !createAchievementDto.playerId) {
            throw new BadRequestException('Either teamId or playerId must be provided');
        }

        // Validate team exists if provided
        if (createAchievementDto.teamId) {
            const team = await this.prisma.team.findFirst({
                where: { id: createAchievementDto.teamId, tenantId },
            });
            if (!team) {
                throw new NotFoundException('Team not found');
            }
        }

        // Validate player exists if provided
        if (createAchievementDto.playerId) {
            const player = await this.prisma.player.findFirst({
                where: { id: createAchievementDto.playerId, tenantId },
            });
            if (!player) {
                throw new NotFoundException('Player not found');
            }
        }

        const parsedDate = new Date(createAchievementDto.date);

        return this.prisma.achievement.create({
            data: {
                tenantId,
                teamId: createAchievementDto.teamId || null,
                playerId: createAchievementDto.playerId || null,
                title: createAchievementDto.title,
                eventRef: createAchievementDto.eventRef,
                date: parsedDate,
                details: createAchievementDto.details,
            },
            include: {
                team: {
                    select: { id: true, name: true, game: true, season: true },
                },
                player: {
                    select: {
                        id: true,
                        gamerTag: true,
                        role: true,
                        globalUser: {
                            select: { name: true },
                        },
                    },
                },
            },
        });
    }

    async findMany(tenantId: string, query: AchievementQueryDto) {
        const where: any = { tenantId };

        if (query.teamId) {
            where.teamId = query.teamId;
        }
        if (query.playerId) {
            where.playerId = query.playerId;
        }
        if (query.from || query.to) {
            where.date = {};
            if (query.from) {
                where.date.gte = new Date(query.from);
            }
            if (query.to) {
                where.date.lte = new Date(query.to);
            }
        }

        return this.prisma.achievement.findMany({
            where,
            include: {
                team: {
                    select: { id: true, name: true, game: true, season: true },
                },
                player: {
                    select: {
                        id: true,
                        gamerTag: true,
                        role: true,
                        globalUser: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: { date: 'desc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        const achievement = await this.prisma.achievement.findFirst({
            where: { id, tenantId },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        game: true,
                        season: true,
                        members: {
                            include: {
                                player: {
                                    select: { id: true, gamerTag: true, role: true },
                                },
                            },
                        },
                    },
                },
                player: {
                    select: {
                        id: true,
                        gamerTag: true,
                        role: true,
                        rank: true,
                        globalUser: {
                            select: { id: true, name: true, email: true },
                        },
                        teams: {
                            include: {
                                team: {
                                    select: { id: true, name: true, game: true, season: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!achievement) {
            throw new NotFoundException('Achievement not found');
        }

        return achievement;
    }

    async update(tenantId: string, id: string, updateData: Partial<CreateAchievementDto>) {
        const existing = await this.prisma.achievement.findFirst({
            where: { id, tenantId },
        });

        if (!existing) {
            throw new NotFoundException('Achievement not found');
        }

        // Validate team exists if being updated
        if (updateData.teamId) {
            const team = await this.prisma.team.findFirst({
                where: { id: updateData.teamId, tenantId },
            });
            if (!team) {
                throw new NotFoundException('Team not found');
            }
        }

        // Validate player exists if being updated
        if (updateData.playerId) {
            const player = await this.prisma.player.findFirst({
                where: { id: updateData.playerId, tenantId },
            });
            if (!player) {
                throw new NotFoundException('Player not found');
            }
        }

        const updatePayload: any = {};
        if (updateData.title !== undefined) updatePayload.title = updateData.title;
        if (updateData.eventRef !== undefined) updatePayload.eventRef = updateData.eventRef;
        if (updateData.details !== undefined) updatePayload.details = updateData.details;
        if (updateData.date !== undefined) updatePayload.date = new Date(updateData.date);
        if (updateData.teamId !== undefined) updatePayload.teamId = updateData.teamId;
        if (updateData.playerId !== undefined) updatePayload.playerId = updateData.playerId;

        return this.prisma.achievement.update({
            where: { id },
            data: updatePayload,
            include: {
                team: {
                    select: { id: true, name: true, game: true, season: true },
                },
                player: {
                    select: {
                        id: true,
                        gamerTag: true,
                        role: true,
                        globalUser: {
                            select: { name: true },
                        },
                    },
                },
            },
        });
    }

    async delete(tenantId: string, id: string) {
        const achievement = await this.prisma.achievement.findFirst({
            where: { id, tenantId },
        });

        if (!achievement) {
            throw new NotFoundException('Achievement not found');
        }

        return this.prisma.achievement.delete({
            where: { id },
        });
    }

    async getTeamAchievements(tenantId: string, teamId: string, limit = 10) {
        // Verify team exists
        const team = await this.prisma.team.findFirst({
            where: { id: teamId, tenantId },
        });
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        return this.prisma.achievement.findMany({
            where: {
                tenantId,
                OR: [
                    { teamId },
                    {
                        playerId: {
                            in: await this.prisma.player.findMany({
                                where: {
                                    tenantId,
                                    teams: { some: { teamId } },
                                },
                                select: { id: true },
                            }).then(players => players.map(p => p.id)),
                        },
                    },
                ],
            },
            include: {
                team: {
                    select: { id: true, name: true },
                },
                player: {
                    select: {
                        id: true,
                        gamerTag: true,
                    },
                },
            },
            orderBy: { date: 'desc' },
            take: limit,
        });
    }

    async getPlayerAchievements(tenantId: string, playerId: string, limit = 10) {
        // Verify player exists
        const player = await this.prisma.player.findFirst({
            where: { id: playerId, tenantId },
        });
        if (!player) {
            throw new NotFoundException('Player not found');
        }

        return this.prisma.achievement.findMany({
            where: {
                tenantId,
                playerId,
            },
            include: {
                team: {
                    select: { id: true, name: true, game: true },
                },
            },
            orderBy: { date: 'desc' },
            take: limit,
        });
    }

    async getRecentAchievements(tenantId: string, limit = 20) {
        return this.prisma.achievement.findMany({
            where: { tenantId },
            include: {
                team: {
                    select: { id: true, name: true, game: true, season: true },
                },
                player: {
                    select: {
                        id: true,
                        gamerTag: true,
                        globalUser: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
}
