import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs-extra';
import { Parser } from 'json2csv';
import * as path from 'path';
import { PrismaService } from '../../../../database/prisma.service';
import { PlayerStatService } from '../playerstat.service';
import { AuditService } from '../../../../common/audit/audit.service';

export interface CsvExportResult {
  filePath: string;
  fileSize: number;
  recordCount: number;
  exportedAt: string;
}

@Injectable()
export class CsvExportService {
  constructor(
    private prisma: PrismaService,
    private playerStatService: PlayerStatService,
    private readonly auditService: AuditService
  ) {}

  async exportMatchStats(tenantId: string, matchId: string): Promise<CsvExportResult> {
    const result = await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      await this.playerStatService.migrateLegacyStatsToRound(tx, tenantId, matchId);

      // Get match data with all player statistics
      const match = await tx.match.findFirst({
        where: { id: matchId, tenantId },
        include: {
          team: true,
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

      // Ensure export directory exists
      const exportDir = path.join(process.cwd(), 'data', tenantId, 'exports');
      await fs.ensureDir(exportDir);

      const fileName = `match-stats-${matchId}.csv`;
      const filePath = path.join(exportDir, fileName);

      // Transform player stats into flat CSV format
      const csvData = this.transformStatsForCsv(match);

      // Define CSV fields
      const fields = this.getCsvFields(match.team?.game);

      // Generate CSV
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(csvData);

      // Write to file
      await fs.writeFile(filePath, csv, 'utf-8');

      // Get file size
      const stats = await fs.stat(filePath);

      return {
        filePath: `/data/${tenantId}/exports/${fileName}`,
        fileSize: stats.size,
        recordCount: csvData.length,
        exportedAt: new Date().toISOString(),
      };
    });

    await this.auditService.log({
      tenantId,
      action: 'player.stats.export',
      entity: 'player_stat',
      entityType: 'ORG_USER',
      entityId: matchId,
      description: 'Exported match player stats to CSV',
      metadata: {
        matchId,
        filePath: result.filePath,
        fileSize: result.fileSize,
        recordCount: result.recordCount,
      },
    });

    return result;
  }

  async exportAggregatedStats(
    tenantId: string,
    options: {
      teamId?: string;
      playerId?: string;
      from?: Date;
      to?: Date;
      tournament?: string;
    } = {}
  ): Promise<CsvExportResult> {
    const exportResult = await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      // Build query filters
      const where: any = { tenantId };

      if (options.teamId) where.teamId = options.teamId;
      if (options.from || options.to) {
        where.startedAt = {};
        if (options.from) where.startedAt.gte = options.from;
        if (options.to) where.startedAt.lte = options.to;
      }
      if (options.tournament) {
        where.tournament = { contains: options.tournament, mode: 'insensitive' };
      }

      const legacyMatches = await tx.playerStat.findMany({
        where: {
          tenantId,
          mapGameId: null,
          match: where,
        },
        select: { matchId: true },
        distinct: ['matchId'],
      });

      for (const legacy of legacyMatches) {
        await this.playerStatService.migrateLegacyStatsToRound(tx, tenantId, legacy.matchId);
      }

      // Get all player stats matching criteria
      const playerStats = await tx.playerStat.findMany({
        where: {
          tenantId,
          match: where,
        },
        include: {
          player: true,
          match: {
            include: {
              team: true,
            },
          },
          mapGame: true,
        },
        orderBy: [
          { match: { startedAt: 'desc' } },
          { mapGame: { gameIdx: 'asc' } },
          { player: { gamerTag: 'asc' } },
        ],
      });

      if (options.playerId) {
        // Filter by specific player
        const filteredStats = playerStats.filter(stat => stat.playerId === options.playerId);
        return this.exportStatsArray(tenantId, filteredStats, 'player-aggregated-stats');
      }

      return this.exportStatsArray(tenantId, playerStats, 'aggregated-stats');
    });

    await this.auditService.log({
      tenantId,
      action: 'player.stats.export',
      entity: 'player_stat',
      entityType: 'ORG_USER',
      entityId: exportResult.filePath,
      description: 'Exported aggregated player stats to CSV',
      metadata: {
        teamId: options.teamId,
        playerId: options.playerId,
        from: options.from,
        to: options.to,
        tournament: options.tournament,
        filePath: exportResult.filePath,
        fileSize: exportResult.fileSize,
        recordCount: exportResult.recordCount,
      },
    });

    return exportResult;
  }

  private async exportStatsArray(
    tenantId: string,
    playerStats: any[],
    filePrefix: string
  ): Promise<CsvExportResult> {
    // Ensure export directory exists
    const exportDir = path.join(process.cwd(), 'data', tenantId, 'exports');
    await fs.ensureDir(exportDir);

    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `${filePrefix}-${timestamp}.csv`;
    const filePath = path.join(exportDir, fileName);

    // Transform stats for CSV
    const csvData = playerStats.map(stat => this.transformStatForCsv(stat));

    // Get game type for field configuration
    const gameType = playerStats[0]?.match?.team?.game || 'generic';
    const fields = this.getCsvFields(gameType, true); // include match context

    // Generate CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    // Write to file
    await fs.writeFile(filePath, csv, 'utf-8');

    // Get file size
    const stats = await fs.stat(filePath);

    return {
      filePath: `/data/${tenantId}/exports/${fileName}`,
      fileSize: stats.size,
      recordCount: csvData.length,
      exportedAt: new Date().toISOString(),
    };
  }

  private transformStatsForCsv(match: any) {
    return match.playerStats.map((stat: any) => this.transformStatForCsv(stat, match));
  }

  private transformStatForCsv(stat: any, match?: any) {
    const matchData = match || stat.match;
    const baseData = {
      // Match context
      matchId: matchData.id,
      matchDate: matchData.startedAt
        ? new Date(matchData.startedAt).toISOString().split('T')[0]
        : '',
      opponent: matchData.opponent,
      tournament: matchData.tournament || '',
      stage: matchData.stage || '',
      matchResult: matchData.result || '',
      matchScore: matchData.score || '',

      // Map context
      mapId: stat.mapGame?.id || '',
      mapTitle: stat.mapGame?.title || matchData.team?.game || '',
      mapName: stat.mapGame?.mapName || '',
      gameIdx: stat.mapGame?.gameIdx || 0,
      mapScore: stat.mapGame ? `${stat.mapGame.ourScore}-${stat.mapGame.theirScore}` : '',

      // Player context
      playerId: stat.player.id,
      gamerTag: stat.player.gamerTag,
      playerRole: stat.role || stat.player.role || '',

      // Performance metrics
      rating: stat.rating || 0,
      isMvp: stat.isMvp ? 'Yes' : 'No',

      // Timestamps
      createdAt: stat.createdAt.toISOString(),
      updatedAt: stat.updatedAt.toISOString(),
    };

    // Add game-specific stats
    const gameTitle = stat.mapGame?.title || matchData.team?.game || '';
    const gameStats = this.flattenGameStats(gameTitle.toLowerCase(), stat.statsJson);

    return { ...baseData, ...gameStats };
  }

  private flattenGameStats(gameTitle: string, statsJson: any): Record<string, any> {
    const flattened: Record<string, any> = {};

    if (gameTitle.includes('valorant') || gameTitle.includes('val')) {
      return {
        kills: statsJson.kills || 0,
        deaths: statsJson.deaths || 0,
        assists: statsJson.assists || 0,
        plants: statsJson.plants || 0,
        defuses: statsJson.defuses || 0,
        firstKills: statsJson.firstKills || 0,
        firstDeaths: statsJson.firstDeaths || 0,
        aces: statsJson.aces || 0,
        clutches: statsJson.clutches || 0,
        multikills: statsJson.multikills || 0,
        headshotPct: statsJson.headshotPct || 0,
        adr: statsJson.adr || 0,
        kast: statsJson.kast || 0,
        agent: statsJson.agent || '',
        abilityKills: statsJson.abilityKills || 0,
        ultimateKills: statsJson.ultimateKills || 0,
      };
    }

    if (gameTitle.includes('lol') || gameTitle.includes('league')) {
      return {
        kills: statsJson.kills || 0,
        deaths: statsJson.deaths || 0,
        assists: statsJson.assists || 0,
        cs: statsJson.cs || 0,
        gold: statsJson.gold || 0,
        level: statsJson.level || 1,
        damage: statsJson.damage || 0,
        damageTaken: statsJson.damageTaken || 0,
        healing: statsJson.healing || 0,
        wards: statsJson.wards || 0,
        wardsDestroyed: statsJson.wardsDestroyed || 0,
        visionScore: statsJson.visionScore || 0,
        champion: statsJson.champion || '',
        rolePosition: statsJson.role || '',
        kp: statsJson.kp || 0,
        csPerMin: statsJson.csPerMin || 0,
        goldPerMin: statsJson.goldPerMin || 0,
      };
    }

    if (gameTitle.includes('overwatch') || gameTitle.includes('ow')) {
      return {
        eliminations: statsJson.eliminations || 0,
        deaths: statsJson.deaths || 0,
        assists: statsJson.assists || 0,
        damage: statsJson.damage || 0,
        damageMitigated: statsJson.damageMitigated || 0,
        healing: statsJson.healing || 0,
        objectiveKills: statsJson.objectiveKills || 0,
        objectiveTime: statsJson.objectiveTime || 0,
        ults: statsJson.ults || 0,
        ultKills: statsJson.ultKills || 0,
        hero: statsJson.hero || '',
        heroRole: statsJson.heroRole || '',
        elimsPer10Min: statsJson.elims_per_10min || 0,
        damagePer10Min: statsJson.damage_per_10min || 0,
        healingPer10Min: statsJson.healing_per_10min || 0,
        criticalHits: statsJson.criticalHits || 0,
        accuracy: statsJson.accuracy || 0,
      };
    }

    if (gameTitle.includes('rocket') || gameTitle.includes('rl')) {
      return {
        goals: statsJson.goals || 0,
        assists: statsJson.assists || 0,
        saves: statsJson.saves || 0,
        shots: statsJson.shots || 0,
        shotsOnGoal: statsJson.shotsOnGoal || 0,
        demos: statsJson.demos || 0,
        epicSaves: statsJson.epicSaves || 0,
        boostUsage: statsJson.boostUsage || 0,
        boostEfficiency: statsJson.boostEfficiency || 0,
        score: statsJson.score || 0,
        mvps: statsJson.mvps || 0,
        ballTouches: statsJson.ballTouches || 0,
        possessionTime: statsJson.possessionTime || 0,
      };
    }

    // Generic stats - flatten all JSON properties
    Object.keys(statsJson).forEach(key => {
      if (typeof statsJson[key] === 'object' && statsJson[key] !== null) {
        // Handle nested objects by stringifying
        flattened[key] = JSON.stringify(statsJson[key]);
      } else {
        flattened[key] = statsJson[key];
      }
    });

    return flattened;
  }

  private getCsvFields(gameType?: string, includeMatchContext = false): any[] {
    const baseFields = includeMatchContext
      ? [
          // Match context fields
          { label: 'Match ID', value: 'matchId' },
          { label: 'Date', value: 'matchDate' },
          { label: 'Opponent', value: 'opponent' },
          { label: 'Tournament', value: 'tournament' },
          { label: 'Stage', value: 'stage' },
          { label: 'Match Result', value: 'matchResult' },
          { label: 'Match Score', value: 'matchScore' },

          // Map context fields
          { label: 'Map ID', value: 'mapId' },
          { label: 'Game Title', value: 'mapTitle' },
          { label: 'Map Name', value: 'mapName' },
          { label: 'Game Index', value: 'gameIdx' },
          { label: 'Map Score', value: 'mapScore' },
        ]
      : [
          // Simplified fields for single match export
          { label: 'Game Index', value: 'gameIdx' },
          { label: 'Map Name', value: 'mapName' },
        ];

    const playerFields = [
      // Player context
      { label: 'Player ID', value: 'playerId' },
      { label: 'Gamer Tag', value: 'gamerTag' },
      { label: 'Role', value: 'playerRole' },

      // Performance
      { label: 'Rating', value: 'rating' },
      { label: 'MVP', value: 'isMvp' },
    ];

    // Add game-specific stat fields
    let gameFields: any[] = [];
    const title = gameType?.toLowerCase() || '';

    if (title.includes('valorant') || title.includes('val')) {
      gameFields = [
        { label: 'Kills', value: 'kills' },
        { label: 'Deaths', value: 'deaths' },
        { label: 'Assists', value: 'assists' },
        { label: 'Plants', value: 'plants' },
        { label: 'Defuses', value: 'defuses' },
        { label: 'First Kills', value: 'firstKills' },
        { label: 'First Deaths', value: 'firstDeaths' },
        { label: 'Aces', value: 'aces' },
        { label: 'Clutches', value: 'clutches' },
        { label: 'Multi-kills', value: 'multikills' },
        { label: 'Headshot %', value: 'headshotPct' },
        { label: 'ADR', value: 'adr' },
        { label: 'KAST %', value: 'kast' },
        { label: 'Agent', value: 'agent' },
        { label: 'Ability Kills', value: 'abilityKills' },
        { label: 'Ultimate Kills', value: 'ultimateKills' },
      ];
    } else if (title.includes('lol') || title.includes('league')) {
      gameFields = [
        { label: 'Kills', value: 'kills' },
        { label: 'Deaths', value: 'deaths' },
        { label: 'Assists', value: 'assists' },
        { label: 'CS', value: 'cs' },
        { label: 'Gold', value: 'gold' },
        { label: 'Level', value: 'level' },
        { label: 'Damage', value: 'damage' },
        { label: 'Damage Taken', value: 'damageTaken' },
        { label: 'Healing', value: 'healing' },
        { label: 'Wards', value: 'wards' },
        { label: 'Wards Destroyed', value: 'wardsDestroyed' },
        { label: 'Vision Score', value: 'visionScore' },
        { label: 'Champion', value: 'champion' },
        { label: 'Lane Role', value: 'rolePosition' },
        { label: 'Kill Participation %', value: 'kp' },
        { label: 'CS/Min', value: 'csPerMin' },
        { label: 'Gold/Min', value: 'goldPerMin' },
      ];
    } else if (title.includes('overwatch') || title.includes('ow')) {
      gameFields = [
        { label: 'Eliminations', value: 'eliminations' },
        { label: 'Deaths', value: 'deaths' },
        { label: 'Assists', value: 'assists' },
        { label: 'Damage', value: 'damage' },
        { label: 'Damage Mitigated', value: 'damageMitigated' },
        { label: 'Healing', value: 'healing' },
        { label: 'Objective Kills', value: 'objectiveKills' },
        { label: 'Objective Time', value: 'objectiveTime' },
        { label: 'Ultimates', value: 'ults' },
        { label: 'Ultimate Kills', value: 'ultKills' },
        { label: 'Hero', value: 'hero' },
        { label: 'Hero Role', value: 'heroRole' },
        { label: 'Elims/10min', value: 'elimsPer10Min' },
        { label: 'Damage/10min', value: 'damagePer10Min' },
        { label: 'Healing/10min', value: 'healingPer10Min' },
        { label: 'Critical Hits', value: 'criticalHits' },
        { label: 'Accuracy %', value: 'accuracy' },
      ];
    } else if (title.includes('rocket') || title.includes('rl')) {
      gameFields = [
        { label: 'Goals', value: 'goals' },
        { label: 'Assists', value: 'assists' },
        { label: 'Saves', value: 'saves' },
        { label: 'Shots', value: 'shots' },
        { label: 'Shots on Goal', value: 'shotsOnGoal' },
        { label: 'Demos', value: 'demos' },
        { label: 'Epic Saves', value: 'epicSaves' },
        { label: 'Boost Usage', value: 'boostUsage' },
        { label: 'Boost Efficiency %', value: 'boostEfficiency' },
        { label: 'Score', value: 'score' },
        { label: 'MVPs', value: 'mvps' },
        { label: 'Ball Touches', value: 'ballTouches' },
        { label: 'Possession Time', value: 'possessionTime' },
      ];
    } else {
      // Generic fields
      gameFields = [
        { label: 'Score', value: 'score' },
        { label: 'Rank', value: 'rank' },
      ];
    }

    const timestampFields = includeMatchContext
      ? [
          { label: 'Created At', value: 'createdAt' },
          { label: 'Updated At', value: 'updatedAt' },
        ]
      : [];

    return [...baseFields, ...playerFields, ...gameFields, ...timestampFields];
  }
}
