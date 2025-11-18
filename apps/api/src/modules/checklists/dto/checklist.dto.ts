import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export interface ChecklistTemplateItem {
    text: string;
    required: boolean;
    evidence: boolean;
    category?: string; // Optional category for grouping items
    assignedTo?: string; // User ID for item-level ownership
    priority?: 'low' | 'medium' | 'high'; // Priority level
    estimatedMinutes?: number; // Estimated time to complete in minutes
}

export class CreateChecklistTemplateDto {
    @IsString()
    title: string;

    @IsEnum(['event', 'room', 'kit', 'general'])
    scope: 'event' | 'room' | 'kit' | 'general';

    @IsArray()
    itemsJson: ChecklistTemplateItem[];
}

export class UpdateChecklistTemplateDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsEnum(['event', 'room', 'kit', 'general'])
    scope?: 'event' | 'room' | 'kit' | 'general';

    @IsOptional()
    @IsArray()
    itemsJson?: ChecklistTemplateItem[];
}

export class CreateChecklistDto {
    @IsOptional()
    @IsString()
    templateId?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsEnum(['event', 'room', 'kit', 'general'])
    scope?: 'event' | 'room' | 'kit' | 'general';

    @IsOptional()
    @IsArray()
    itemsJson?: ChecklistTemplateItem[];

    @IsOptional()
    @IsString()
    scopeRef?: string;

    @IsOptional()
    @IsDateString()
    dueAt?: string;

    @IsOptional()
    @IsString()
    assigneeId?: string;
}

export class UpdateChecklistDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsEnum(['event', 'room', 'kit', 'general'])
    scope?: 'event' | 'room' | 'kit' | 'general';

    @IsOptional()
    @IsArray()
    itemsJson?: ChecklistTemplateItem[];

    @IsOptional()
    @IsString()
    scopeRef?: string;

    @IsOptional()
    @IsDateString()
    dueAt?: string;

    @IsOptional()
    @IsString()
    assigneeId?: string;

    @IsOptional()
    @IsEnum(['pending', 'in_progress', 'done', 'failed'])
    status?: 'pending' | 'in_progress' | 'done' | 'failed';

    @IsOptional()
    completedItems?: any; // JSON array of completed items
}

export interface ChecklistRunResultItem {
    idx: number;
    pass: boolean;
    notes?: string;
    evidence?: string[];
}

export class CreateChecklistRunDto {
    @IsArray()
    resultJson: ChecklistRunResultItem[];
}

export class ChecklistTemplateQueryDto {
    @IsOptional()
    @IsEnum(['event', 'room', 'kit', 'general'])
    scope?: 'event' | 'room' | 'kit' | 'general';

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsString()
    cursor?: string;
}

export class ChecklistQueryDto {
    @IsOptional()
    @IsString()
    eventId?: string;

    @IsOptional()
    @IsString()
    templateId?: string;

    @IsOptional()
    @IsEnum(['pending', 'in_progress', 'done', 'failed'])
    status?: 'pending' | 'in_progress' | 'done' | 'failed';

    @IsOptional()
    @IsString()
    scopeRef?: string;

    @IsOptional()
    @IsString()
    assigneeId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsString()
    cursor?: string;
}

export class ChecklistTaskQueryDto {
    @IsOptional()
    @IsEnum(['open', 'completed'])
    status?: 'open' | 'completed';

    @IsOptional()
    @IsEnum(['low', 'medium', 'high'])
    priority?: 'low' | 'medium' | 'high';

    @IsOptional()
    @IsDateString()
    dueBefore?: string;

    @IsOptional()
    @IsDateString()
    dueAfter?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsString()
    cursor?: string;
}
