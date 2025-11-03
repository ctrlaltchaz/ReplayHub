import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DiscordService } from '../../discord/discord.service';
import { CreateMatchDto, MatchResponse, QueryMatchesDto, UpdateMatchDto } from '../dto/gamelog.dto';

@Injectable()
export class GameLogService {
    constructor(
        private prisma: PrismaService,
        private discordService: DiscordService,
    ) { }

    // ===== MATCH MANAGEMENT =====

    async createMatch(tenantId: string, userId: string, dto: CreateMatchDto): Promise<MatchResponse> {
        // Validate team belongs to tenant
        const team = await this.prisma.team.findFirst({
            where: { id: dto.teamId, tenantId },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        // If lineupId provided, validate it belongs to tenant and team
        if (dto.lineupId) {
            const lineup = await this.prisma.lineup.findFirst({
                where: {
                    id: dto.lineupId,
                    tenantId,
                    teamId: dto.teamId
                },
            });

            if (!lineup) {
                throw new NotFoundException('Lineup not found or does not belong to this team');
            }
        }

        // If eventId provided, derive lineup if not specified
        let lineupId = dto.lineupId;
        if (dto.eventId && !lineupId) {
            const eventLineup = await this.prisma.lineup.findFirst({
                where: {
                    eventId: dto.eventId,
                    tenantId,
                    teamId: dto.teamId,
                    published: true
                }
            });
            if (eventLineup) {
                lineupId = eventLineup.id;
            }
        }

        const match = await this.prisma.match.create({
            data: {
                tenantId,
                eventId: dto.eventId,
                teamId: dto.teamId,
                lineupId,
                opponent: dto.opponent,
                tournament: dto.tournament,
                stage: dto.stage,
                bestOf: dto.bestOf || 1,
                startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
                endedAt: dto.endedAt ? new Date(dto.endedAt) : null,
                vodUrl: dto.vodUrl,
                notes: dto.notes,
                createdBy: userId,
            },
            include: {
                team: true,
                lineup: {
                    include: {
                        slots: {
                            include: {
                                player: true
                            }
                        }
                    }
                }
            }
        });

        return this.formatMatchResponse(match);
    }

    async findMatches(tenantId: string, query: QueryMatchesDto) {
        const where: any = { tenantId };

        // Apply filters
        if (query.teamId) where.teamId = query.teamId;
        if (query.status) where.status = query.status;
        if (query.result) where.result = query.result;
        if (query.tournament) {
            where.tournament = { contains: query.tournament, mode: 'insensitive' };
        }
        if (query.from || query.to) {
            where.startedAt = {};
            if (query.from) where.startedAt.gte = new Date(query.from);
            if (query.to) where.startedAt.lte = new Date(query.to);
        }
        if (query.q) {
            where.OR = [
                { opponent: { contains: query.q, mode: 'insensitive' } },
                { tournament: { contains: query.q, mode: 'insensitive' } },
                { stage: { contains: query.q, mode: 'insensitive' } },
                { notes: { contains: query.q, mode: 'insensitive' } },
            ];
        }

        const [matches, total] = await Promise.all([
            this.prisma.match.findMany({
                where,
                include: {
                    team: true,
                    lineup: {
                        include: {
                            slots: {
                                include: {
                                    player: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            maps: true,
                            playerStats: true
                        }
                    }
                },
                orderBy: [
                    { startedAt: 'desc' },
                    { createdAt: 'desc' }
                ],
                skip: ((query.page || 1) - 1) * (query.limit || 20),
                take: query.limit || 20,
            }),
            this.prisma.match.count({ where }),
        ]);

        return {
            matches: matches.map(match => this.formatMatchResponse(match)),
            total,
            page: query.page || 1,
            totalPages: Math.ceil(total / (query.limit || 20)),
        };
    }

    async findMatchById(tenantId: string, matchId: string): Promise<MatchResponse> {
        const match = await this.prisma.match.findFirst({
            where: { id: matchId, tenantId },
            include: {
                team: true,
                lineup: {
                    include: {
                        slots: {
                            include: {
                                player: true
                            }
                        }
                    }
                },
                maps: {
                    orderBy: { gameIdx: 'asc' }
                },
                playerStats: {
                    include: {
                        player: true,
                        mapGame: true
                    }
                }
            }
        });

        if (!match) {
            throw new NotFoundException('Match not found');
        }

        return this.formatMatchResponse(match);
    }

    async updateMatch(tenantId: string, matchId: string, dto: UpdateMatchDto): Promise<MatchResponse> {
        // Check if match exists and is editable
        const existingMatch = await this.prisma.match.findFirst({
            where: { id: matchId, tenantId }
        });

        if (!existingMatch) {
            throw new NotFoundException('Match not found');
        }

        if (existingMatch.status === 'approved') {
            throw new ForbiddenException('Cannot edit approved match');
        }

        // Validate team if being changed
        if (dto.teamId && dto.teamId !== existingMatch.teamId) {
            const team = await this.prisma.team.findFirst({
                where: { id: dto.teamId, tenantId },
            });

            if (!team) {
                throw new NotFoundException('Team not found');
            }
        }

        // Validate lineup if being changed
        if (dto.lineupId) {
            const lineup = await this.prisma.lineup.findFirst({
                where: {
                    id: dto.lineupId,
                    tenantId,
                    teamId: dto.teamId || existingMatch.teamId
                },
            });

            if (!lineup) {
                throw new NotFoundException('Lineup not found or does not belong to this team');
            }
        }

        const updateData: any = {};
        if (dto.eventId !== undefined) updateData.eventId = dto.eventId;
        if (dto.teamId) updateData.teamId = dto.teamId;
        if (dto.lineupId !== undefined) updateData.lineupId = dto.lineupId;
        if (dto.opponent) updateData.opponent = dto.opponent;
        if (dto.tournament !== undefined) updateData.tournament = dto.tournament;
        if (dto.stage !== undefined) updateData.stage = dto.stage;
        if (dto.bestOf) updateData.bestOf = dto.bestOf;
        if (dto.startedAt !== undefined) updateData.startedAt = dto.startedAt ? new Date(dto.startedAt) : null;
        if (dto.endedAt !== undefined) updateData.endedAt = dto.endedAt ? new Date(dto.endedAt) : null;
        if (dto.status) updateData.status = dto.status;
        if (dto.result !== undefined) updateData.result = dto.result;
        if (dto.score !== undefined) updateData.score = dto.score;
        if (dto.vodUrl !== undefined) updateData.vodUrl = dto.vodUrl;
        if (dto.notes !== undefined) updateData.notes = dto.notes;

        const updatedMatch = await this.prisma.match.update({
            where: { id: matchId },
            data: updateData,
            include: {
                team: true,
                lineup: {
                    include: {
                        slots: {
                            include: {
                                player: true
                            }
                        }
                    }
                }
            }
        });

        return this.formatMatchResponse(updatedMatch);
    }

    async deleteMatch(tenantId: string, matchId: string): Promise<void> {
        const match = await this.prisma.match.findFirst({
            where: { id: matchId, tenantId }
        });

        if (!match) {
            throw new NotFoundException('Match not found');
        }

        // Allow deletion of any match (removed approved restriction)
        // Warning should be handled on the frontend

        await this.prisma.match.delete({
            where: { id: matchId }
        });
    }

    // ===== MATCH WORKFLOW =====

    async submitMatch(tenantId: string, matchId: string, notes?: string): Promise<MatchResponse> {
        const match = await this.prisma.match.findFirst({
            where: { id: matchId, tenantId }
        });

        if (!match) {
            throw new NotFoundException('Match not found');
        }

        if (match.status !== 'draft') {
            throw new BadRequestException('Match must be in draft status to submit');
        }

        // Optional: Validate match has required data (commented out for now)
        // const maps = await this.prisma.mapGame.count({
        //     where: { matchId, tenantId }
        // });
        // if (maps === 0) {
        //     throw new BadRequestException('Match must have at least one map to submit');
        // }

        const updatedMatch = await this.prisma.match.update({
            where: { id: matchId },
            data: {
                status: 'submitted',
                notes: notes ? `${match.notes || ''}\n\nSubmission notes: ${notes}`.trim() : match.notes
            },
            include: {
                team: true,
                lineup: {
                    include: {
                        slots: {
                            include: {
                                player: true
                            }
                        }
                    }
                }
            }
        });

        return this.formatMatchResponse(updatedMatch);
    }

    async approveMatch(tenantId: string, matchId: string, notes?: string, forceApprove = false): Promise<MatchResponse> {
        const match = await this.prisma.match.findFirst({
            where: { id: matchId, tenantId },
            include: {
                maps: true
            }
        });

        if (!match) {
            throw new NotFoundException('Match not found');
        }

        if (!forceApprove && match.status !== 'submitted') {
            throw new BadRequestException('Match must be submitted to approve');
        }

        // Validate match consistency
        if (match.result && match.score && match.maps.length > 0) {
            const mapsWon = match.maps.filter(m => m.ourScore > m.theirScore).length;
            const mapsLost = match.maps.filter(m => m.ourScore < m.theirScore).length;

            if ((match.result === 'win' && mapsWon <= mapsLost) ||
                (match.result === 'loss' && mapsWon >= mapsLost)) {
                if (!forceApprove) {
                    throw new BadRequestException('Match result does not match map scores');
                }
            }
        }

        const updatedMatch = await this.prisma.match.update({
            where: { id: matchId },
            data: {
                status: 'approved',
                notes: notes ? `${match.notes || ''}\n\nApproval notes: ${notes}`.trim() : match.notes
            },
            include: {
                team: true,
                lineup: {
                    include: {
                        slots: {
                            include: {
                                player: {
                                    select: {
                                        id: true,
                                        gamerTag: true,
                                        orgUserId: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Create achievement if it's a win
        if (match.result === 'win' && match.tournament) {
            await this.createMatchAchievement(tenantId, updatedMatch);
        }

        // Send Discord notification for approved match
        try {
            // Get participant orgUserIds from lineup for DM notifications
            const participantOrgUserIds = updatedMatch.lineup?.slots
                ?.map(slot => slot.player?.orgUserId)
                .filter((id): id is string => !!id) || [];

            await this.discordService.notifyMatch(
                tenantId,
                {
                    game: updatedMatch.team.name,
                    opponent: updatedMatch.opponent,
                    result: updatedMatch.result as 'win' | 'loss' | 'draw' | undefined,
                    score: updatedMatch.score || undefined,
                    notes: `${updatedMatch.tournament ? `Tournament: ${updatedMatch.tournament}` : ''}`.trim() || undefined,
                    url: updatedMatch.vodUrl || undefined,
                },
                participantOrgUserIds.length > 0 ? participantOrgUserIds : undefined
            );
        } catch (discordError) {
            console.error('Failed to send Discord notification:', discordError);
        }

        return this.formatMatchResponse(updatedMatch);
    }

    async unapproveMatch(tenantId: string, matchId: string, reason: string): Promise<MatchResponse> {
        const match = await this.prisma.match.findFirst({
            where: { id: matchId, tenantId }
        });

        if (!match) {
            throw new NotFoundException('Match not found');
        }

        if (match.status !== 'approved') {
            throw new BadRequestException('Match is not approved');
        }

        const updatedMatch = await this.prisma.match.update({
            where: { id: matchId },
            data: {
                status: 'submitted',
                notes: `${match.notes || ''}\n\nUnapproval reason: ${reason}`.trim()
            },
            include: {
                team: true,
                lineup: {
                    include: {
                        slots: {
                            include: {
                                player: true
                            }
                        }
                    }
                }
            }
        });

        return this.formatMatchResponse(updatedMatch);
    }

    // ===== HELPER METHODS =====

    private formatMatchResponse(match: any): MatchResponse {
        return {
            id: match.id,
            tenantId: match.tenantId,
            eventId: match.eventId,
            teamId: match.teamId,
            lineupId: match.lineupId,
            opponent: match.opponent,
            tournament: match.tournament,
            stage: match.stage,
            bestOf: match.bestOf,
            startedAt: match.startedAt?.toISOString(),
            endedAt: match.endedAt?.toISOString(),
            status: match.status,
            result: match.result,
            score: match.score,
            vodUrl: match.vodUrl,
            notes: match.notes,
            createdBy: match.createdBy,
            createdAt: match.createdAt.toISOString(),
            updatedAt: match.updatedAt.toISOString(),
            team: match.team ? {
                id: match.team.id,
                name: match.team.name,
                game: match.team.game
            } : undefined,
            lineup: match.lineup ? {
                id: match.lineup.id,
                title: match.lineup.title,
                slots: match.lineup.slots?.map((slot: any) => ({
                    playerId: slot.playerId,
                    role: slot.role,
                    player: {
                        gamerTag: slot.player.gamerTag,
                        role: slot.player.role
                    }
                })) || []
            } : undefined,
            maps: match.maps || [],
            playerStats: match.playerStats || []
        };
    }

    private async createMatchAchievement(tenantId: string, match: any): Promise<void> {
        try {
            const description = `Victory against ${match.opponent}`;
            const details = {
                matchId: match.id,
                opponent: match.opponent,
                tournament: match.tournament,
                score: match.score,
                date: match.startedAt || match.createdAt
            };

            await this.prisma.achievement.create({
                data: {
                    tenantId,
                    title: `${match.tournament} Victory`,
                    eventRef: match.tournament,
                    date: match.endedAt || new Date(),
                    details: `${description} - Score: ${match.score}`,
                    teamId: match.teamId,
                }
            });
        } catch (error) {
            // Achievement creation is non-critical, log but don't fail
            console.warn('Failed to create match achievement:', error);
        }
    }
}