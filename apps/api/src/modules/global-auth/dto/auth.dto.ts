import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsBoolean()
    @IsOptional()
    rememberMe?: boolean;
}

export class VerifyTotpDto {
    @IsString()
    token: string;
}

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;
}

export class ChangePasswordDto {
    @IsString()
    currentPassword: string;

    @IsString()
    @MinLength(8)
    newPassword: string;
}

export class ChangeEmailDto {
    @IsEmail()
    newEmail: string;
}

export class VerifyEmailChangeDto {
    @IsEmail()
    newEmail: string;

    @IsString()
    code: string;
}
