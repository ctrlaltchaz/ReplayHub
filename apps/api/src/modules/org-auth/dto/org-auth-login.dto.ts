import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class OrgAuthLoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(1)
    password: string;

    @IsOptional()
    @IsString()
    totpToken?: string; // Optional TOTP token for 2FA
}
