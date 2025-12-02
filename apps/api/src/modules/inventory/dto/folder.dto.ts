import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// Create folder DTO
export class CreateFolderDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}

// Update folder DTO
export class UpdateFolderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}

// Query folders DTO
export class QueryFoldersDto {
  @IsOptional()
  @IsString()
  q?: string; // search query

  @IsOptional()
  @IsString()
  parentId?: string; // filter by parent folder (use 'root' for root level)

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  cursor?: string; // cursor-based pagination
}

// Folder response DTO
export class FolderResponseDto {
  id: string;
  name: string;
  parentId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    children: number;
    assets: number;
  };
}

// Folder with contents response DTO
export class FolderWithContentsDto {
  id: string;
  name: string;
  parentId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  children: FolderResponseDto[];
  assets: any[];
}
