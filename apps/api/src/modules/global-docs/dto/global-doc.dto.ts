import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum DocStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

export class CreateGlobalDocCategoryDto {
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

export class CreateGlobalDocDto {
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

export class UpdateGlobalDocCategoryDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    slug?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    icon?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    sort_order?: number;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class UpdateGlobalDocDto {
    @IsOptional()
    @IsString()
    category_id?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    slug?: string;

    @IsOptional()
    @IsString()
    content?: string;

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

export class GlobalDocQueryDto {
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
    @IsString()
    page?: string;

    @IsOptional()
    @IsString()
    limit?: string;
}
