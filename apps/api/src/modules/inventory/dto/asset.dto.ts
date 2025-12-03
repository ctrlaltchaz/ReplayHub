import { Type } from 'class-transformer';
import {
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Min
} from 'class-validator';

// Query assets DTO
export class QueryAssetsDto {
    @IsOptional()
    @IsString()
    q?: string; // search query

    @IsOptional()
    @IsString()
    tag?: string;

    @IsOptional()
    @IsIn(['active', 'archived', 'pending'])
    status?: string;

    @IsOptional()
    @IsString()
    folderId?: string; // filter by folder (use 'root' for root level, 'null' for no folder)

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 50;

    @IsOptional()
    @IsString()
    cursor?: string; // cursor-based pagination
}

// Update asset DTO
export class UpdateAssetDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsIn(['active', 'archived', 'pending'])
    status?: string;

    @IsOptional()
    @IsString()
    tags?: string;

    @IsOptional()
    folderId?: string | null;
}

// Asset upload response DTO
export class AssetUploadResponseDto {
    id: string;
    path: string;
    name: string;
    mime: string;
    size: number;
    version: number;
    status: string;
    createdAt: Date;
}
