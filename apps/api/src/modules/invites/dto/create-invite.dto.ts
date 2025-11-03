import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';

export enum InviteMethod {
    EMAIL = 'EMAIL',
    LINK = 'LINK',
}

export class CreateInviteDto {
    @ValidateIf(o => o.method === InviteMethod.EMAIL)
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsEnum(InviteMethod)
    method?: InviteMethod;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    roles: string[]; // Role names
}