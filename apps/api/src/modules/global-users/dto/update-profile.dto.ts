import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';

class SocialLinksDto {
    @IsOptional()
    @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
    linkedin?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Twitter URL must be a valid URL' })
    twitter?: string;

    @IsOptional()
    @IsUrl({}, { message: 'GitHub URL must be a valid URL' })
    github?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Website URL must be a valid URL' })
    website?: string;
}

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Bio must not exceed 1000 characters' })
    bio?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Location must not exceed 255 characters' })
    location?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100, { message: 'Timezone must not exceed 100 characters' })
    timezone?: string;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => SocialLinksDto)
    socialLinks?: SocialLinksDto;
}
