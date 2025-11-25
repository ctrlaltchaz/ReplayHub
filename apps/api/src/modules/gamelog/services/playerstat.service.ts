import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import {
  BulkCreatePlayerStatsDto,
  ComputeStatsDto,
  CreatePlayerStatDto,
  PlayerStatResponse,
  UpdatePlayerStatDto,
} from '../dto/gamelog.dto';
import { validateStatsJson } from '../validators/game-stats.validator';

@Injectable()
export class PlayerStatService {
  constructor(
    private prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async createPlayerStat(
    tenantId: string,
    matchId: string,
    dto: CreatePlayerStatDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<PlayerStatResponse> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      // Verify match exists and is editable
      const match = await tx.match.findFirst({
        where: { id: matchId, tenantId },
        include: {
          lineup: {
            include: {
              slots: true,
            },
          },
        },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      if (match.status === 'approved') {
        throw new ForbiddenException('Cannot add stats to approved match');
      }

      // Validate player exists in tenant
      const player = await tx.player.findFirst({
        where: { id: dto.playerId, tenantId },
      });

      if (!player) {
        throw new NotFoundException('Player not found');
      }

      // Check lineup constraints if lineupId is set on match
      if (match.lineupId && !dto.allowExternalPlayers) {
        const isInLineup = match.lineup?.slots?.some(slot => slot.playerId === dto.playerId);
        if (!isInLineup) {
          throw new BadRequestException(
            'Player is not in the match lineup. Use allowExternalPlayers=true to override.'
          );
        }
      }

      // Validate mapGameId if provided
      if (!dto.mapGameId) {
        // Enforce round-level stats by attaching to default/first round
        const defaultRound = await this.ensureDefaultRound(tx, tenantId, match);
        dto.mapGameId = defaultRound.id;
      }

      // Validate and transform stats based on map/round context
      const mapGame = await tx.mapGame.findFirst({
        where: { id: dto.mapGameId, matchId, tenantId },
      });

      if (!mapGame) {
        throw new NotFoundException('Map game not found');
      }

      try {
        const validatedStats = validateStatsJson(mapGame.title, dto.statsJson);
        dto.statsJson = validatedStats;
      } catch (error) {
        throw new BadRequestException(`Invalid stats for game ${mapGame.title}: ${error.message}`);
      }

      // Check for existing stat (prevent duplicates)
      const existingStat = await tx.playerStat.findFirst({
        where: {
          tenantId,
          matchId,
          playerId: dto.playerId,
          mapGameId: dto.mapGameId || null,
        },
      });

      if (existingStat) {
        throw new BadRequestException('Player stat already exists for this match/map combination');
      }

      // Get globalUserId if player is linked
      const globalUserId = player.globalUserId;

      const playerStat = await tx.playerStat.create({
        data: {
          tenantId,
          matchId,
          mapGameId: dto.mapGameId,
          playerId: dto.playerId,
          globalUserId,
          lineupId: match.lineupId,
          role: dto.role,
          statsJson: dto.statsJson,
          rating: dto.rating,
          isMvp: dto.isMvp || false,
        },
        include: {
          player: true,
          mapGame: true,
        },
      });

      const formatted = this.formatPlayerStatResponse(playerStat);

      await this.auditService.log({
        tenantId,
        action: 'player.stats.record',
        entity: 'player_stat',
        entityType: 'ORG_USER',
        entityId: playerStat.id,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Recorded player stats',
        metadata: {
          matchId,
          playerId: dto.playerId,
          mapGameId: dto.mapGameId,
          statsJson: dto.statsJson,
          rating: dto.rating,
          isMvp: dto.isMvp,
          actorEmail,
        },
      });

      return formatted;
    });
  }

  async bulkCreatePlayerStats(
    tenantId: string,
    matchId: string,
    dto: BulkCreatePlayerStatsDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<PlayerStatResponse[]> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      // Verify match exists and is editable
      const match = await tx.match.findFirst({
        where: { id: matchId, tenantId },
        include: {
          lineup: {
            include: {
              slots: true,
            },
          },
        },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      if (match.status === 'approved') {
        throw new ForbiddenException('Cannot add stats to approved match');
      }

      // Validate payload duplicates for same player/round
      const seenCombos = new Set<string>();
      for (const stat of dto.stats) {
        const key = `${stat.playerId}::${stat.mapGameId || 'default'}`;
        if (seenCombos.has(key)) {
          throw new BadRequestException(
            'Duplicate stats for the same player and round in this request'
          );
        }
        seenCombos.add(key);
      }

      // Validate all players exist (deduped)
      const playerIds = dto.stats.map(s => s.playerId);
      const uniquePlayerIds = Array.from(new Set(playerIds));
      const players = await tx.player.findMany({
        where: {
          id: { in: uniquePlayerIds },
          tenantId,
        },
      });

      if (players.length !== uniquePlayerIds.length) {
        const foundIds = players.map(p => p.id);
        const missingIds = uniquePlayerIds.filter(id => !foundIds.includes(id));
        throw new NotFoundException(`Players not found: ${missingIds.join(', ')}`);
      }

      // Validate lineup constraints for non-external players
      if (match.lineupId) {
        const lineupPlayerIds = match.lineup?.slots?.map(slot => slot.playerId) || [];

        for (const statDto of dto.stats) {
          if (!statDto.allowExternalPlayers && !lineupPlayerIds.includes(statDto.playerId)) {
            const player = players.find(p => p.id === statDto.playerId);
            throw new BadRequestException(
              `Player ${player?.gamerTag} is not in the match lineup. Use allowExternalPlayers=true to override.`
            );
          }
        }
      }

      // Validate map games and stats
      const mapGameIds = dto.stats.map(s => s.mapGameId).filter(Boolean) as string[];
      const mapGames = await tx.mapGame.findMany({
        where: {
          id: { in: mapGameIds },
          matchId,
          tenantId,
        },
      });

      // Ensure every stat is tied to a round/map
      let defaultRound = mapGames.find(m => m.gameIdx === 1);

      if (!defaultRound) {
        defaultRound = await this.ensureDefaultRound(tx, tenantId, match);
        mapGames.push(defaultRound);
      }

      // Get team for fallback game type
      const team = await tx.team.findFirst({
        where: { id: match.teamId, tenantId },
      });

      // Validate each stat
      const validatedStats = dto.stats.map(statDto => {
        const mapGameId = statDto.mapGameId || defaultRound?.id;
        const mapGame = mapGames.find(m => m.id === mapGameId);
        if (!mapGame) {
          throw new NotFoundException('Map game not found');
        }
        const gameTitle = mapGame?.title || team?.game || 'generic';

        try {
          const validatedStatsJson = validateStatsJson(gameTitle, statDto.statsJson);
          return {
            ...statDto,
            mapGameId,
            statsJson: validatedStatsJson,
          };
        } catch (error) {
          const player = players.find(p => p.id === statDto.playerId);
          throw new BadRequestException(
            `Invalid stats for player ${player?.gamerTag} in game ${gameTitle}: ${error.message}`
          );
        }
      });

      // Delete existing stats for these players/maps (bulk replace)
      await tx.playerStat.deleteMany({
        where: {
          tenantId,
          matchId,
          OR: validatedStats.map(stat => ({
            playerId: stat.playerId,
            mapGameId: stat.mapGameId || null,
          })),
        },
      });

      // Create all stats
      const results = await Promise.all(
        validatedStats.map(statDto => {
          const player = players.find(p => p.id === statDto.playerId);
          console.log('💾 Creating PlayerStat with:', {
            playerId: statDto.playerId,
            rating: statDto.rating,
            isMvp: statDto.isMvp,
            statsJson: statDto.statsJson,
          });
          return tx.playerStat.create({
            data: {
              tenantId,
              matchId,
              mapGameId: statDto.mapGameId,
              playerId: statDto.playerId,
              globalUserId: player?.globalUserId,
              lineupId: match.lineupId,
              role: statDto.role,
              statsJson: statDto.statsJson,
              rating: statDto.rating,
              isMvp: statDto.isMvp || false,
            },
            include: {
              player: true,
              mapGame: true,
            },
          });
        })
      );

      const formatted = results.map(stat => this.formatPlayerStatResponse(stat));
      console.log(
        '✅ Bulk create returning:',
        formatted.map(s => ({ id: s.id, rating: s.rating, isMvp: s.isMvp }))
      );
      await this.auditService.log({
        tenantId,
        action: 'player.stats.import',
        entity: 'player_stat',
        entityType: 'ORG_USER',
        entityId: matchId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Bulk recorded player stats',
        metadata: {
          matchId,
          count: formatted.length,
          players: validatedStats.map(s => s.playerId),
          mapGameIds: validatedStats.map(s => s.mapGameId),
          actorEmail,
        },
      });

      return formatted;
    });
  }

  async findStatsByMatch(tenantId: string, matchId: string): Promise<PlayerStatResponse[]> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      await this.migrateLegacyStatsToRound(tx, tenantId, matchId);

      const stats = await tx.playerStat.findMany({
        where: { matchId, tenantId },
        include: {
          player: true,
          mapGame: true,
        },
        orderBy: [{ mapGame: { gameIdx: 'asc' } }, { player: { gamerTag: 'asc' } }],
      });

      const { aggregated } = this.aggregatePlayerStats(stats);
      return aggregated;
    });
  }

  async findStatById(tenantId: string, statId: string): Promise<PlayerStatResponse> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      const stat = await tx.playerStat.findFirst({
        where: { id: statId, tenantId },
        include: {
          player: true,
          mapGame: true,
          match: true,
        },
      });

      if (!stat) {
        throw new NotFoundException('Player stat not found');
      }

      if (!stat.mapGameId) {
        await this.migrateLegacyStatsToRound(tx, tenantId, stat.matchId);
        const migrated = await tx.playerStat.findFirst({
          where: { id: statId, tenantId },
          include: {
            player: true,
            mapGame: true,
            match: true,
          },
        });
        if (migrated) {
          return this.formatPlayerStatResponse(migrated);
        }
      }

      return this.formatPlayerStatResponse(stat);
    });
  }

  async updatePlayerStat(
    tenantId: string,
    statId: string,
    dto: UpdatePlayerStatDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<PlayerStatResponse> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      const stat = await tx.playerStat.findFirst({
        where: { id: statId, tenantId },
        include: {
          match: true,
          mapGame: true,
        },
      });

      if (!stat) {
        throw new NotFoundException('Player stat not found');
      }

      if (stat.match.status === 'approved') {
        throw new ForbiddenException('Cannot edit stats in approved match');
      }

      // If statsJson is being updated, validate it
      if (dto.statsJson) {
        const gameTitle = stat.mapGame?.title || 'generic';
        try {
          // For generic game type, allow flexible stats structure
          if (gameTitle === 'generic') {
            // Don't validate, just ensure it's an object
            if (typeof dto.statsJson !== 'object' || dto.statsJson === null) {
              throw new BadRequestException('statsJson must be an object');
            }
            // Keep statsJson as-is for generic games
          } else {
            // For specific games, validate against schema
            const validatedStats = validateStatsJson(gameTitle, dto.statsJson);
            dto.statsJson = validatedStats;
          }
        } catch (error) {
          throw new BadRequestException(`Invalid stats for game ${gameTitle}: ${error.message}`);
        }
      }

      const updatedStat = await tx.playerStat.update({
        where: { id: statId },
        data: {
          role: dto.role,
          statsJson: dto.statsJson,
          rating: dto.rating,
          isMvp: dto.isMvp,
        },
        include: {
          player: true,
          mapGame: true,
        },
      });

      const formatted = this.formatPlayerStatResponse(updatedStat);

      await this.auditService.log({
        tenantId,
        action: 'player.stats.update',
        entity: 'player_stat',
        entityType: 'ORG_USER',
        entityId: statId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Updated player stats',
        metadata: {
          matchId: stat.matchId,
          playerId: stat.playerId,
          mapGameId: stat.mapGameId,
          before: {
            role: stat.role,
            statsJson: stat.statsJson,
            rating: stat.rating,
            isMvp: stat.isMvp,
          },
          after: {
            role: dto.role ?? stat.role,
            statsJson: dto.statsJson ?? stat.statsJson,
            rating: dto.rating ?? stat.rating,
            isMvp: dto.isMvp ?? stat.isMvp,
          },
          actorEmail,
        },
      });

      return formatted;
    });
  }

  async deletePlayerStat(
    tenantId: string,
    statId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<void> {
    await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      const stat = await tx.playerStat.findFirst({
        where: { id: statId, tenantId },
        include: { match: true },
      });

      if (!stat) {
        throw new NotFoundException('Player stat not found');
      }

      if (stat.match.status === 'approved') {
        throw new ForbiddenException('Cannot delete stats from approved match');
      }

      await tx.playerStat.delete({
        where: { id: statId },
      });

      await this.auditService.log({
        tenantId,
        action: 'player.stats.delete',
        entity: 'player_stat',
        entityType: 'ORG_USER',
        entityId: statId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Deleted player stats',
        metadata: {
          matchId: stat.matchId,
          playerId: stat.playerId,
          mapGameId: stat.mapGameId,
          actorEmail,
        },
      });
    });
  }

  async computeStatsAndMvp(
    tenantId: string,
    matchId: string,
    dto: ComputeStatsDto
  ): Promise<{ updated: number; mvpUpdated: boolean }> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      // Get match and all stats
      const match = await tx.match.findFirst({
        where: { id: matchId, tenantId },
        include: {
          playerStats: {
            include: {
              player: true,
              mapGame: true,
            },
          },
        },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      if (match.status === 'approved') {
        throw new ForbiddenException('Cannot compute stats for approved match');
      }

      let updatedCount = 0;
      let mvpUpdated = false;

      // Recompute ratings if requested
      if (dto.recomputeRatings) {
        for (const stat of match.playerStats) {
          const newRating = this.calculateRating(stat.statsJson, stat.mapGame?.title);

          if (newRating !== stat.rating) {
            await tx.playerStat.update({
              where: { id: stat.id },
              data: { rating: newRating },
            });
            updatedCount++;
          }
        }
      }

      // Recompute MVP if requested
      if (dto.recomputeMvp) {
        // Clear existing MVPs
        await tx.playerStat.updateMany({
          where: { matchId, tenantId },
          data: { isMvp: false },
        });

        // Find highest rated player(s)
        const statsWithRatings = await tx.playerStat.findMany({
          where: { matchId, tenantId },
          include: { player: true },
        });

        if (statsWithRatings.length > 0) {
          const maxRating = Math.max(...statsWithRatings.map(s => s.rating || 0));
          const mvpCandidates = statsWithRatings.filter(s => s.rating === maxRating);

          // If there's a tie, prefer players with more objective contributions
          let mvpPlayer = mvpCandidates[0];
          if (mvpCandidates.length > 1) {
            mvpPlayer = mvpCandidates.reduce((best, current) => {
              const bestObjectives = this.getObjectiveScore(best.statsJson);
              const currentObjectives = this.getObjectiveScore(current.statsJson);
              return currentObjectives > bestObjectives ? current : best;
            });
          }

          await tx.playerStat.update({
            where: { id: mvpPlayer.id },
            data: { isMvp: true },
          });

          mvpUpdated = true;
        }
      }

      return { updated: updatedCount, mvpUpdated };
    });
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

  private async ensureDefaultRound(tx: any, tenantId: string, match: any) {
    let defaultRound = await tx.mapGame.findFirst({
      where: { matchId: match.id, tenantId },
      orderBy: { gameIdx: 'asc' },
    });

    if (!defaultRound) {
      defaultRound = await tx.mapGame.create({
        data: {
          tenantId,
          matchId: match.id,
          title: 'Round 1',
          gameIdx: 1,
          ourScore: 0,
          theirScore: 0,
        },
      });
    }

    return defaultRound;
  }

  public async migrateLegacyStatsToRound(tx: any, tenantId: string, matchId: string) {
    const legacyStats = await tx.playerStat.findMany({
      where: { matchId, tenantId, mapGameId: null },
    });

    if (legacyStats.length === 0) return;

    const match = await tx.match.findFirst({ where: { id: matchId, tenantId } });
    if (!match) return;

    const defaultRound = await this.ensureDefaultRound(tx, tenantId, match);

    await tx.playerStat.updateMany({
      where: { id: { in: legacyStats.map(s => s.id) } },
      data: { mapGameId: defaultRound.id },
    });
  }

  public aggregatePlayerStats(stats: any[]): {
    aggregated: PlayerStatResponse[];
    roundStats: PlayerStatResponse[];
  } {
    const roundStats = stats.map(stat => this.formatPlayerStatResponse(stat));
    const grouped = new Map<string, PlayerStatResponse[]>();

    roundStats.forEach(stat => {
      const bucket = grouped.get(stat.playerId) || [];
      bucket.push(stat);
      grouped.set(stat.playerId, bucket);
    });

    const aggregated: PlayerStatResponse[] = Array.from(grouped.values()).map(group =>
      this.aggregatePlayerStatGroup(group)
    );

    aggregated.sort((a, b) => {
      const nameA = a.player?.gamerTag || a.playerId;
      const nameB = b.player?.gamerTag || b.playerId;
      return nameA.localeCompare(nameB);
    });

    return { aggregated, roundStats };
  }

  private aggregatePlayerStatGroup(group: PlayerStatResponse[]): PlayerStatResponse {
    const base = group[0];
    const aggregatedStatsJson: Record<string, any> = {};

    group.forEach(stat => {
      const json = stat.statsJson || {};
      Object.entries(json).forEach(([key, value]) => {
        if (typeof value === 'number') {
          aggregatedStatsJson[key] = (aggregatedStatsJson[key] || 0) + value;
        } else if (aggregatedStatsJson[key] === undefined) {
          aggregatedStatsJson[key] = value;
        }
      });
    });

    const ratingValues = group.map(s => s.rating).filter((r): r is number => typeof r === 'number');
    const rating = ratingValues.length
      ? parseFloat((ratingValues.reduce((sum, r) => sum + r, 0) / ratingValues.length).toFixed(2))
      : undefined;

    const createdAt = group.reduce(
      (earliest, stat) => (stat.createdAt < earliest ? stat.createdAt : earliest),
      group[0].createdAt
    );
    const updatedAt = group.reduce(
      (latest, stat) => (stat.updatedAt > latest ? stat.updatedAt : latest),
      group[0].updatedAt
    );

    return {
      ...base,
      id: group.length === 1 ? base.id : `${base.playerId}-aggregate`,
      mapGameId: group.length === 1 ? base.mapGameId : undefined,
      mapGame: group.length === 1 ? base.mapGame : undefined,
      statsJson: aggregatedStatsJson,
      rating,
      isMvp: group.some(s => s.isMvp),
      createdAt,
      updatedAt,
      roundStats: group,
      totalRounds: group.length,
    };
  }

  private calculateRating(statsJson: any, gameTitle?: string): number {
    // Simple rating calculation based on game type
    const title = gameTitle?.toLowerCase() || 'generic';

    if (title.includes('valorant') || title.includes('val')) {
      const k = statsJson.kills || 0;
      const d = Math.max(statsJson.deaths || 1, 1);
      const a = statsJson.assists || 0;
      const plants = statsJson.plants || 0;
      const defuses = statsJson.defuses || 0;

      return Math.round(((k + a * 0.5 + plants * 2 + defuses * 2) / d) * 100) / 100;
    }

    if (title.includes('lol') || title.includes('league')) {
      const k = statsJson.kills || 0;
      const d = Math.max(statsJson.deaths || 1, 1);
      const a = statsJson.assists || 0;
      const cs = statsJson.cs || 0;

      return Math.round(((k + a * 0.5) / d + cs * 0.01) * 100) / 100;
    }

    if (title.includes('overwatch') || title.includes('ow')) {
      const elims = statsJson.eliminations || 0;
      const d = Math.max(statsJson.deaths || 1, 1);
      const healing = statsJson.healing || 0;
      const damage = statsJson.damage || 0;

      return Math.round((elims / d + (healing + damage) * 0.0001) * 100) / 100;
    }

    if (title.includes('rocket') || title.includes('rl')) {
      const goals = (statsJson.goals || 0) * 3;
      const assists = (statsJson.assists || 0) * 2;
      const saves = statsJson.saves || 0;
      const score = statsJson.score || 0;

      return Math.round((goals + assists + saves + score * 0.01) * 100) / 100;
    }

    // Generic rating
    return Math.round((statsJson.score || 0) * 0.01 * 100) / 100;
  }

  private getObjectiveScore(statsJson: any): number {
    // Sum up objective-related stats for MVP tiebreaking
    let score = 0;

    // VALORANT objectives
    score += (statsJson.plants || 0) * 2;
    score += (statsJson.defuses || 0) * 2;
    score += (statsJson.firstKills || 0) * 1;

    // LoL objectives
    score += (statsJson.wards || 0) * 0.5;
    score += (statsJson.visionScore || 0) * 0.1;

    // OW2 objectives
    score += (statsJson.objectiveKills || 0) * 2;
    score += (statsJson.objectiveTime || 0) * 0.01;

    // RL objectives
    score += (statsJson.saves || 0) * 1;
    score += (statsJson.epicSaves || 0) * 2;

    return score;
  }

  async getPlayerAggregatedStats(tenantId: string, playerId: string) {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      // Get all player stats for this player
      const stats = await tx.playerStat.findMany({
        where: {
          tenantId,
          playerId,
        },
        include: {
          match: {
            include: {
              team: true,
            },
          },
          mapGame: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (stats.length === 0) {
        return null;
      }

      // Calculate aggregated statistics
      const totalGames = stats.length;
      const totalMvps = stats.filter(s => s.isMvp).length;
      const avgRating = stats.reduce((sum, s) => sum + (s.rating || 0), 0) / totalGames;

      // Get unique matches
      const uniqueMatches = new Set(stats.map(s => s.matchId));
      const totalMatches = uniqueMatches.size;

      // Calculate game-specific stats
      const gameStats: Record<string, any> = {};

      stats.forEach(stat => {
        const gameTitle = stat.mapGame?.title || stat.match?.team?.game || 'Unknown';

        if (!gameStats[gameTitle]) {
          gameStats[gameTitle] = {
            gamesPlayed: 0,
            totalKills: 0,
            totalDeaths: 0,
            totalAssists: 0,
            mvps: 0,
            avgRating: 0,
            ratingSum: 0,
          };
        }

        const gs = gameStats[gameTitle];
        gs.gamesPlayed++;
        gs.mvps += stat.isMvp ? 1 : 0;
        gs.ratingSum += stat.rating || 0;

        // Extract common stats from statsJson
        const json = stat.statsJson as any;
        if (json) {
          gs.totalKills += json.kills || json.eliminations || 0;
          gs.totalDeaths += json.deaths || 0;
          gs.totalAssists += json.assists || 0;
        }
      });

      // Calculate averages for each game
      Object.keys(gameStats).forEach(gameTitle => {
        const gs = gameStats[gameTitle];
        gs.avgRating = gs.ratingSum / gs.gamesPlayed;
        gs.kda =
          gs.totalDeaths > 0
            ? ((gs.totalKills + gs.totalAssists) / gs.totalDeaths).toFixed(2)
            : (gs.totalKills + gs.totalAssists).toFixed(2);
        delete gs.ratingSum; // Remove intermediate calculation
      });

      // Get recent matches (last 5)
      const recentMatches = await tx.match.findMany({
        where: {
          tenantId,
          id: { in: Array.from(uniqueMatches) },
        },
        include: {
          team: true,
          playerStats: {
            where: { playerId },
            include: { mapGame: true },
          },
        },
        orderBy: {
          startedAt: 'desc',
        },
        take: 5,
      });

      const recentPerformance = recentMatches.map(match => ({
        matchId: match.id,
        opponent: match.opponent,
        result: match.result,
        date: match.startedAt,
        avgRating:
          match.playerStats.reduce((sum, s) => sum + (s.rating || 0), 0) / match.playerStats.length,
        mvp: match.playerStats.some(s => s.isMvp),
      }));

      return {
        playerId,
        totalGames,
        totalMatches,
        totalMvps,
        avgRating: parseFloat(avgRating.toFixed(2)),
        gameBreakdown: gameStats,
        recentPerformance,
      };
    });
  }

  private formatPlayerStatResponse(stat: any): PlayerStatResponse {
    return {
      id: stat.id,
      tenantId: stat.tenantId,
      matchId: stat.matchId,
      mapGameId: stat.mapGameId,
      playerId: stat.playerId,
      orgUserId: stat.orgUserId,
      lineupId: stat.lineupId,
      role: stat.role,
      statsJson: stat.statsJson,
      rating: stat.rating,
      isMvp: stat.isMvp,
      createdAt: stat.createdAt.toISOString(),
      updatedAt: stat.updatedAt.toISOString(),
      player: stat.player
        ? {
            id: stat.player.id,
            gamerTag: stat.player.gamerTag,
            role: stat.player.role,
          }
        : undefined,
      mapGame: stat.mapGame
        ? {
            id: stat.mapGame.id,
            title: stat.mapGame.title,
            mapName: stat.mapGame.mapName,
            gameIdx: stat.mapGame.gameIdx,
          }
        : undefined,
    };
  }
}
