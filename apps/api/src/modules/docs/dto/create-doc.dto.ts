import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum DocStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

export class CreateDocCategoryDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    slug: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    icon?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    sort_order?: number;
}

export class CreateDocDto {
    @IsNotEmpty()
    @IsString()
    category_id: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    title: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    slug: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    excerpt?: string;

    @IsOptional()
    @IsEnum(DocStatus)
    status?: DocStatus;

    @IsOptional()
    @IsBoolean()
    is_featured?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(1)
    estimated_read_time?: number;
}

export class CompleteDocDto {
    @IsOptional()
    @IsString()
    notes?: string;
}

export class DocQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    category_id?: string;

    @IsOptional()
    @IsEnum(DocStatus)
    status?: DocStatus;

    @IsOptional()
    @IsBoolean()
    is_featured?: boolean;

    @IsOptional()
    @IsString()
    page?: string;

    @IsOptional()
    @IsString()
    limit?: string;
}
