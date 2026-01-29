import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateDisplayBoardDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

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
}
