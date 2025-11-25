import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DiscordService } from '../../discord/discord.service';
import { AuditService } from '../../../common/audit/audit.service';
import { CreateMatchDto, MatchResponse, QueryMatchesDto, UpdateMatchDto } from '../dto/gamelog.dto';
import { PlayerStatService } from './playerstat.service';

@Injectable()
export class GameLogService {
  constructor(
    private prisma: PrismaService,
    private discordService: DiscordService,
    private auditService: AuditService,
    private playerStatService: PlayerStatService
  ) {}

  // ===== MATCH MANAGEMENT =====

  async createMatch(
    tenantId: string,
    userId: string,
    dto: CreateMatchDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<MatchResponse> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      // Validate team belongs to tenant
      const team = await tx.team.findFirst({
        where: { id: dto.teamId, tenantId },
      });

      if (!team) {
        throw new NotFoundException('Team not found');
      }

      // If lineupId provided, validate it belongs to tenant and team
      if (dto.lineupId) {
        const lineup = await tx.lineup.findFirst({
          where: {
            id: dto.lineupId,
            tenantId,
            teamId: dto.teamId,
          },
        });

        if (!lineup) {
          throw new NotFoundException('Lineup not found or does not belong to this team');
        }
      }

      // If eventId provided, derive lineup if not specified
      let lineupId = dto.lineupId;
      if (dto.eventId && !lineupId) {
        const eventLineup = await tx.lineup.findFirst({
          where: {
            eventId: dto.eventId,
            tenantId,
            teamId: dto.teamId,
            published: true,
          },
        });
        if (eventLineup) {
          lineupId = eventLineup.id;
        }
      }

      // Resolve globalUserId for creator
      let createdByGlobalUserId: string | null = null;
      if (userId) {
        const creator = await tx.orgUser.findFirst({
          where: { id: userId, tenantId },
        });
        if (creator) {
          createdByGlobalUserId = creator.globalUserId;
        }
      }

      const match = await tx.match.create({
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
          createdByGlobalUserId,
        },
        include: {
          team: true,
          lineup: {
            include: {
              slots: {
                include: {
                  player: true,
                },
              },
            },
          },
        },
      });

      const formatted = this.formatMatchResponse(match);

      await this.auditService.log({
        tenantId,
        action: 'gamelog.entry.create',
        entity: 'gamelog',
        entityType: 'ORG_USER',
        entityId: match.id,
        orgUserId: await this.resolveActorOrgUserId(
          tenantId,
          actorOrgUserId ?? userId ?? null,
          actorEmail
        ),
        description: 'Created gamelog entry',
        metadata: {
          teamId: dto.teamId,
          opponent: dto.opponent,
          tournament: dto.tournament,
          stage: dto.stage,
          bestOf: dto.bestOf,
          lineupId,
          eventId: dto.eventId,
          actorEmail,
        },
      });

      return formatted;
    });
  }

  async findMatches(tenantId: string, query: QueryMatchesDto) {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

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
        tx.match.findMany({
          where,
          include: {
            team: true,
            lineup: {
              include: {
                slots: {
                  include: {
                    player: true,
                  },
                },
              },
            },
            _count: {
              select: {
                maps: true,
                playerStats: true,
              },
            },
          },
          orderBy: [{ startedAt: 'desc' }, { createdAt: 'desc' }],
          skip: ((query.page || 1) - 1) * (query.limit || 20),
          take: query.limit || 20,
        }),
        tx.match.count({ where }),
      ]);

      return {
        matches: matches.map(match => this.formatMatchResponse(match)),
        total,
        page: query.page || 1,
        totalPages: Math.ceil(total / (query.limit || 20)),
      };
    });
  }

  async findMatchById(tenantId: string, matchId: string): Promise<MatchResponse> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      await this.playerStatService.migrateLegacyStatsToRound(tx, tenantId, matchId);

      const match = await tx.match.findFirst({
        where: { id: matchId, tenantId },
        include: {
          team: true,
          lineup: {
            include: {
              slots: {
                include: {
                  player: true,
                },
              },
            },
          },
          maps: {
            orderBy: { gameIdx: 'asc' },
          },
          playerStats: {
            include: {
              player: true,
              mapGame: true,
            },
            orderBy: [{ mapGame: { gameIdx: 'asc' } }, { player: { gamerTag: 'asc' } }],
          },
        },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      return this.formatMatchResponse({
        ...match,
        playerStatsByRound: match.playerStats,
      });
    });
  }

  async updateMatch(
    tenantId: string,
    matchId: string,
    dto: UpdateMatchDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<MatchResponse> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      // Check if match exists and is editable
      const existingMatch = await tx.match.findFirst({
        where: { id: matchId, tenantId },
      });

      if (!existingMatch) {
        throw new NotFoundException('Match not found');
      }

      if (existingMatch.status === 'approved') {
        throw new ForbiddenException('Cannot edit approved match');
      }

      // Validate team if being changed
      if (dto.teamId && dto.teamId !== existingMatch.teamId) {
        const team = await tx.team.findFirst({
          where: { id: dto.teamId, tenantId },
        });

        if (!team) {
          throw new NotFoundException('Team not found');
        }
      }

      // Validate lineup if being changed
      if (dto.lineupId) {
        const lineup = await tx.lineup.findFirst({
          where: {
            id: dto.lineupId,
            tenantId,
            teamId: dto.teamId || existingMatch.teamId,
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
      if (dto.startedAt !== undefined)
        updateData.startedAt = dto.startedAt ? new Date(dto.startedAt) : null;
      if (dto.endedAt !== undefined)
        updateData.endedAt = dto.endedAt ? new Date(dto.endedAt) : null;
      if (dto.status) updateData.status = dto.status;
      if (dto.result !== undefined) updateData.result = dto.result;
      if (dto.score !== undefined) updateData.score = dto.score;
      if (dto.vodUrl !== undefined) updateData.vodUrl = dto.vodUrl;
      if (dto.notes !== undefined) updateData.notes = dto.notes;

      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: updateData,
        include: {
          team: true,
          lineup: {
            include: {
              slots: {
                include: {
                  player: true,
                },
              },
            },
          },
        },
      });

      const formatted = this.formatMatchResponse(updatedMatch);

      await this.auditService.log({
        tenantId,
        action: 'gamelog.entry.update',
        entity: 'gamelog',
        entityType: 'ORG_USER',
        entityId: matchId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Updated gamelog entry',
        metadata: {
          before: existingMatch,
          after: updatedMatch,
          actorEmail,
        },
      });

      return formatted;
    });
  }

  async deleteMatch(
    tenantId: string,
    matchId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<void> {
    await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      const match = await tx.match.findFirst({
        where: { id: matchId, tenantId },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      // Allow deletion of any match (removed approved restriction)
      // Warning should be handled on the frontend

      await tx.match.delete({
        where: { id: matchId },
      });

      await this.auditService.log({
        tenantId,
        action: 'gamelog.entry.delete',
        entity: 'gamelog',
        entityType: 'ORG_USER',
        entityId: matchId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Deleted gamelog entry',
        metadata: {
          teamId: match.teamId,
          opponent: match.opponent,
          tournament: match.tournament,
          actorEmail,
        },
      });
    });
  }

  // ===== MATCH WORKFLOW =====

  async submitMatch(
    tenantId: string,
    matchId: string,
    notes?: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<MatchResponse> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      const match = await tx.match.findFirst({
        where: { id: matchId, tenantId },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      if (match.status !== 'draft') {
        throw new BadRequestException('Match must be in draft status to submit');
      }

      // Optional: Validate match has required data (commented out for now)
      // const maps = await tx.mapGame.count({
      //     where: { matchId, tenantId }
      // });
      // if (maps === 0) {
      //     throw new BadRequestException('Match must have at least one map to submit');
      // }

      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'submitted',
          notes: notes ? `${match.notes || ''}\n\nSubmission notes: ${notes}`.trim() : match.notes,
        },
        include: {
          team: true,
          lineup: {
            include: {
              slots: {
                include: {
                  player: true,
                },
              },
            },
          },
        },
      });

      const formatted = this.formatMatchResponse(updatedMatch);

      await this.auditService.log({
        tenantId,
        action: 'gamelog.entry.submit',
        entity: 'gamelog',
        entityType: 'ORG_USER',
        entityId: matchId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Submitted gamelog entry for approval',
        metadata: {
          notes,
          actorEmail,
        },
      });

      return formatted;
    });
  }

  async approveMatch(
    tenantId: string,
    matchId: string,
    notes?: string,
    forceApprove = false,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<MatchResponse> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      const match = await tx.match.findFirst({
        where: { id: matchId, tenantId },
        include: {
          maps: true,
        },
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

        if (
          (match.result === 'win' && mapsWon <= mapsLost) ||
          (match.result === 'loss' && mapsWon >= mapsLost)
        ) {
          if (!forceApprove) {
            throw new BadRequestException('Match result does not match map scores');
          }
        }
      }

      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'approved',
          notes: notes ? `${match.notes || ''}\n\nApproval notes: ${notes}`.trim() : match.notes,
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
                      globalUserId: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Create achievement if it's a win
      if (match.result === 'win' && match.tournament) {
        await this.createMatchAchievement(tenantId, updatedMatch);
      }

      // Send Discord notification for approved match
      try {
        // Get participant globalUserIds from lineup
        // Note: Discord service will need to be updated to handle GlobalUser IDs
        const participantGlobalUserIds =
          updatedMatch.lineup?.slots
            ?.map(slot => slot.player?.globalUserId)
            .filter((id): id is string => !!id) || [];

        await this.discordService.notifyMatch(
          tenantId,
          {
            game: updatedMatch.team.name,
            opponent: updatedMatch.opponent,
            result: updatedMatch.result as 'win' | 'loss' | 'draw' | undefined,
            score: updatedMatch.score || undefined,
            notes:
              `${updatedMatch.tournament ? `Tournament: ${updatedMatch.tournament}` : ''}`.trim() ||
              undefined,
            url: updatedMatch.vodUrl || undefined,
          },
          participantGlobalUserIds.length > 0 ? participantGlobalUserIds : undefined
        );
      } catch (discordError) {
        console.error('Failed to send Discord notification:', discordError);
      }

      const formatted = this.formatMatchResponse(updatedMatch);

      await this.auditService.log({
        tenantId,
        action: 'gamelog.publish',
        entity: 'gamelog',
        entityType: 'ORG_USER',
        entityId: matchId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Approved/published gamelog entry',
        metadata: {
          notes,
          forceApprove,
          actorEmail,
        },
      });

      return formatted;
    });
  }

  async unapproveMatch(
    tenantId: string,
    matchId: string,
    reason: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<MatchResponse> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      const match = await tx.match.findFirst({
        where: { id: matchId, tenantId },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      if (match.status !== 'approved') {
        throw new BadRequestException('Match is not approved');
      }

      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'submitted',
          notes: `${match.notes || ''}\n\nUnapproval reason: ${reason}`.trim(),
        },
        include: {
          team: true,
          lineup: {
            include: {
              slots: {
                include: {
                  player: true,
                },
              },
            },
          },
        },
      });

      const formatted = this.formatMatchResponse(updatedMatch);

      await this.auditService.log({
        tenantId,
        action: 'gamelog.unpublish',
        entity: 'gamelog',
        entityType: 'ORG_USER',
        entityId: matchId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Unapproved gamelog entry',
        metadata: {
          reason,
          actorEmail,
        },
      });

      return formatted;
    });
  }

  // ===== HELPER METHODS =====

  private formatMatchResponse(match: any): MatchResponse {
    const rawRoundStats = match.playerStatsByRound || match.playerStats || [];
    const aggregation = this.playerStatService.aggregatePlayerStats(rawRoundStats);

    const formattedMaps = (match.maps || []).map((map: any) => ({
      id: map.id,
      tenantId: map.tenantId,
      matchId: map.matchId,
      title: map.title,
      mapName: map.mapName,
      gameIdx: map.gameIdx,
      ourScore: map.ourScore,
      theirScore: map.theirScore,
      durationSec: map.durationSec,
      notes: map.notes,
      createdAt: map.createdAt?.toISOString ? map.createdAt.toISOString() : map.createdAt,
      playerStats: aggregation.roundStats.filter(stat => stat.mapGameId === map.id),
    }));

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
      team: match.team
        ? {
            id: match.team.id,
            name: match.team.name,
            game: match.team.game,
          }
        : undefined,
      lineup: match.lineup
        ? {
            id: match.lineup.id,
            title: match.lineup.title,
            slots:
              match.lineup.slots?.map((slot: any) => ({
                playerId: slot.playerId,
                role: slot.role,
                player: {
                  gamerTag: slot.player.gamerTag,
                  role: slot.player.role,
                },
              })) || [],
          }
        : undefined,
      maps: formattedMaps,
      playerStats: aggregation.aggregated,
      playerStatsByRound: aggregation.roundStats,
    };
  }

  private async createMatchAchievement(tenantId: string, match: any): Promise<void> {
    try {
      await this.prisma.$transaction(async tx => {
        // Set tenant context for RLS
        await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

        const description = `Victory against ${match.opponent}`;
        const details = {
          matchId: match.id,
          opponent: match.opponent,
          tournament: match.tournament,
          score: match.score,
          date: match.startedAt || match.createdAt,
        };

        await tx.achievement.create({
          data: {
            tenantId,
            title: `${match.tournament} Victory`,
            eventRef: match.tournament,
            date: match.endedAt || new Date(),
            details: `${description} - Score: ${match.score}`,
            teamId: match.teamId,
          },
        });
      });
    } catch (error) {
      // Achievement creation is non-critical, log but don't fail
      console.warn('Failed to create match achievement:', error);
    }
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
