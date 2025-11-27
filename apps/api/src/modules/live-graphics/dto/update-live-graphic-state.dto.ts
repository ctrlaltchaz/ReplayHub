import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLiveGraphicStateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  leftName?: string;

  @IsOptional()
  @IsString()
  rightName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  leftScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rightScore?: number;

  @IsOptional()
  @IsString()
  statusText?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsObject()
  extra?: Record<string, any>;
}
