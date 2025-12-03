import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRunsheetDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    eventId?: string;

    @IsOptional()
    @IsString()
    templateId?: string;
}

export class UpdateRunsheetDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsEnum(['draft', 'approved', 'locked'])
    status?: 'draft' | 'approved' | 'locked';
}

export class CreateRunsheetItemDto {
    @IsInt()
    @Min(0)
    idx: number;

    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    ownerId?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    durationMs?: number;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    equipment?: string;

    @IsOptional()
    @IsEnum(['low', 'normal', 'high', 'critical'])
    priority?: 'low' | 'normal' | 'high' | 'critical';

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsArray()
    attachmentsJson?: any[];
}

export class UpdateRunsheetItemDto {
    @IsOptional()
    @IsInt()
    @Min(0)
    idx?: number;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    ownerId?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    durationMs?: number;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    equipment?: string;

    @IsOptional()
    @IsEnum(['low', 'normal', 'high', 'critical'])
    priority?: 'low' | 'normal' | 'high' | 'critical';

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsArray()
    attachmentsJson?: any[];
}

export class BulkCreateRunsheetItemsDto {
    @IsArray()
    @Type(() => CreateRunsheetItemDto)
    items: CreateRunsheetItemDto[];
}

export class RunsheetQueryDto {
    @IsOptional()
    @IsString()
    eventId?: string;

    @IsOptional()
    @IsEnum(['draft', 'approved', 'locked'])
    status?: 'draft' | 'approved' | 'locked';

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsString()
    cursor?: string;
}

export class ReorderRunsheetItemsDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    itemIds: string[];
}
