import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
    ValidateNested
} from 'class-validator';

// DTO for a single quick link
export class QuickLinkDto {
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    label: string;

    @IsUrl()
    url: string;

    @IsOptional()
    @IsString()
    icon?: string; // Lucide icon name

    @IsBoolean()
    openInNewTab: boolean = false;
}

// DTO for updating quick links
export class UpdateQuickLinksDto {
    @IsArray()
    @ArrayMaxSize(10)
    @ValidateNested({ each: true })
    @Type(() => QuickLinkDto)
    quickLinks: QuickLinkDto[];
}

export type QuickLink = QuickLinkDto;
