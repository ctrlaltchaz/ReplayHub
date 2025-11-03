import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateOrgUserDto {
    @IsOptional()
    @IsString()
    displayName?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}