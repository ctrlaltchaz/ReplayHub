import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLiveGraphicDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
