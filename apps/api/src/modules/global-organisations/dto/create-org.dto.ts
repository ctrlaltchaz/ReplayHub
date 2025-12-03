import { IsObject, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateOrgDto {
    @IsString()
    @Length(2, 80, { message: 'Name must be between 2 and 80 characters' })
    name: string;

    @IsString()
    @Length(2, 40, { message: 'Slug must be between 2 and 40 characters' })
    @Matches(/^[a-z0-9-]{2,40}$/, {
        message: 'Slug must contain only lowercase letters, numbers, and hyphens'
    })
    slug: string;

    @IsOptional()
    @IsObject()
    brandingJson?: any;

    @IsOptional()
    @IsObject()
    featuresJson?: any;
}
