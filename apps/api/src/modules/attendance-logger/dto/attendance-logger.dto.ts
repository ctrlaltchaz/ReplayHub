import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

const CUID_REGEX = /^c[a-z0-9]{24}$/;
const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
const EVENT_ID_REGEX = new RegExp(`${UUID_REGEX.source}|${CUID_REGEX.source}`);
const USER_ID_REGEX = new RegExp(`${UUID_REGEX.source}|${CUID_REGEX.source}`);

export enum AttendanceDepartmentDto {
  BROADCASTING = 'broadcasting',
  GRAPHICS = 'graphics',
  SOCIAL_MEDIA = 'social_media',
  PRODUCTION = 'production',
  CAMERA_OPERATOR = 'camera_operator',
  OTHER = 'other',
}

export enum AttendanceAbsenceReasonDto {
  ILLNESS = 'illness',
  APPOINTMENT = 'appointment',
  FORGOT = 'forgot',
  OTHER = 'other',
}

export enum AttendanceSourceDto {
  STUDENT = 'student',
  AUTO = 'auto',
  TUTOR = 'tutor',
  ADMIN = 'admin',
}

export enum AttendanceReviewStatusDto {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ABSENT = 'absent',
  AUTO_CLOCKED_OUT = 'auto_clocked_out',
}

export enum AttendanceExportFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
}

export class ClockInDto {
  @ApiPropertyOptional({ description: 'Event ID for the production session (cuid or uuid)' })
  @IsOptional()
  @Matches(EVENT_ID_REGEX, { message: 'eventId must be a cuid or uuid' })
  eventId?: string;

  @ApiPropertyOptional({ description: 'Production session ID' })
  @IsOptional()
  @Matches(CUID_REGEX, { message: 'sessionId must be a cuid' })
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'Org user ID when clocking in on behalf of someone else (tutor/admin only)',
    format: 'cuid or uuid',
  })
  @IsOptional()
  @Matches(USER_ID_REGEX, { message: 'orgUserId must be a cuid or uuid' })
  orgUserId?: string;

  @ApiProperty({ enum: AttendanceDepartmentDto })
  @IsEnum(AttendanceDepartmentDto)
  department: AttendanceDepartmentDto;

  @ApiPropertyOptional({
    description: 'Additional role notes (e.g., camera position)',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  roleNotes?: string;

  @ApiPropertyOptional({
    enum: AttendanceAbsenceReasonDto,
    description: 'Reason if clocking absence instead of presence',
  })
  @IsOptional()
  @IsEnum(AttendanceAbsenceReasonDto)
  absenceReason?: AttendanceAbsenceReasonDto;

  @ApiPropertyOptional({ description: 'Notes supporting absence reason', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  absenceNotes?: string;

  @ApiPropertyOptional({
    description: 'Override token granted by tutor/admin for out-of-window clock-in',
  })
  @IsOptional()
  @IsString()
  overrideToken?: string;
}

export class ClockOutDto {
  @ApiProperty({ description: 'Attendance entry ID to close' })
  @Matches(CUID_REGEX, { message: 'attendanceId must be a cuid' })
  attendanceId: string;

  @ApiPropertyOptional({ description: 'Override token if tutor/admin is clocking out on behalf' })
  @IsOptional()
  @IsString()
  overrideToken?: string;
}

export class AbsenceReportDto {
  @ApiPropertyOptional({ description: 'Event ID for which the absence is logged (cuid or uuid)' })
  @IsOptional()
  @Matches(EVENT_ID_REGEX, { message: 'eventId must be a cuid or uuid' })
  eventId?: string;

  @ApiPropertyOptional({ description: 'Session ID for the absence' })
  @IsOptional()
  @Matches(CUID_REGEX, { message: 'sessionId must be a cuid' })
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'Org user ID when tutor/admin logs an absence for a student',
    format: 'cuid or uuid',
  })
  @IsOptional()
  @Matches(USER_ID_REGEX, { message: 'orgUserId must be a cuid or uuid' })
  orgUserId?: string;

  @ApiProperty({ enum: AttendanceAbsenceReasonDto })
  @IsEnum(AttendanceAbsenceReasonDto)
  absenceReason: AttendanceAbsenceReasonDto;

  @ApiPropertyOptional({ description: 'Details for the absence', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  absenceNotes?: string;
}

export class TutorReviewDto {
  @ApiProperty({ enum: AttendanceReviewStatusDto })
  @IsEnum(AttendanceReviewStatusDto)
  status: AttendanceReviewStatusDto;

  @ApiPropertyOptional({ description: 'Override for clock-in timestamp (ISO8601)' })
  @IsOptional()
  @IsISO8601()
  clockInAt?: string;

  @ApiPropertyOptional({ description: 'Override for clock-out timestamp (ISO8601)' })
  @IsOptional()
  @IsISO8601()
  clockOutAt?: string;

  @ApiPropertyOptional({ enum: AttendanceDepartmentDto })
  @IsOptional()
  @IsEnum(AttendanceDepartmentDto)
  department?: AttendanceDepartmentDto;

  @ApiPropertyOptional({ description: 'Role/department notes', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  roleNotes?: string;

  @ApiPropertyOptional({ enum: AttendanceAbsenceReasonDto })
  @IsOptional()
  @IsEnum(AttendanceAbsenceReasonDto)
  absenceReason?: AttendanceAbsenceReasonDto;

  @ApiPropertyOptional({ description: 'Absence supporting notes', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  absenceNotes?: string;

  @ApiPropertyOptional({ description: 'Reason for overriding restrictions', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  overrideReason?: string;
}

export class AttendanceFilterQuery {
  @ApiPropertyOptional({ description: 'Filter by scheduled date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Filter by production session ID' })
  @IsOptional()
  @Matches(CUID_REGEX, { message: 'sessionId must be a cuid' })
  sessionId?: string;

  @ApiPropertyOptional({ enum: AttendanceReviewStatusDto })
  @IsOptional()
  @IsEnum(AttendanceReviewStatusDto)
  status?: AttendanceReviewStatusDto;

  @ApiPropertyOptional({ enum: AttendanceDepartmentDto })
  @IsOptional()
  @IsEnum(AttendanceDepartmentDto)
  department?: AttendanceDepartmentDto;

  @ApiPropertyOptional({ description: 'Only show late entries', default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  lateOnly?: boolean;

  @ApiPropertyOptional({ description: 'Only show auto clock outs', default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  autoClockOutOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter by user ID', format: 'cuid or uuid' })
  @IsOptional()
  @Matches(USER_ID_REGEX, { message: 'orgUserId must be a cuid or uuid' })
  orgUserId?: string;
}

export class AttendanceExportDto extends AttendanceFilterQuery {
  @ApiProperty({ enum: AttendanceExportFormat })
  @IsEnum(AttendanceExportFormat)
  format: AttendanceExportFormat;

  @ApiPropertyOptional({ description: 'Optional date range start (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'Optional date range end (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ description: 'Organisation IDs (admin only)', type: [String] })
  @IsOptional()
  orgIds?: string[];
}

export class AttendanceLoggerResponse {
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

  @ApiPropertyOptional({ enum: AttendanceDepartmentDto })
  department?: AttendanceDepartmentDto;

  @ApiPropertyOptional()
  roleNotes?: string;

  @ApiProperty({ enum: AttendanceReviewStatusDto })
  status: AttendanceReviewStatusDto;

  @ApiPropertyOptional()
  note?: string;

  @ApiPropertyOptional({ enum: AttendanceAbsenceReasonDto })
  absenceReason?: AttendanceAbsenceReasonDto;

  @ApiPropertyOptional()
  absenceNotes?: string;

  @ApiPropertyOptional()
  clockInAt?: string;

  @ApiPropertyOptional()
  clockOutAt?: string;

  @ApiProperty()
  autoClockOut: boolean;

  @ApiProperty()
  lateFlag: boolean;

  @ApiProperty({ enum: AttendanceSourceDto })
  source: AttendanceSourceDto;

  @ApiPropertyOptional()
  overrideReason?: string;

  @ApiPropertyOptional()
  reviewedBy?: string;

  @ApiPropertyOptional()
  reviewedAt?: string;

  @ApiPropertyOptional()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Linked event summary' })
  event?: any;

  @ApiPropertyOptional({ description: 'Org user summary' })
  orgUser?: any;
}
