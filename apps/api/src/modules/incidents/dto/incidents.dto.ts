import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsISO8601,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
    ValidateNested
} from 'class-validator';
import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export enum IncidentCategory {
    TECH = 'tech',
    COMMS = 'comms',
    PEOPLE = 'people',
    SAFETY = 'safety',
    OTHER = 'other'
}

export enum IncidentSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum IncidentStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    DISMISSED = 'dismissed'
}

export enum AttendanceStatus {
    PRESENT = 'present',
    LATE = 'late',
    NO_SHOW = 'no_show',
    REMOTE = 'remote'
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const createIncidentSchema = z.object({
    eventId: z.string().optional(),
    category: z.enum(['tech', 'comms', 'people', 'safety', 'other']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    ownerId: z.string().optional(),
    tags: z.string().optional(),
});

export const updateIncidentSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    ownerId: z.string().optional(),
    status: z.enum(['open', 'in_progress', 'resolved', 'dismissed']).optional(),
    tags: z.string().optional(),
    rcaJson: z.any().optional(), // JSON object
});

export const queryIncidentsSchema = z.object({
    q: z.string().optional(),
    category: z.enum(['tech', 'comms', 'people', 'safety', 'other']).optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    status: z.enum(['open', 'in_progress', 'resolved', 'dismissed']).optional(),
    from: z.string().optional(), // ISO8601 date
    to: z.string().optional(), // ISO8601 date
    eventId: z.string().optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
});

// ============================================================================
// INCIDENT DTOs
// ============================================================================

export class CreateIncidentDto {
    @ApiPropertyOptional({
        description: 'Event ID to link incident to',
        format: 'cuid'
    })
    @IsOptional()
    @IsString()
    eventId?: string;

    @ApiProperty({
        description: 'Incident category',
        enum: IncidentCategory,
        example: IncidentCategory.TECH
    })
    @IsEnum(IncidentCategory)
    category: IncidentCategory;

    @ApiProperty({
        description: 'Incident severity',
        enum: IncidentSeverity,
        example: IncidentSeverity.MEDIUM
    })
    @IsEnum(IncidentSeverity)
    severity: IncidentSeverity;

    @ApiProperty({
        description: 'Incident title',
        example: 'Audio equipment malfunction during stream'
    })
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    title: string;

    @ApiPropertyOptional({
        description: 'Detailed description of the incident',
        example: 'The wireless headset lost connection during the match, causing communication issues between players.'
    })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional({
        description: 'User ID to assign as incident owner',
        format: 'cuid'
    })
    @IsOptional()
    @IsString()
    ownerId?: string;

    @ApiPropertyOptional({
        description: 'Comma-separated tags or JSON string',
        example: 'audio,equipment,urgent'
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    tags?: string;
}

export class UpdateIncidentDto {
    @ApiPropertyOptional({
        description: 'Updated incident title'
    })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    title?: string;

    @ApiPropertyOptional({
        description: 'Updated incident description'
    })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional({
        description: 'Updated owner ID',
        format: 'cuid'
    })
    @IsOptional()
    @IsString()
    ownerId?: string;

    @ApiPropertyOptional({
        description: 'Updated incident status',
        enum: IncidentStatus
    })
    @IsOptional()
    @IsEnum(IncidentStatus)
    status?: IncidentStatus;

    @ApiPropertyOptional({
        description: 'Updated tags'
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    tags?: string;

    @ApiPropertyOptional({
        description: 'Root cause analysis and corrective actions as JSON',
        example: { rootCause: 'Battery depleted', actions: ['Replace battery', 'Add battery check to pre-event checklist'] }
    })
    @IsOptional()
    rcaJson?: any;
}

export class QueryIncidentsDto {
    @ApiPropertyOptional({
        description: 'Search query for title/description',
        example: 'audio'
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    q?: string;

    @ApiPropertyOptional({
        description: 'Filter by category',
        enum: IncidentCategory
    })
    @IsOptional()
    @IsEnum(IncidentCategory)
    category?: IncidentCategory;

    @ApiPropertyOptional({
        description: 'Filter by severity',
        enum: IncidentSeverity
    })
    @IsOptional()
    @IsEnum(IncidentSeverity)
    severity?: IncidentSeverity;

    @ApiPropertyOptional({
        description: 'Filter by status',
        enum: IncidentStatus
    })
    @IsOptional()
    @IsEnum(IncidentStatus)
    status?: IncidentStatus;

    @ApiPropertyOptional({
        description: 'Filter incidents from this date (ISO8601)',
        example: '2025-01-01'
    })
    @IsOptional()
    @IsISO8601({ strict: true })
    from?: string;

    @ApiPropertyOptional({
        description: 'Filter incidents to this date (ISO8601)',
        example: '2025-12-31'
    })
    @IsOptional()
    @IsISO8601({ strict: true })
    to?: string;

    @ApiPropertyOptional({
        description: 'Filter by event ID',
        format: 'cuid'
    })
    @IsOptional()
    @IsString()
    eventId?: string;

    @ApiPropertyOptional({
        description: 'Page number for pagination',
        default: 1,
        minimum: 1
    })
    @IsOptional()
    @Type(() => Number)
    @Transform(({ value }) => parseInt(value, 10))
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Items per page',
        default: 20,
        minimum: 1,
        maximum: 100
    })
    @IsOptional()
    @Type(() => Number)
    @Transform(({ value }) => parseInt(value, 10))
    limit?: number = 20;
}

// ============================================================================
// ATTENDANCE DTOs
// ============================================================================

export class AttendanceRecordDto {
    @ApiProperty({
        description: 'Event ID',
        format: 'uuid'
    })
    @IsUUID()
    eventId: string;

    @ApiProperty({
        description: 'Organization user ID',
        format: 'uuid'
    })
    @IsUUID()
    orgUserId: string;

    @ApiProperty({
        description: 'Attendance status',
        enum: AttendanceStatus,
        example: AttendanceStatus.PRESENT
    })
    @IsEnum(AttendanceStatus)
    status: AttendanceStatus;

    @ApiPropertyOptional({
        description: 'Role of the person at the event',
        example: 'player'
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    role?: string;

    @ApiPropertyOptional({
        description: 'Additional notes about attendance',
        example: 'Arrived 10 minutes late due to traffic'
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    note?: string;
}

// ============================================================================
// ATTENDANCE CRUD DTOS
// ============================================================================

export class CreateAttendanceDto {
    @ApiProperty({
        description: 'Event ID',
        example: 'cld0...'
    })
    @IsUUID()
    eventId: string;

    @ApiProperty({
        description: 'User ID',
        example: 'cld0...'
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'Attendance status',
        enum: AttendanceStatus,
        example: AttendanceStatus.PRESENT
    })
    @IsEnum(AttendanceStatus)
    status: AttendanceStatus;

    @ApiPropertyOptional({
        description: 'Additional notes',
        example: 'Arrived 10 minutes early',
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}

export class UpdateAttendanceDto {
    @ApiPropertyOptional({
        description: 'Attendance status',
        enum: AttendanceStatus,
        example: AttendanceStatus.LATE
    })
    @IsOptional()
    @IsEnum(AttendanceStatus)
    status?: AttendanceStatus;

    @ApiPropertyOptional({
        description: 'Additional notes',
        example: 'Traffic delay',
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}

export class BulkCreateAttendanceDto {
    @ApiProperty({
        description: 'Event ID for all attendance records',
        example: 'cld0...'
    })
    @IsUUID()
    eventId: string;

    @ApiProperty({
        description: 'Array of attendance records to create',
        type: [AttendanceRecordDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttendanceRecordDto)
    attendances: AttendanceRecordDto[];
}

export class QueryAttendanceDto {
    @ApiPropertyOptional({
        description: 'Page number',
        example: 1,
        minimum: 1
    })
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Items per page',
        example: 20,
        minimum: 1,
        maximum: 100
    })
    @IsOptional()
    @Type(() => Number)
    limit?: number = 20;

    @ApiPropertyOptional({
        description: 'Filter by event ID',
        format: 'uuid'
    })
    @IsOptional()
    @IsUUID()
    eventId?: string;

    @ApiPropertyOptional({
        description: 'Filter by user ID',
        format: 'uuid'
    })
    @IsOptional()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional({
        description: 'Filter by attendance status',
        enum: AttendanceStatus
    })
    @IsOptional()
    @IsEnum(AttendanceStatus)
    status?: AttendanceStatus;

    @ApiPropertyOptional({
        description: 'Filter attendance from this date (ISO8601)',
        example: '2025-01-01'
    })
    @IsOptional()
    @IsISO8601({ strict: true })
    from?: string;

    @ApiPropertyOptional({
        description: 'Filter attendance to this date (ISO8601)',
        example: '2025-12-31'
    })
    @IsOptional()
    @IsISO8601({ strict: true })
    to?: string;
}

// ============================================================================
// REPORTS DTOs
// ============================================================================

export class QueryReportsDto {
    @ApiPropertyOptional({
        description: 'Report start date (ISO8601)',
        example: '2025-01-01'
    })
    @IsOptional()
    @IsISO8601({ strict: true })
    from?: string;

    @ApiPropertyOptional({
        description: 'Report end date (ISO8601)',
        example: '2025-12-31'
    })
    @IsOptional()
    @IsISO8601({ strict: true })
    to?: string;

    @ApiPropertyOptional({
        description: 'Filter by specific event ID',
        format: 'uuid'
    })
    @IsOptional()
    @IsUUID()
    eventId?: string;

    @ApiPropertyOptional({
        description: 'Filter by category (for incidents report)',
        enum: IncidentCategory
    })
    @IsOptional()
    @IsEnum(IncidentCategory)
    category?: IncidentCategory;

    @ApiPropertyOptional({
        description: 'Filter by severity (for incidents report)',
        enum: IncidentSeverity
    })
    @IsOptional()
    @IsEnum(IncidentSeverity)
    severity?: IncidentSeverity;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

export class IncidentResponse {
    @ApiProperty()
    id: string;

    @ApiProperty()
    tenantId: string;

    @ApiPropertyOptional()
    eventId?: string;

    @ApiProperty({ enum: IncidentCategory })
    category: IncidentCategory;

    @ApiProperty({ enum: IncidentSeverity })
    severity: IncidentSeverity;

    @ApiProperty()
    title: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiPropertyOptional()
    ownerId?: string;

    @ApiProperty({ enum: IncidentStatus })
    status: IncidentStatus;

    @ApiPropertyOptional()
    tags?: string;

    @ApiProperty()
    createdBy: string;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    updatedAt: string;

    @ApiPropertyOptional()
    rcaJson?: any;

    // Relations
    @ApiPropertyOptional()
    event?: any;

    @ApiPropertyOptional()
    owner?: any;

    @ApiPropertyOptional()
    createdByUser?: any;
}

export class AttendanceResponse {
    @ApiProperty()
    id: string;

    @ApiProperty()
    tenantId: string;

    @ApiProperty()
    eventId: string;

    @ApiProperty()
    orgUserId: string;

    @ApiPropertyOptional()
    role?: string;

    @ApiProperty({ enum: AttendanceStatus })
    status: AttendanceStatus;

    @ApiPropertyOptional()
    note?: string;

    @ApiProperty()
    createdAt: string;

    // Relations
    @ApiPropertyOptional()
    event?: any;

    @ApiPropertyOptional()
    orgUser?: any;
}

export class AttendanceReportResponse {
    @ApiProperty()
    totalRecords: number;

    @ApiProperty()
    byStatus: Record<AttendanceStatus, number>;

    @ApiProperty()
    byRole: Record<string, number>;

    @ApiProperty()
    dateRange: {
        from: string;
        to: string;
    };
}

export class IncidentReportResponse {
    @ApiProperty()
    totalIncidents: number;

    @ApiProperty()
    byCategory: Record<IncidentCategory, number>;

    @ApiProperty()
    bySeverity: Record<IncidentSeverity, number>;

    @ApiProperty()
    byStatus: Record<IncidentStatus, number>;

    @ApiProperty()
    topTags: Array<{ tag: string; count: number }>;

    @ApiProperty()
    dateRange: {
        from: string;
        to: string;
    };
}

export class ChecklistReportResponse {
    @ApiProperty()
    templateTitle: string;

    @ApiProperty()
    totalRuns: number;

    @ApiProperty()
    averageCompletionPct: number;

    @ApiProperty()
    dateRange: {
        from: string;
        to: string;
    };
}