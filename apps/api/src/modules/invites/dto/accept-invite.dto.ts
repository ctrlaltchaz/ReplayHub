import { IsOptional, IsString, Length, MinLength } from 'class-validator';

export class AcceptInviteDto {
    @IsString()
    token: string;

    @IsString()
    @MinLength(1)
    displayName: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsOptional()
    @IsString()
    @Length(6, 6)
    totpToken?: string; // For enabling 2FA during registration
}