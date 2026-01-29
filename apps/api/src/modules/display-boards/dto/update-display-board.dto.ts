import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateDisplayBoardDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(1000)
    @Max(30000)
    interval?: number;

    @IsOptional()
    @IsString()
    transition?: string;

    @IsOptional()
    @IsString()
    @IsIn(['active', 'inactive'])
    status?: string;
}
