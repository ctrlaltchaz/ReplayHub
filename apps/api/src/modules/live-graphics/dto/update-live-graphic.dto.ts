import { IsOptional, IsString } from 'class-validator';

export class UpdateLiveGraphicDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
