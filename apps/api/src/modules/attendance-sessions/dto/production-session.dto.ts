import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class QuerySessionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ description: 'Filter by status (scheduled|cancelled|completed)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Only recurring sessions' })
  @IsOptional()
  @IsBoolean()
  recurringOnly?: boolean;
}

export class CreateSessionDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ISO date for the first session occurrence' })
  @IsDateString()
  sessionDate: string;

  @ApiProperty({ description: 'ISO string for attendance window start' })
  @IsDateString()
  windowStart: string;

  @ApiProperty({ description: 'ISO string for attendance window end' })
  @IsDateString()
  windowEnd: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean = false;

  @ApiPropertyOptional({ description: 'RRULE string when recurring' })
  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @ApiPropertyOptional({ description: 'Optional link to an existing event' })
  @IsOptional()
  @IsString()
  eventId?: string | null;
}

export class UpdateSessionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  sessionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  windowStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  windowEnd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @ApiPropertyOptional({ description: 'scheduled|cancelled|archived' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Optional link to an existing event' })
  @IsOptional()
  @IsString()
  eventId?: string | null;
}

export class ProductionSessionResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  sessionDate: string;

  @ApiProperty()
  windowStart: string;

  @ApiProperty()
  windowEnd: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  eventId?: string | null;
}
