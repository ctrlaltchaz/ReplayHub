import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateOrgUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(1)
    displayName: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    password?: string; // Optional - if not provided, user must accept invite
}
