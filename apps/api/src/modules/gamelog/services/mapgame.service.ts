import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../../../common/audit/audit.service';
import { PrismaService } from '../../../database/prisma.service';
import {
  BulkCreateMapGamesDto,
  CreateMapGameDto,
  MapGameResponse,
  UpdateMapGameDto,
} from '../dto/gamelog.dto';

@Injectable()
export class MapGameService {
  constructor(
    private prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async createMapGame(
    tenantId: string,
    matchId: string,
    dto: CreateMapGameDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<MapGameResponse> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      // Verify match exists and is editable
      const match = await tx.match.findFirst({
        where: { id: matchId, tenantId },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      if (match.status === 'approved') {
        throw new ForbiddenException('Cannot add maps to approved match');
      }

      // Check if gameIdx already exists
      const existing = await tx.mapGame.findFirst({
        where: { matchId, tenantId, gameIdx: dto.gameIdx },
      });

      if (existing) {
        throw new BadRequestException(`Map with gameIdx ${dto.gameIdx} already exists`);
      }

      // Validate gameIdx is sequential (no gaps)
      if (dto.gameIdx > 1) {
        const previousExists = await tx.mapGame.findFirst({
          where: { matchId, tenantId, gameIdx: dto.gameIdx - 1 },
        });

        if (!previousExists) {
          throw new BadRequestException(
            `gameIdx must be sequential. Expected ${dto.gameIdx - 1} before ${dto.gameIdx}`
          );
        }
      }

      // Check bestOf limit
      if (dto.gameIdx > match.bestOf) {
        throw new BadRequestException(`Cannot exceed best-of-${match.bestOf} limit`);
      }

      const mapGame = await tx.mapGame.create({
        data: {
          tenantId,
          matchId,
          title: dto.title,
          mapName: dto.mapName,
          gameIdx: dto.gameIdx,
          ourScore: dto.ourScore || 0,
          theirScore: dto.theirScore || 0,
          durationSec: dto.durationSec,
          notes: dto.notes,
        },
      });

      const formatted = this.formatMapGameResponse(mapGame);

      await this.auditService.log({
        tenantId,
        action: 'gamelog.clip.add',
        entity: 'gamelog',
        entityType: 'ORG_USER',
        entityId: mapGame.id,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Added map/clip to gamelog entry',
        metadata: {
          matchId,
          title: dto.title,
          mapName: dto.mapName,
          gameIdx: dto.gameIdx,
          actorEmail,
        },
      });

      return formatted;
    });
  }

  async bulkCreateMapGames(
    tenantId: string,
    matchId: string,
    dto: BulkCreateMapGamesDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<MapGameResponse[]> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      // Verify match exists and is editable
      const match = await tx.match.findFirst({
        where: { id: matchId, tenantId },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      if (match.status === 'approved') {
        throw new ForbiddenException('Cannot add maps to approved match');
      }

      // Validate all gameIdx values are unique and sequential
      const gameIndexes = dto.maps.map(m => m.gameIdx).sort((a, b) => a - b);

      // Check for duplicates
      const uniqueIndexes = [...new Set(gameIndexes)];
      if (uniqueIndexes.length !== gameIndexes.length) {
        throw new BadRequestException('Duplicate gameIdx values found');
      }

      // Check for gaps
      for (let i = 0; i < uniqueIndexes.length; i++) {
        if (uniqueIndexes[i] !== i + 1) {
          throw new BadRequestException('gameIdx values must be sequential starting from 1');
        }
      }

      // Check bestOf limit
      if (Math.max(...gameIndexes) > match.bestOf) {
        throw new BadRequestException(`Cannot exceed best-of-${match.bestOf} limit`);
      }

      // Delete existing maps (bulk replace)
      await tx.mapGame.deleteMany({
        where: { matchId, tenantId },
      });

      // Create all maps
      const results = await Promise.all(
        dto.maps.map(mapDto =>
          tx.mapGame.create({
            data: {
              tenantId,
              matchId,
              title: mapDto.title,
              mapName: mapDto.mapName,
              gameIdx: mapDto.gameIdx,
              ourScore: mapDto.ourScore || 0,
              theirScore: mapDto.theirScore || 0,
              durationSec: mapDto.durationSec,
              notes: mapDto.notes,
            },
          })
        )
      );

      const formatted = results.map(mapGame => this.formatMapGameResponse(mapGame));

      await this.auditService.log({
        tenantId,
        action: 'gamelog.clip.add',
        entity: 'gamelog',
        entityType: 'ORG_USER',
        entityId: matchId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Bulk created/replaced maps for gamelog entry',
        metadata: {
          matchId,
          mapCount: results.length,
          gameIdxs: gameIndexes,
          actorEmail,
        },
      });

      return formatted;
    });
  }

  async findMapsByMatch(tenantId: string, matchId: string): Promise<MapGameResponse[]> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      const maps = await tx.mapGame.findMany({
        where: { matchId, tenantId },
        orderBy: { gameIdx: 'asc' },
        include: {
          playerStats: {
            include: {
              player: true,
            },
          },
        },
      });

      return maps.map(mapGame => this.formatMapGameResponse(mapGame));
    });
  }

  async findMapById(tenantId: string, mapId: string): Promise<MapGameResponse> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      const mapGame = await tx.mapGame.findFirst({
        where: { id: mapId, tenantId },
        include: {
          match: true,
          playerStats: {
            include: {
              player: true,
            },
          },
        },
      });

      if (!mapGame) {
        throw new NotFoundException('Map not found');
      }

      return this.formatMapGameResponse(mapGame);
    });
  }

  async updateMapGame(
    tenantId: string,
    mapId: string,
    dto: UpdateMapGameDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<MapGameResponse> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      const mapGame = await tx.mapGame.findFirst({
        where: { id: mapId, tenantId },
        include: { match: true },
      });

      if (!mapGame) {
        throw new NotFoundException('Map not found');
      }

      if (mapGame.match.status === 'approved') {
        throw new ForbiddenException('Cannot edit map in approved match');
      }

      // If gameIdx is being changed, validate sequencing
      if (dto.gameIdx && dto.gameIdx !== mapGame.gameIdx) {
        // Check if new gameIdx is already taken by another map
        const existing = await tx.mapGame.findFirst({
          where: {
            matchId: mapGame.matchId,
            tenantId,
            gameIdx: dto.gameIdx,
            id: { not: mapId }, // exclude current map
          },
        });

        if (existing) {
          throw new BadRequestException(`gameIdx ${dto.gameIdx} is already taken`);
        }

        // Check bestOf limit
        if (dto.gameIdx > mapGame.match.bestOf) {
          throw new BadRequestException(`Cannot exceed best-of-${mapGame.match.bestOf} limit`);
        }
      }

      const updatedMapGame = await tx.mapGame.update({
        where: { id: mapId },
        data: {
          title: dto.title,
          mapName: dto.mapName,
          gameIdx: dto.gameIdx,
          ourScore: dto.ourScore,
          theirScore: dto.theirScore,
          durationSec: dto.durationSec,
          notes: dto.notes,
        },
      });

      const formatted = this.formatMapGameResponse(updatedMapGame);

      await this.auditService.log({
        tenantId,
        action: 'gamelog.clip.update',
        entity: 'gamelog',
        entityType: 'ORG_USER',
        entityId: mapId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Updated map/clip on gamelog entry',
        metadata: {
          matchId: mapGame.matchId,
          changes: dto,
          actorEmail,
        },
      });

      return formatted;
    });
  }

  async deleteMapGame(
    tenantId: string,
    mapId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ): Promise<void> {
    await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      const mapGame = await tx.mapGame.findFirst({
        where: { id: mapId, tenantId },
        include: { match: true },
      });

      if (!mapGame) {
        throw new NotFoundException('Map not found');
      }

      if (mapGame.match.status === 'approved') {
        throw new ForbiddenException('Cannot delete map from approved match');
      }

      await tx.mapGame.delete({
        where: { id: mapId },
      });

      // Resequence remaining maps to maintain continuity
      const remainingMaps = await tx.mapGame.findMany({
        where: { matchId: mapGame.matchId, tenantId },
        orderBy: { gameIdx: 'asc' },
      });

      // Update gameIdx to maintain sequence
      const updatePromises = remainingMaps.map((map, index) =>
        tx.mapGame.update({
          where: { id: map.id },
          data: { gameIdx: index + 1 },
        })
      );

      await Promise.all(updatePromises);

      await this.auditService.log({
        tenantId,
        action: 'gamelog.clip.remove',
        entity: 'gamelog',
        entityType: 'ORG_USER',
        entityId: mapId,
        orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
        description: 'Removed map/clip from gamelog entry',
        metadata: {
          matchId: mapGame.matchId,
          mapName: mapGame.mapName,
          gameIdx: mapGame.gameIdx,
          actorEmail,
        },
      });
    });
  }

  private formatMapGameResponse(mapGame: any): MapGameResponse {
    return {
      id: mapGame.id,
      tenantId: mapGame.tenantId,
      matchId: mapGame.matchId,
      title: mapGame.title,
      mapName: mapGame.mapName,
      gameIdx: mapGame.gameIdx,
      ourScore: mapGame.ourScore,
      theirScore: mapGame.theirScore,
      durationSec: mapGame.durationSec,
      notes: mapGame.notes,
      createdAt: mapGame.createdAt.toISOString(),
      playerStats: mapGame.playerStats?.map((stat: any) => ({
        id: stat.id,
        playerId: stat.playerId,
        role: stat.role,
        statsJson: stat.statsJson,
        rating: stat.rating,
        isMvp: stat.isMvp,
        player: stat.player
          ? {
              id: stat.player.id,
              gamerTag: stat.player.gamerTag,
              role: stat.player.role,
            }
          : undefined,
      })),
    };
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
