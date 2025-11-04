import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DiscordService } from '../../discord/discord.service';
import { CreateTeamDto, TeamQueryDto, UpdateTeamDto } from '../dto';

@Injectable()
export class TeamService {
    constructor(
        private prisma: PrismaService,
        private discordService: DiscordService,
    ) { }

    async create(tenantId: string, createTeamDto: CreateTeamDto) {
        // Validate coach exists if provided
        if (createTeamDto.coachId) {
            const coach = await this.prisma.orgUser.findFirst({
                where: { id: createTeamDto.coachId, tenantId },
            });
            if (!coach) {
                throw new BadRequestException('Coach not found');
            }
        }

        // Check for duplicate team name within the same season/game
        const existing = await this.prisma.team.findFirst({
            where: {
                tenantId,
                name: createTeamDto.name,
                game: createTeamDto.game,
                season: createTeamDto.season || null,
            },
        });

        if (existing) {
            throw new ConflictException('Team with this name already exists for this game/season');
        }

        return this.prisma.team.create({
            data: {
                name: createTeamDto.name,
                game: createTeamDto.game,
                season: createTeamDto.season || null,
                coachId: createTeamDto.coachId || null,
                captainId: createTeamDto.captainId || null,
                tenantId,
            },
            include: {
                coach: {
                    select: { id: true, displayName: true, email: true },
                },
                captain: {
                    select: { id: true, gamerTag: true, realName: true },
                },
                _count: {
                    select: { members: true },
                },
            },
        });
    }

    async findMany(tenantId: string, query: TeamQueryDto) {
        const where: any = { tenantId };

        if (query.game) {
            where.game = query.game;
        }
        if (query.season) {
            where.season = query.season;
        }
        if (query.status) {
            where.status = query.status;
        }
        if (query.q) {
            where.OR = [
                { name: { contains: query.q, mode: 'insensitive' } },
                { game: { contains: query.q, mode: 'insensitive' } },
                { season: { contains: query.q, mode: 'insensitive' } },
            ];
        }

        return this.prisma.team.findMany({
            where,
            include: {
                coach: {
                    select: { id: true, displayName: true, email: true },
                },
                captain: {
                    select: { id: true, gamerTag: true, realName: true },
                },
                _count: {
                    select: { members: true },
                },
            },
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        });
    }

    async findOne(tenantId: string, id: string) {
        const team = await this.prisma.team.findFirst({
            where: { id, tenantId },
            include: {
                coach: {
                    select: { id: true, displayName: true, email: true },
                },
                captain: {
                    select: { id: true, gamerTag: true, realName: true },
                },
                members: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                gamerTag: true,
                                role: true,
                                rank: true,
                                eligibility: true,
                                isActive: true,
                                orgUser: {
                                    select: { id: true, displayName: true, email: true },
                                },
                            },
                        },
                    },
                    orderBy: [{ isStarter: 'desc' }, { position: 'asc' }, { createdAt: 'asc' }],
                },
                _count: {
                    select: {
                        members: true,
                        lineups: true,
                        achievements: true,
                    },
                },
            },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        return team;
    }

    async update(tenantId: string, id: string, updateTeamDto: UpdateTeamDto) {
        // Check if team exists
        const existing = await this.prisma.team.findFirst({
            where: { id, tenantId },
        });

        if (!existing) {
            throw new NotFoundException('Team not found');
        }

        // Validate coach exists if provided
        if (updateTeamDto.coachId) {
            const coach = await this.prisma.orgUser.findFirst({
                where: { id: updateTeamDto.coachId, tenantId },
            });
            if (!coach) {
                throw new BadRequestException('Coach not found');
            }
        }

        // Validate captain exists if provided (ignore empty strings)
        if (updateTeamDto.captainId && updateTeamDto.captainId.trim() !== '') {
            const captain = await this.prisma.player.findFirst({
                where: { id: updateTeamDto.captainId, tenantId },
            });
            if (!captain) {
                throw new BadRequestException('Captain not found');
            }
        } else if (updateTeamDto.captainId === '') {
            // Convert empty string to null
            updateTeamDto.captainId = null;
        }

        // Check for name conflicts if name is being changed
        if (updateTeamDto.name && updateTeamDto.name !== existing.name) {
            const conflict = await this.prisma.team.findFirst({
                where: {
                    tenantId,
                    name: updateTeamDto.name,
                    game: updateTeamDto.game || existing.game,
                    season: updateTeamDto.season || existing.season,
                    id: { not: id },
                },
            });

            if (conflict) {
                throw new ConflictException('Team with this name already exists for this game/season');
            }
        }

        return this.prisma.team.update({
            where: { id },
            data: updateTeamDto,
            include: {
                coach: {
                    select: { id: true, displayName: true, email: true },
                },
                captain: {
                    select: { id: true, gamerTag: true, realName: true },
                },
                _count: {
                    select: { members: true },
                },
            },
        });
    }

    async archive(tenantId: string, id: string) {
        const team = await this.prisma.team.findFirst({
            where: { id, tenantId },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        if (team.status === 'archived') {
            throw new ConflictException('Team is already archived');
        }

        return this.prisma.team.update({
            where: { id },
            data: { status: 'archived' },
            include: {
                coach: {
                    select: { id: true, displayName: true, email: true },
                },
                _count: {
                    select: { members: true },
                },
            },
        });
    }

    async delete(tenantId: string, id: string) {
        const team = await this.prisma.team.findFirst({
            where: { id, tenantId },
            include: {
                _count: {
                    select: {
                        members: true,
                        lineups: true,
                        achievements: true,
                    },
                },
            },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        // Delete related records first (cascade delete)
        await this.prisma.$transaction([
            // Delete team members
            this.prisma.teamMember.deleteMany({
                where: { teamId: id, tenantId },
            }),
            // Delete lineup slots related to this team's lineups
            this.prisma.lineupSlot.deleteMany({
                where: {
                    lineup: {
                        teamId: id,
                        tenantId,
                    },
                },
            }),
            // Delete lineups
            this.prisma.lineup.deleteMany({
                where: { teamId: id, tenantId },
            }),
            // Delete achievements
            this.prisma.achievement.deleteMany({
                where: { teamId: id, tenantId },
            }),
            // Delete matches (gamelog)
            this.prisma.match.deleteMany({
                where: { teamId: id, tenantId },
            }),
            // Finally delete the team
            this.prisma.team.delete({
                where: { id },
            }),
        ]);

        return { message: 'Team deleted successfully' };
    }

    async addMember(tenantId: string, teamId: string, playerId: string, isStarter = true, position?: string) {
        // Verify team exists
        const team = await this.prisma.team.findFirst({
            where: { id: teamId, tenantId },
        });
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        // Verify player exists
        const player = await this.prisma.player.findFirst({
            where: { id: playerId, tenantId },
        });
        if (!player) {
            throw new NotFoundException('Player not found');
        }

        // Check if player is already on team
        const existingMember = await this.prisma.teamMember.findFirst({
            where: { teamId, playerId, tenantId },
        });
        if (existingMember) {
            throw new ConflictException('Player is already on this team');
        }

        return this.prisma.teamMember.create({
            data: {
                tenantId,
                teamId,
                playerId,
                isStarter,
                position,
            },
            include: {
                player: {
                    select: {
                        id: true,
                        gamerTag: true,
                        role: true,
                        rank: true,
                        eligibility: true,
                    },
                },
            },
        }).then(async (member) => {
            // Send Discord notification
            try {
                // Get affected player's orgUserId for DM notification
                const affectedOrgUserIds = player.orgUserId ? [player.orgUserId] : undefined;

                await this.discordService.notifyRoster(
                    tenantId,
                    {
                        type: 'player_added',
                        teamName: team.name,
                        playerName: player.gamerTag,
                        role: position || member.position,
                        details: isStarter ? 'Added as starter' : 'Added as substitute',
                    },
                    affectedOrgUserIds
                );
            } catch (error) {
                // Don't fail the operation if Discord notification fails
                console.error('Failed to send Discord roster notification:', error);
            }
            return member;
        });
    }

    async removeMember(tenantId: string, teamId: string, playerId: string) {
        const member = await this.prisma.teamMember.findFirst({
            where: { teamId, playerId, tenantId },
            include: {
                team: { select: { name: true } },
                player: { select: { gamerTag: true, orgUserId: true } },
            },
        });

        if (!member) {
            throw new NotFoundException('Team member not found');
        }

        await this.prisma.teamMember.delete({
            where: { id: member.id },
        });

        // Send Discord notification
        try {
            // Get affected player's orgUserId for DM notification
            const affectedOrgUserIds = member.player.orgUserId ? [member.player.orgUserId] : undefined;

            await this.discordService.notifyRoster(
                tenantId,
                {
                    type: 'player_removed',
                    teamName: member.team.name,
                    playerName: member.player.gamerTag,
                    details: 'Removed from team',
                },
                affectedOrgUserIds
            );
        } catch (error) {
            // Don't fail the operation if Discord notification fails
            console.error('Failed to send Discord roster notification:', error);
        }

        return member;
    }

    async updateMember(tenantId: string, teamId: string, playerId: string, isStarter?: boolean, position?: string) {
        const member = await this.prisma.teamMember.findFirst({
            where: { teamId, playerId, tenantId },
            include: {
                team: { select: { name: true } },
                player: { select: { gamerTag: true, orgUserId: true } },
            },
        });

        if (!member) {
            throw new NotFoundException('Team member not found');
        }

        const updateData: any = {};
        if (isStarter !== undefined) updateData.isStarter = isStarter;
        if (position !== undefined) updateData.position = position;

        const updatedMember = await this.prisma.teamMember.update({
            where: { id: member.id },
            data: updateData,
            include: {
                player: {
                    select: {
                        id: true,
                        gamerTag: true,
                        role: true,
                        rank: true,
                        eligibility: true,
                    },
                },
            },
        });

        // Send Discord notification for role changes
        if (isStarter !== undefined || position !== undefined) {
            try {
                const changes = [];
                if (position !== undefined) changes.push(`Position: ${position}`);
                if (isStarter !== undefined) changes.push(`Role: ${isStarter ? 'Starter' : 'Substitute'}`);

                // Get affected player's orgUserId for DM notification
                const affectedOrgUserIds = member.player.orgUserId ? [member.player.orgUserId] : undefined;

                await this.discordService.notifyRoster(
                    tenantId,
                    {
                        type: 'lineup_changed',
                        teamName: member.team.name,
                        playerName: member.player.gamerTag,
                        details: changes.join(', '),
                    },
                    affectedOrgUserIds
                );
            } catch (error) {
                // Don't fail the operation if Discord notification fails
                console.error('Failed to send Discord roster notification:', error);
            }
        }

        return updatedMember;
    }

    async countTeams(tenantId: string): Promise<number> {
        return this.prisma.team.count({
            where: { tenantId },
        });
    }
}