import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsObject()
    branding?: {
        logo?: string;
        logoUrl?: string; // Full URL for logo
        theme?: string; // Theme preset name (e.g., 'default', 'dark', 'blue', 'purple')
        primaryColor?: string; // Main brand color
        secondaryColor?: string; // Secondary brand color
        accentColor?: string; // Accent/highlight color
        backgroundColor?: string; // Background color
        sidebarColor?: string; // Sidebar background
        textColor?: string; // Primary text color
    };
}
