import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { BulkCreateMapGamesDto, CreateMapGameDto, MapGameResponse, UpdateMapGameDto } from '../dto/gamelog.dto';

@Injectable()
export class MapGameService {
    constructor(private prisma: PrismaService) { }

    async createMapGame(tenantId: string, matchId: string, dto: CreateMapGameDto): Promise<MapGameResponse> {
        // Verify match exists and is editable
        const match = await this.prisma.match.findFirst({
            where: { id: matchId, tenantId }
        });

        if (!match) {
            throw new NotFoundException('Match not found');
        }

        if (match.status === 'approved') {
            throw new ForbiddenException('Cannot add maps to approved match');
        }

        // Check if gameIdx already exists
        const existing = await this.prisma.mapGame.findFirst({
            where: { matchId, tenantId, gameIdx: dto.gameIdx }
        });

        if (existing) {
            throw new BadRequestException(`Map with gameIdx ${dto.gameIdx} already exists`);
        }

        // Validate gameIdx is sequential (no gaps)
        if (dto.gameIdx > 1) {
            const previousExists = await this.prisma.mapGame.findFirst({
                where: { matchId, tenantId, gameIdx: dto.gameIdx - 1 }
            });

            if (!previousExists) {
                throw new BadRequestException(`gameIdx must be sequential. Expected ${dto.gameIdx - 1} before ${dto.gameIdx}`);
            }
        }

        // Check bestOf limit
        if (dto.gameIdx > match.bestOf) {
            throw new BadRequestException(`Cannot exceed best-of-${match.bestOf} limit`);
        }

        const mapGame = await this.prisma.mapGame.create({
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
            }
        });

        return this.formatMapGameResponse(mapGame);
    }

    async bulkCreateMapGames(tenantId: string, matchId: string, dto: BulkCreateMapGamesDto): Promise<MapGameResponse[]> {
        // Verify match exists and is editable
        const match = await this.prisma.match.findFirst({
            where: { id: matchId, tenantId }
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
        await this.prisma.mapGame.deleteMany({
            where: { matchId, tenantId }
        });

        // Create all maps in transaction
        const results = await this.prisma.$transaction(
            dto.maps.map(mapDto =>
                this.prisma.mapGame.create({
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
                    }
                })
            )
        );

        return results.map(mapGame => this.formatMapGameResponse(mapGame));
    }

    async findMapsByMatch(tenantId: string, matchId: string): Promise<MapGameResponse[]> {
        const maps = await this.prisma.mapGame.findMany({
            where: { matchId, tenantId },
            orderBy: { gameIdx: 'asc' },
            include: {
                playerStats: {
                    include: {
                        player: true
                    }
                }
            }
        });

        return maps.map(mapGame => this.formatMapGameResponse(mapGame));
    }

    async findMapById(tenantId: string, mapId: string): Promise<MapGameResponse> {
        const mapGame = await this.prisma.mapGame.findFirst({
            where: { id: mapId, tenantId },
            include: {
                match: true,
                playerStats: {
                    include: {
                        player: true
                    }
                }
            }
        });

        if (!mapGame) {
            throw new NotFoundException('Map not found');
        }

        return this.formatMapGameResponse(mapGame);
    }

    async updateMapGame(tenantId: string, mapId: string, dto: UpdateMapGameDto): Promise<MapGameResponse> {
        const mapGame = await this.prisma.mapGame.findFirst({
            where: { id: mapId, tenantId },
            include: { match: true }
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
            const existing = await this.prisma.mapGame.findFirst({
                where: {
                    matchId: mapGame.matchId,
                    tenantId,
                    gameIdx: dto.gameIdx,
                    id: { not: mapId } // exclude current map
                }
            });

            if (existing) {
                throw new BadRequestException(`gameIdx ${dto.gameIdx} is already taken`);
            }

            // Check bestOf limit
            if (dto.gameIdx > mapGame.match.bestOf) {
                throw new BadRequestException(`Cannot exceed best-of-${mapGame.match.bestOf} limit`);
            }
        }

        const updatedMapGame = await this.prisma.mapGame.update({
            where: { id: mapId },
            data: {
                title: dto.title,
                mapName: dto.mapName,
                gameIdx: dto.gameIdx,
                ourScore: dto.ourScore,
                theirScore: dto.theirScore,
                durationSec: dto.durationSec,
                notes: dto.notes,
            }
        });

        return this.formatMapGameResponse(updatedMapGame);
    }

    async deleteMapGame(tenantId: string, mapId: string): Promise<void> {
        const mapGame = await this.prisma.mapGame.findFirst({
            where: { id: mapId, tenantId },
            include: { match: true }
        });

        if (!mapGame) {
            throw new NotFoundException('Map not found');
        }

        if (mapGame.match.status === 'approved') {
            throw new ForbiddenException('Cannot delete map from approved match');
        }

        await this.prisma.mapGame.delete({
            where: { id: mapId }
        });

        // Resequence remaining maps to maintain continuity
        const remainingMaps = await this.prisma.mapGame.findMany({
            where: { matchId: mapGame.matchId, tenantId },
            orderBy: { gameIdx: 'asc' }
        });

        // Update gameIdx to maintain sequence
        const updatePromises = remainingMaps.map((map, index) =>
            this.prisma.mapGame.update({
                where: { id: map.id },
                data: { gameIdx: index + 1 }
            })
        );

        await Promise.all(updatePromises);
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
                player: stat.player ? {
                    id: stat.player.id,
                    gamerTag: stat.player.gamerTag,
                    role: stat.player.role
                } : undefined
            }))
        };
    }
}