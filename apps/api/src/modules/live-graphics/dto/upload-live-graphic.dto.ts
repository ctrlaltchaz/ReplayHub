import { IsNotEmpty, IsString } from 'class-validator';

export class UploadLiveGraphicDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
