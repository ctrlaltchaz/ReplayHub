import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    MinLength
} from 'class-validator';

// Create inventory item DTO
export class CreateInventoryItemDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    tag: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    name: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsOptional()
    @IsString()
    serial?: string;

    @IsOptional()
    @IsIn(['good', 'repair', 'lost'])
    condition?: string = 'good';

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsIn(['available', 'booked', 'out', 'maintenance'])
    status?: string = 'available';

    @IsOptional()
    @IsString()
    notes?: string;
}

// Update inventory item DTO
export class UpdateInventoryItemDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    serial?: string;

    @IsOptional()
    @IsIn(['good', 'repair', 'lost'])
    condition?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsIn(['available', 'booked', 'out', 'maintenance'])
    status?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

// Query inventory items DTO
export class QueryInventoryItemsDto {
    @IsOptional()
    @IsString()
    q?: string; // search query

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsIn(['available', 'booked', 'out', 'maintenance'])
    status?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 50;

    @IsOptional()
    @IsString()
    cursor?: string; // cursor-based pagination
}

// Create inventory kit DTO
export class CreateInventoryKitDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    name: string;
}

// Add items to kit DTO
export class AddItemsToKitDto {
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    itemIds: string[];
}

// Move inventory item DTO
export class MoveInventoryItemDto {
    @IsString()
    @IsNotEmpty()
    toLoc: string;

    @IsOptional()
    @IsString()
    note?: string;
}

// Book inventory item DTO
export class BookInventoryItemDto {
    @IsOptional()
    @IsString()
    eventId?: string;

    @IsOptional()
    @IsDateString()
    dueBack?: string;

    @IsOptional()
    @IsString()
    note?: string;
}