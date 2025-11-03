import { IsArray, IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class AdminOverviewDto {
    organisationCount: number;
    globalUserCount: number;
    activeTenantCount: number;
    recentIncidentCount: number;
}

export class CreateOrganisationDto {
    @IsString()
    name: string;

    @IsString()
    slug: string;

    @IsEmail()
    ownerEmail: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    enabledModules?: string[];
}

export class UpdateOrganisationDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    branding?: string;

    @IsOptional()
    @IsString()
    features?: string;
}

export class CreateGlobalUserDto {
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsBoolean()
    isSuperAdmin?: boolean;
}

export class UpdateGlobalUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsBoolean()
    isGlobalAdmin?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class ImpersonateDto {
    @IsString()
    orgId: string;

    @IsOptional()
    @IsString()
    orgUserId?: string;

    @IsOptional()
    @IsString()
    reason?: string;
}

export class CreateOrganisationUserDto {
    @IsOptional()
    @IsString()
    globalUserId?: string; // If provided, link existing global user

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsArray()
    roleIds?: string[];
}

export class UpdateOrganisationUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsArray()
    roleIds?: string[];
}

export class CreateOrganisationRoleDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    permissionIds?: string[];
}

export class UpdateOrganisationRoleDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    permissionIds?: string[];
}