import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const SORT_FIELDS = ['createdAt', 'action', 'status'] as const;
const SORT_ORDERS = ['asc', 'desc'] as const;

export class AuditLogFiltersDto {
    @IsOptional()
    @IsString()
    action?: string;

    @IsOptional()
    @IsString()
    entity?: string;

    @IsOptional()
    @IsString()
    entityType?: string;

    @IsOptional()
    @IsString()
    entityId?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    orgUserId?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsIn(SORT_FIELDS)
    sortBy?: (typeof SORT_FIELDS)[number];

    @IsOptional()
    @IsIn(SORT_ORDERS)
    sortOrder?: (typeof SORT_ORDERS)[number];

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(200)
    limit?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;
}
