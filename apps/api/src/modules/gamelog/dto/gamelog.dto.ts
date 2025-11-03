import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    Min,
    ValidateNested
} from 'class-validator';
import { z } from 'zod';

// ===== MATCH DTOs =====

export const createMatchSchema = z.object({
    eventId: z.string().cuid().optional(),
    teamId: z.string().cuid(),
    lineupId: z.string().cuid().optional(),
    opponent: z.string().min(1).max(100),
    tournament: z.string().min(1).max(100).optional(),
    stage: z.string().max(50).optional(),
    bestOf: z.number().int().min(1).max(9).default(1),
    startedAt: z.string().datetime().optional(),
    endedAt: z.string().datetime().optional(),
    vodUrl: z.string().url().optional(),
    notes: z.string().max(1000).optional(),
});

export const updateMatchSchema = createMatchSchema.partial().extend({
    status: z.enum(['draft', 'submitted', 'approved']).optional(),
    result: z.enum(['win', 'loss', 'draw', 'forfeit']).optional(),
    score: z.string().max(20).optional(), // e.g., "2-1", "16-14"
});

export const queryMatchesSchema = z.object({
    teamId: z.string().cuid().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    q: z.string().max(200).optional(), // search query
    status: z.enum(['draft', 'submitted', 'approved']).optional(),
    result: z.enum(['win', 'loss', 'draw', 'forfeit']).optional(),
    tournament: z.string().max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class CreateMatchDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    eventId?: string;

    @ApiProperty()
    @IsString()
    teamId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    lineupId?: string;

    @ApiProperty()
    @IsString()
    opponent: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    tournament?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    stage?: string;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(9)
    bestOf?: number = 1;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startedAt?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endedAt?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    vodUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateMatchDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    eventId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    teamId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    lineupId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    opponent?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    tournament?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    stage?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(9)
    bestOf?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startedAt?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endedAt?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(['draft', 'submitted', 'approved'])
    status?: 'draft' | 'submitted' | 'approved';

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(['win', 'loss', 'draw', 'forfeit'])
    result?: 'win' | 'loss' | 'draw' | 'forfeit';

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    score?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    vodUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class QueryMatchesDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    teamId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    to?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(['draft', 'submitted', 'approved'])
    status?: 'draft' | 'submitted' | 'approved';

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(['win', 'loss', 'draw', 'forfeit'])
    result?: 'win' | 'loss' | 'draw' | 'forfeit';

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    tournament?: string;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Transform(({ value }) => parseInt(value))
    page?: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    @Transform(({ value }) => parseInt(value))
    limit?: number = 20;
}

// ===== MAP GAME DTOs =====

export class CreateMapGameDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    mapName?: string;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    gameIdx: number;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    ourScore?: number = 0;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    theirScore?: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    durationSec?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateMapGameDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    mapName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(1)
    gameIdx?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    ourScore?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    theirScore?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    durationSec?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class BulkCreateMapGamesDto {
    @ApiProperty({ type: [CreateMapGameDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMapGameDto)
    maps: CreateMapGameDto[];
}

// ===== PLAYER STATS DTOs =====

export class CreatePlayerStatDto {
    @ApiProperty()
    @IsString()
    playerId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    mapGameId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    role?: string;

    @ApiProperty()
    @IsObject()
    statsJson: Record<string, any>;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    allowExternalPlayers?: boolean = false;
}

export class UpdatePlayerStatDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    playerId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    mapGameId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    role?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    statsJson?: Record<string, any>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    rating?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isMvp?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    allowExternalPlayers?: boolean;
}

export class BulkCreatePlayerStatsDto {
    @ApiProperty({ type: [CreatePlayerStatDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePlayerStatDto)
    stats: CreatePlayerStatDto[];
}

export class ComputeStatsDto {
    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    recomputeRatings?: boolean = true;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    recomputeMvp?: boolean = true;
}

// ===== APPROVAL WORKFLOW DTOs =====

export class SubmitMatchDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class ApproveMatchDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    forceApprove?: boolean = false;
}

export class UnapproveMatchDto {
    @ApiProperty()
    @IsString()
    reason: string;
}

// ===== RESPONSE DTOs =====

export interface MatchResponse {
    id: string;
    tenantId: string;
    eventId?: string;
    teamId: string;
    lineupId?: string;
    opponent: string;
    tournament?: string;
    stage?: string;
    bestOf: number;
    startedAt?: string;
    endedAt?: string;
    status: 'draft' | 'submitted' | 'approved';
    result?: 'win' | 'loss' | 'draw' | 'forfeit';
    score?: string;
    vodUrl?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;

    // Relations
    team?: {
        id: string;
        name: string;
        game: string;
    };
    lineup?: {
        id: string;
        title?: string;
        slots: Array<{
            playerId: string;
            role?: string;
            player: {
                gamerTag: string;
                role?: string;
            };
        }>;
    };
    maps?: MapGameResponse[];
    playerStats?: PlayerStatResponse[];
}

export interface MapGameResponse {
    id: string;
    tenantId: string;
    matchId: string;
    title: string;
    mapName?: string;
    gameIdx: number;
    ourScore: number;
    theirScore: number;
    durationSec?: number;
    notes?: string;
    createdAt: string;

    // Relations
    playerStats?: PlayerStatResponse[];
}

export interface PlayerStatResponse {
    id: string;
    tenantId: string;
    matchId: string;
    mapGameId?: string;
    playerId: string;
    orgUserId?: string;
    lineupId?: string;
    role?: string;
    statsJson: Record<string, any>;
    rating?: number;
    isMvp: boolean;
    createdAt: string;
    updatedAt: string;

    // Relations
    player?: {
        id: string;
        gamerTag: string;
        role?: string;
    };
    mapGame?: {
        id: string;
        title: string;
        mapName?: string;
        gameIdx: number;
    };
}

export interface MatchStatsResponse {
    match: MatchResponse;
    aggregatedStats: {
        totalMaps: number;
        mapsWon: number;
        mapsLost: number;
        averageMapDuration?: number;
        mvpPlayer?: {
            playerId: string;
            gamerTag: string;
            mvpCount: number;
        };
        topPerformers: Array<{
            playerId: string;
            gamerTag: string;
            averageRating: number;
            totalStats: Record<string, number>;
        }>;
    };
}

export interface MatchReportExport {
    match: MatchResponse;
    filePath: string;
    fileSize: number;
    exportedAt: string;
}

// ===== VALIDATION HELPERS =====

export const validateMatchConsistency = (match: Partial<MatchResponse>) => {
    const errors: string[] = [];

    // Check if result matches score
    if (match.result && match.score && match.maps) {
        const mapsWon = match.maps.filter(m => m.ourScore > m.theirScore).length;
        const mapsLost = match.maps.filter(m => m.ourScore < m.theirScore).length;

        switch (match.result) {
            case 'win':
                if (mapsWon <= mapsLost) {
                    errors.push('Result is "win" but maps won does not exceed maps lost');
                }
                break;
            case 'loss':
                if (mapsWon >= mapsLost) {
                    errors.push('Result is "loss" but maps won does not fall short of maps lost');
                }
                break;
        }
    }

    // Check if bestOf matches map count
    if (match.bestOf && match.maps) {
        const maxPossibleMaps = match.bestOf;
        if (match.maps.length > maxPossibleMaps) {
            errors.push(`Cannot have ${match.maps.length} maps in best-of-${match.bestOf} match`);
        }
    }

    return errors;
};