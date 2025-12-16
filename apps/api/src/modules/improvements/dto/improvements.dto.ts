import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsISO8601,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    Min,
    MinLength
} from 'class-validator';
import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export enum ImprovementCategory {
    STREAM_PRODUCTION = 'stream_production',
    BROADCAST_TECHNICAL = 'broadcast_technical',
    EVENT_OPERATIONS = 'event_operations',
    COMMUNICATION = 'communication',
    CONTENT_QUALITY = 'content_quality',
    VIEWER_EXPERIENCE = 'viewer_experience',
    EQUIPMENT = 'equipment',
    PROCESS = 'process',
    SOCIAL_MEDIA = 'social_media',
}

export enum ImprovementPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

export enum ImprovementStatus {
    PROPOSED = 'proposed',
    ACCEPTED = 'accepted',
    IN_PROGRESS = 'in_progress',
    IMPLEMENTED = 'implemented',
    DISMISSED = 'dismissed',
}

export enum ImpactLevel {
    VIEWER_FACING = 'viewer_facing',
    INTERNAL = 'internal',
    MINIMAL = 'minimal',
}

export enum PlatformType {
    TWITTER = 'twitter',
    INSTAGRAM = 'instagram',
    TIKTOK = 'tiktok',
    YOUTUBE = 'youtube',
    FACEBOOK = 'facebook',
    LINKEDIN = 'linkedin',
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const CreateImprovementSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().optional(),
    category: z.enum([
        'stream_production',
        'broadcast_technical',
        'event_operations',
        'communication',
        'content_quality',
        'viewer_experience',
        'equipment',
        'process',
        'social_media',
    ]),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    eventId: z.string().optional(),
    matchId: z.string().optional(),
    vodUrl: z.string().url().optional(),
    vodTimestamp: z.string().optional(),
    screenshotUrl: z.string().url().optional(),
    whatWentWrong: z.string().optional(),
    rootCause: z.string().optional(),
    proposedSolution: z.string().optional(),
    platformType: z
        .enum(['twitter', 'instagram', 'tiktok', 'youtube', 'facebook', 'linkedin'])
        .optional(),
    postUrl: z.string().url().optional(),
    engagementMetrics: z.string().optional(),
    assignedTo: z.string().optional(),
    tags: z.string().optional(),
    impactLevel: z.enum(['viewer_facing', 'internal', 'minimal']).optional(),
    occurredAt: z.string().optional(),
});

export const UpdateImprovementSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().optional(),
    category: z
        .enum([
            'stream_production',
            'broadcast_technical',
            'event_operations',
            'communication',
            'content_quality',
            'viewer_experience',
            'equipment',
            'process',
            'social_media',
        ])
        .optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['proposed', 'accepted', 'in_progress', 'implemented', 'dismissed']).optional(),
    eventId: z.string().optional(),
    matchId: z.string().optional(),
    vodUrl: z.string().url().optional(),
    vodTimestamp: z.string().optional(),
    screenshotUrl: z.string().url().optional(),
    whatWentWrong: z.string().optional(),
    rootCause: z.string().optional(),
    proposedSolution: z.string().optional(),
    actualSolution: z.string().optional(),
    preventionSteps: z.string().optional(),
    platformType: z
        .enum(['twitter', 'instagram', 'tiktok', 'youtube', 'facebook', 'linkedin'])
        .optional(),
    postUrl: z.string().url().optional(),
    engagementMetrics: z.string().optional(),
    assignedTo: z.string().optional(),
    implementedBy: z.string().optional(),
    tags: z.string().optional(),
    impactLevel: z.enum(['viewer_facing', 'internal', 'minimal']).optional(),
    occurredAt: z.string().optional(),
    implementedAt: z.string().optional(),
});

export const QueryImprovementsSchema = z.object({
    q: z.string().optional(),
    category: z
        .enum([
            'stream_production',
            'broadcast_technical',
            'event_operations',
            'communication',
            'content_quality',
            'viewer_experience',
            'equipment',
            'process',
            'social_media',
        ])
        .optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['proposed', 'accepted', 'in_progress', 'implemented', 'dismissed']).optional(),
    impactLevel: z.enum(['viewer_facing', 'internal', 'minimal']).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    eventId: z.string().optional(),
    matchId: z.string().optional(),
    reportedBy: z.string().optional(),
    assignedTo: z.string().optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
});

// ============================================================================
// DTOs
// ============================================================================

export class CreateImprovementDto {
    @ApiProperty({
        description: 'Title of the improvement entry',
        minLength: 3,
        maxLength: 200,
        example: 'Audio desync during stream',
    })
    @IsString()
    @MinLength(3)
    @MaxLength(200)
    title!: string;

    @ApiPropertyOptional({
        description: 'Detailed description',
        example: 'Audio was out of sync with video for approximately 5 minutes',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Category of the improvement',
        enum: ImprovementCategory,
        example: ImprovementCategory.STREAM_PRODUCTION,
    })
    @IsEnum(ImprovementCategory)
    category!: ImprovementCategory;

    @ApiPropertyOptional({
        description: 'Priority level',
        enum: ImprovementPriority,
        default: ImprovementPriority.MEDIUM,
    })
    @IsOptional()
    @IsEnum(ImprovementPriority)
    priority?: ImprovementPriority;

    @ApiPropertyOptional({
        description: 'Related event ID',
        example: 'cm123abc',
    })
    @IsOptional()
    @IsString()
    eventId?: string;

    @ApiPropertyOptional({
        description: 'Related match ID',
        example: 'cm456def',
    })
    @IsOptional()
    @IsString()
    matchId?: string;

    @ApiPropertyOptional({
        description: 'VOD URL',
        example: 'https://twitch.tv/videos/123456',
    })
    @IsOptional()
    @IsUrl()
    vodUrl?: string;

    @ApiPropertyOptional({
        description: 'VOD timestamp (format: HH:MM:SS or seconds)',
        example: '1:23:45',
    })
    @IsOptional()
    @IsString()
    vodTimestamp?: string;

    @ApiPropertyOptional({
        description: 'Screenshot URL',
    })
    @IsOptional()
    @IsUrl()
    screenshotUrl?: string;

    @ApiPropertyOptional({
        description: 'What went wrong',
    })
    @IsOptional()
    @IsString()
    whatWentWrong?: string;

    @ApiPropertyOptional({
        description: 'Root cause analysis',
    })
    @IsOptional()
    @IsString()
    rootCause?: string;

    @ApiPropertyOptional({
        description: 'Proposed solution',
    })
    @IsOptional()
    @IsString()
    proposedSolution?: string;

    @ApiPropertyOptional({
        description: 'Social media platform',
        enum: PlatformType,
    })
    @IsOptional()
    @IsEnum(PlatformType)
    platformType?: PlatformType;

    @ApiPropertyOptional({
        description: 'Social media post URL',
    })
    @IsOptional()
    @IsUrl()
    postUrl?: string;

    @ApiPropertyOptional({
        description: 'Engagement metrics (JSON string)',
        example: '{"views": 1000, "likes": 50, "shares": 10}',
    })
    @IsOptional()
    @IsString()
    engagementMetrics?: string;

    @ApiPropertyOptional({
        description: 'Assign to user ID',
    })
    @IsOptional()
    @IsString()
    assignedTo?: string;

    @ApiPropertyOptional({
        description: 'Tags (comma-separated)',
        example: 'obs,audio,urgent',
    })
    @IsOptional()
    @IsString()
    tags?: string;

    @ApiPropertyOptional({
        description: 'Impact level',
        enum: ImpactLevel,
    })
    @IsOptional()
    @IsEnum(ImpactLevel)
    impactLevel?: ImpactLevel;

    @ApiPropertyOptional({
        description: 'When the issue occurred (ISO8601)',
        example: '2025-12-15T14:30:00Z',
    })
    @IsOptional()
    @IsISO8601()
    occurredAt?: string;
}

export class UpdateImprovementDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(200)
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ enum: ImprovementCategory })
    @IsOptional()
    @IsEnum(ImprovementCategory)
    category?: ImprovementCategory;

    @ApiPropertyOptional({ enum: ImprovementPriority })
    @IsOptional()
    @IsEnum(ImprovementPriority)
    priority?: ImprovementPriority;

    @ApiPropertyOptional({ enum: ImprovementStatus })
    @IsOptional()
    @IsEnum(ImprovementStatus)
    status?: ImprovementStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    eventId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    matchId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    vodUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    vodTimestamp?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    screenshotUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    whatWentWrong?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    rootCause?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    proposedSolution?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    actualSolution?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    preventionSteps?: string;

    @ApiPropertyOptional({ enum: PlatformType })
    @IsOptional()
    @IsEnum(PlatformType)
    platformType?: PlatformType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    postUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    engagementMetrics?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    assignedTo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    implementedBy?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    tags?: string;

    @ApiPropertyOptional({ enum: ImpactLevel })
    @IsOptional()
    @IsEnum(ImpactLevel)
    impactLevel?: ImpactLevel;

    @ApiPropertyOptional()
    @IsOptional()
    @IsISO8601()
    occurredAt?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsISO8601()
    implementedAt?: string;
}

export class QueryImprovementsDto {
    @ApiPropertyOptional({ description: 'Search query' })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({ enum: ImprovementCategory })
    @IsOptional()
    @IsEnum(ImprovementCategory)
    category?: ImprovementCategory;

    @ApiPropertyOptional({ enum: ImprovementPriority })
    @IsOptional()
    @IsEnum(ImprovementPriority)
    priority?: ImprovementPriority;

    @ApiPropertyOptional({ enum: ImprovementStatus })
    @IsOptional()
    @IsEnum(ImprovementStatus)
    status?: ImprovementStatus;

    @ApiPropertyOptional({ enum: ImpactLevel })
    @IsOptional()
    @IsEnum(ImpactLevel)
    impactLevel?: ImpactLevel;

    @ApiPropertyOptional({ description: 'Filter from date (ISO8601)' })
    @IsOptional()
    @IsISO8601()
    from?: string;

    @ApiPropertyOptional({ description: 'Filter to date (ISO8601)' })
    @IsOptional()
    @IsISO8601()
    to?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    eventId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    matchId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    reportedBy?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    assignedTo?: string;

    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    @Min(1)
    limit?: number = 20;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

export class ImprovementResponse {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    tenantId!: string;

    @ApiProperty()
    title!: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiProperty({ enum: ImprovementCategory })
    category!: string;

    @ApiProperty({ enum: ImprovementPriority })
    priority!: string;

    @ApiProperty({ enum: ImprovementStatus })
    status!: string;

    @ApiPropertyOptional()
    eventId?: string;

    @ApiPropertyOptional()
    matchId?: string;

    @ApiPropertyOptional()
    vodUrl?: string;

    @ApiPropertyOptional()
    vodTimestamp?: string;

    @ApiPropertyOptional()
    screenshotUrl?: string;

    @ApiPropertyOptional()
    whatWentWrong?: string;

    @ApiPropertyOptional()
    rootCause?: string;

    @ApiPropertyOptional()
    proposedSolution?: string;

    @ApiPropertyOptional()
    actualSolution?: string;

    @ApiPropertyOptional()
    preventionSteps?: string;

    @ApiPropertyOptional()
    platformType?: string;

    @ApiPropertyOptional()
    postUrl?: string;

    @ApiPropertyOptional()
    engagementMetrics?: string;

    @ApiProperty()
    reportedBy!: string;

    @ApiPropertyOptional()
    assignedTo?: string;

    @ApiPropertyOptional()
    implementedBy?: string;

    @ApiPropertyOptional()
    tags?: string;

    @ApiPropertyOptional()
    impactLevel?: string;

    @ApiPropertyOptional()
    occurredAt?: string;

    @ApiPropertyOptional()
    implementedAt?: string;

    @ApiProperty()
    createdAt!: string;

    @ApiProperty()
    updatedAt!: string;

    @ApiPropertyOptional()
    event?: {
        id: string;
        title: string;
        startAt: string;
    };

    @ApiPropertyOptional()
    match?: {
        id: string;
        opponent: string;
        startedAt?: string;
    };

    @ApiPropertyOptional()
    reporter?: {
        id: string;
        displayName: string;
        email: string;
    };

    @ApiPropertyOptional()
    assignee?: {
        id: string;
        displayName: string;
        email: string;
    };

    @ApiPropertyOptional()
    implementer?: {
        id: string;
        displayName: string;
        email: string;
    };
}
