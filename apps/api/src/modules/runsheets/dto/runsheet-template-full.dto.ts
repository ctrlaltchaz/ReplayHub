import { IsOptional, IsString } from 'class-validator';

export class CreateRunsheetTemplateDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    runsheetId: string;
}

export class UpdateRunsheetTemplateDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
