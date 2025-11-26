import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { z } from 'zod';

// ============================================================================
// EVENT DTOs
// ============================================================================

const eventTypeEnum = ['Broadcast', 'Tournament', 'Showmatch', 'Rehearsal', 'Other'] as const;
const staffRoleEnum = [
  'broadcaster',
  'shoutcaster',
  'presenter',
  'player',
  'host',
  'analyst',
  'producer',
  'observer',
  'social_media_runner',
  'other',
] as const;
const staffAssignmentSchema = z.object({
  orgUserId: z.string().cuid(),
  roleType: z.enum(staffRoleEnum),
  roleLabel: z.string().max(100).optional(),
});

const baseEventSchema = z.object({
  title: z.string().min(1).max(200),
  eventType: z.enum(eventTypeEnum).default('Other'),
  gameTitle: z.string().max(100).optional(),
  productionLead: z.string().cuid().optional(),
  broadcastChannel: z.string().max(100).optional(),
  startAt: z.string().datetime(),
  callTime: z.string().datetime().optional(),
  endAt: z.string().datetime(),
  duration: z.number().int().min(1).max(1440).optional(), // Max 24 hours
  location: z.string().max(200).optional(),
  teamId: z.string().cuid().optional(),
  lineupId: z.string().cuid().optional(),
  // Tournament-specific fields
  opponent: z.string().max(200).optional(),
  tournamentName: z.string().max(200).optional(),
  tournamentStage: z.string().max(100).optional(),
  bestOf: z.number().int().min(1).max(9).optional(),
  graphicsPackage: z.string().max(100).optional(),
  checklistId: z.string().cuid().optional(),
  rosterId: z.string().cuid().optional(),
  notes: z.string().max(5000).optional(),
  status: z.enum(['scheduled', 'cancelled', 'completed']).default('scheduled'),
  staffAssignments: z.array(staffAssignmentSchema).max(50).optional(),
});

export const createEventSchema = baseEventSchema
  .refine(data => new Date(data.endAt) > new Date(data.startAt), {
    message: 'End time must be after start time',
    path: ['endAt'],
  })
  .refine(data => !data.callTime || new Date(data.callTime) <= new Date(data.startAt), {
    message: 'Call time must be before or equal to start time',
    path: ['callTime'],
  });

export const updateEventSchema = baseEventSchema.partial();

export const queryEventsSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  teamId: z.string().cuid().optional(),
  eventType: z.enum(eventTypeEnum).optional(),
  gameTitle: z.string().max(100).optional(),
  productionLead: z.string().cuid().optional(),
  q: z.string().max(200).optional(),
  status: z.enum(['scheduled', 'cancelled', 'completed']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export class StaffAssignmentDto {
  @ApiProperty({ description: 'Org user ID for the staff member' })
  @IsString()
  @MinLength(20)
  @MaxLength(30)
  orgUserId: string;

  @ApiProperty({ description: 'Role type for the event', enum: staffRoleEnum })
  @IsEnum(staffRoleEnum)
  roleType: string;

  @ApiPropertyOptional({ description: 'Custom role label (e.g., play-by-play, host)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  roleLabel?: string;
}

export class CreateEventDto {
  @ApiProperty({ description: 'Event title' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Event type', enum: eventTypeEnum, default: 'Other' })
  @IsOptional()
  @IsEnum(eventTypeEnum)
  eventType?: string;

  @ApiPropertyOptional({ description: 'Game title (e.g., Valorant, Overwatch 2)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  gameTitle?: string;

  @ApiPropertyOptional({ description: 'Production lead globalUserId' })
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @ValidateIf(o => o.productionLead !== undefined && o.productionLead !== '')
  @IsString()
  @MinLength(20)
  @MaxLength(30)
  productionLead?: string;

  @ApiPropertyOptional({ description: 'Broadcast channel (e.g., Twitch, YouTube)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  broadcastChannel?: string;

  @ApiProperty({ description: 'Event start time' })
  @IsDateString()
  startAt: string;

  @ApiPropertyOptional({ description: 'Crew call-in time' })
  @IsOptional()
  @IsDateString()
  callTime?: string;

  @ApiProperty({ description: 'Event end time' })
  @IsDateString()
  endAt: string;

  @ApiPropertyOptional({ description: 'Expected duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  duration?: number;

  @ApiPropertyOptional({ description: 'Event location' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ description: 'Associated team ID' })
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @ValidateIf(o => o.teamId !== undefined && o.teamId !== '')
  @IsString()
  @MinLength(20)
  @MaxLength(30)
  teamId?: string;

  @ApiPropertyOptional({ description: 'Associated lineup ID' })
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @ValidateIf(o => o.lineupId !== undefined && o.lineupId !== '')
  @IsString()
  @MinLength(20)
  @MaxLength(30)
  lineupId?: string;

  @ApiPropertyOptional({ description: 'Opponent team name (for tournaments)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  opponent?: string;

  @ApiPropertyOptional({ description: 'Tournament name (e.g., NESL Week 5)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tournamentName?: string;

  @ApiPropertyOptional({ description: 'Tournament stage (e.g., Quarterfinals, Finals)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tournamentStage?: string;

  @ApiPropertyOptional({ description: 'Best of X games', minimum: 1, maximum: 9 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  bestOf?: number;

  @ApiPropertyOptional({ description: 'Graphics package identifier' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  graphicsPackage?: string;

  @ApiPropertyOptional({ description: 'Linked checklist ID' })
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @ValidateIf(o => o.checklistId !== undefined && o.checklistId !== '')
  @IsString()
  @MinLength(20)
  @MaxLength(30)
  checklistId?: string;

  @ApiPropertyOptional({ description: 'Linked roster ID' })
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @ValidateIf(o => o.rosterId !== undefined && o.rosterId !== '')
  @IsString()
  @MinLength(20)
  @MaxLength(30)
  rosterId?: string;

  @ApiPropertyOptional({ description: 'Event notes' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Event status',
    enum: ['scheduled', 'cancelled', 'completed'],
    default: 'scheduled',
  })
  @IsOptional()
  @IsEnum(['scheduled', 'cancelled', 'completed'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Event staff assignments',
    type: () => StaffAssignmentDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StaffAssignmentDto)
  staffAssignments?: StaffAssignmentDto[];
}

export class UpdateEventDto {
  @ApiPropertyOptional({ description: 'Event title' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Event type',
    enum: ['Broadcast', 'Tournament', 'Showmatch', 'Rehearsal', 'Other'],
  })
  @IsOptional()
  @IsEnum(['Broadcast', 'Tournament', 'Showmatch', 'Rehearsal', 'Other'])
  eventType?: string;

  @ApiPropertyOptional({ description: 'Game title' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  gameTitle?: string;

  @ApiPropertyOptional({ description: 'Production lead orgUserId' })
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @ValidateIf(o => o.productionLead !== undefined && o.productionLead !== '')
  @IsString()
  @MinLength(20)
  @MaxLength(30)
  productionLead?: string;

  @ApiPropertyOptional({ description: 'Broadcast channel' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  broadcastChannel?: string;

  @ApiPropertyOptional({ description: 'Event start time' })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ description: 'Crew call-in time' })
  @IsOptional()
  @IsDateString()
  callTime?: string;

  @ApiPropertyOptional({ description: 'Event end time' })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({ description: 'Expected duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  duration?: number;

  @ApiPropertyOptional({ description: 'Event location' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ description: 'Associated team ID' })
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @ValidateIf(o => o.teamId !== undefined && o.teamId !== '')
  @IsString()
  @MinLength(20)
  @MaxLength(30)
  teamId?: string;

  @ApiPropertyOptional({ description: 'Associated lineup ID' })
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @ValidateIf(o => o.lineupId !== undefined && o.lineupId !== '')
  @IsString()
  @MinLength(20)
  @MaxLength(30)
  lineupId?: string;

  @ApiPropertyOptional({ description: 'Opponent team name (for tournaments)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  opponent?: string;

  @ApiPropertyOptional({ description: 'Tournament name (e.g., NESL Week 5)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tournamentName?: string;

  @ApiPropertyOptional({ description: 'Tournament stage (e.g., Quarterfinals, Finals)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tournamentStage?: string;

  @ApiPropertyOptional({ description: 'Best of X games', minimum: 1, maximum: 9 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  bestOf?: number;

  @ApiPropertyOptional({ description: 'Graphics package identifier' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  graphicsPackage?: string;

  @ApiPropertyOptional({ description: 'Linked checklist ID' })
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @ValidateIf(o => o.checklistId !== undefined && o.checklistId !== '')
  @IsString()
  @MinLength(20)
  @MaxLength(30)
  checklistId?: string;

  @ApiPropertyOptional({ description: 'Linked roster ID' })
  @Transform(({ value }) => (!value || value === '' ? undefined : value))
  @ValidateIf(o => o.rosterId !== undefined && o.rosterId !== '')
  @IsString()
  @MinLength(20)
  @MaxLength(30)
  rosterId?: string;

  @ApiPropertyOptional({ description: 'Event notes' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Event status',
    enum: ['scheduled', 'cancelled', 'completed'],
  })
  @IsOptional()
  @IsEnum(['scheduled', 'cancelled', 'completed'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Event staff assignments',
    type: () => StaffAssignmentDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StaffAssignmentDto)
  staffAssignments?: StaffAssignmentDto[];
}

export class QueryEventsDto {
  @ApiPropertyOptional({ description: 'Filter events from this datetime' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Filter events until this datetime' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ description: 'Filter by team ID' })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(30)
  teamId?: string;

  @ApiPropertyOptional({
    description: 'Filter by event type',
    enum: ['Broadcast', 'Tournament', 'Showmatch', 'Rehearsal', 'Other'],
  })
  @IsOptional()
  @IsEnum(['Broadcast', 'Tournament', 'Showmatch', 'Rehearsal', 'Other'])
  eventType?: string;

  @ApiPropertyOptional({ description: 'Filter by game title' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  gameTitle?: string;

  @ApiPropertyOptional({ description: 'Filter by production lead' })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(30)
  productionLead?: string;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['scheduled', 'cancelled', 'completed'],
  })
  @IsOptional()
  @IsEnum(['scheduled', 'cancelled', 'completed'])
  status?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 50;
}

// Alias for convenience
export class EventFiltersDto extends QueryEventsDto {}

export class AssignLineupDto {
  @ApiProperty({ description: 'Lineup ID to assign to event' })
  @IsUUID()
  lineupId: string;
}

// ============================================================================
// RESOURCE DTOs
// ============================================================================

export const createResourceSchema = z.object({
  kind: z.enum(['room', 'kit']),
  name: z.string().min(1).max(100),
  refId: z.string().cuid().optional(),
  location: z.string().max(200).optional(),
});

export const queryResourcesSchema = z.object({
  kind: z.enum(['room', 'kit']).optional(),
});

export class CreateResourceDto {
  @ApiProperty({
    description: 'Resource type',
    enum: ['room', 'kit'],
  })
  @IsEnum(['room', 'kit'])
  kind: string;

  @ApiProperty({ description: 'Resource name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Reference ID (e.g., inventory kit ID)' })
  @IsOptional()
  @IsString()
  refId?: string;

  @ApiPropertyOptional({ description: 'Resource location' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}

export class UpdateResourceDto {
  @ApiPropertyOptional({ description: 'Resource name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Reference ID (e.g., inventory kit ID)' })
  @IsOptional()
  @IsString()
  refId?: string;

  @ApiPropertyOptional({ description: 'Resource location' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}

export class QueryResourcesDto {
  @ApiPropertyOptional({
    description: 'Filter by resource type',
    enum: ['room', 'kit'],
  })
  @IsOptional()
  @IsEnum(['room', 'kit'])
  kind?: string;

  @ApiPropertyOptional({ description: 'Search in name or location' })
  @IsOptional()
  @IsString()
  search?: string;
}

// Alias for consistency with service naming
export class ResourceFiltersDto extends QueryResourcesDto {}

// ============================================================================
// BOOKING DTOs
// ============================================================================

export const createBookingsSchema = z.object({
  resourceIds: z.array(z.string().cuid()).min(1).max(20),
  allowSoft: z.boolean().default(false).optional(),
});

export class CreateBookingsDto {
  @ApiProperty({
    description: 'Array of resource IDs to book',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  resourceIds: string[];

  @ApiPropertyOptional({
    description: 'Allow soft booking with conflict tagging',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  allowSoft?: boolean = false;
}

// ============================================================================
// CALENDAR DTOs
// ============================================================================

export const queryCalendarWeekSchema = z.object({
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  days: z.number().int().min(1).max(14).optional(),
  tz: z.string().optional(), // IANA timezone identifier
});

export class CalendarWeekQueryDto {
  @ApiPropertyOptional({
    description: 'Week start date in ISO8601 format (YYYY-MM-DD). Defaults to current Monday.',
    example: '2025-01-13',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'start must be in YYYY-MM-DD format' })
  start?: string;

  @ApiPropertyOptional({
    description: 'Number of days to include in the calendar view (1-14)',
    example: 7,
    minimum: 1,
    maximum: 14,
    default: 7,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(14)
  @Type(() => Number)
  days?: number = 7;

  @ApiPropertyOptional({
    description:
      'IANA timezone identifier (e.g., "America/New_York", "Europe/London"). Defaults to tenant timezone or UTC.',
    example: 'America/New_York',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  tz?: string;
}

// Legacy DTO for backward compatibility
export class QueryCalendarWeekDto {
  @ApiProperty({
    description: 'Week start date in YYYY-MM-DD format',
    example: '2025-10-09',
  })
  @IsString()
  start: string;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

export class ResourceResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  kind: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  refId?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiProperty()
  createdAt: string;
}

export class BookingResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  resourceId: string;

  @ApiProperty({ type: ResourceResponse })
  resource: ResourceResponse;

  @ApiProperty()
  createdAt: string;
}

export class StaffAssignmentResponse extends StaffAssignmentDto {
  @ApiPropertyOptional({ description: 'Display name of the assigned user' })
  displayName?: string;

  @ApiPropertyOptional({ description: 'Email of the assigned user' })
  email?: string;

  @ApiPropertyOptional({ description: 'Avatar URL of the assigned user' })
  avatar?: string;
}

export class EventResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  eventType?: string;

  @ApiPropertyOptional()
  gameTitle?: string;

  @ApiPropertyOptional()
  productionLead?: string;

  @ApiPropertyOptional()
  broadcastChannel?: string;

  @ApiProperty()
  startAt: string;

  @ApiPropertyOptional()
  callTime?: string;

  @ApiProperty()
  endAt: string;

  @ApiPropertyOptional()
  duration?: number;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  teamId?: string;

  @ApiPropertyOptional()
  lineupId?: string;

  @ApiPropertyOptional()
  graphicsPackage?: string;

  @ApiPropertyOptional()
  checklistId?: string;

  @ApiPropertyOptional()
  rosterId?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional({ type: [BookingResponse] })
  bookings?: BookingResponse[];

  @ApiPropertyOptional({ type: [StaffAssignmentResponse] })
  staffAssignments?: StaffAssignmentResponse[];
}

export class CalendarEventResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  startAt: string;

  @ApiProperty()
  endAt: string;

  @ApiPropertyOptional()
  teamId?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiProperty({ type: [ResourceResponse] })
  resources: ResourceResponse[];

  @ApiPropertyOptional({ type: [StaffAssignmentResponse] })
  staffAssignments?: StaffAssignmentResponse[];
}

export class ConflictErrorResponse {
  @ApiProperty({ example: 'resource_conflict' })
  error: string;

  @ApiProperty()
  resourceId: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  existingStart: string;

  @ApiProperty()
  existingEnd: string;
}
