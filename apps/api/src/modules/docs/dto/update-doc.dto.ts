import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { DocStatus } from './create-doc.dto';

export class UpdateDocCategoryDto {
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

export class UpdateDocDto {
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
