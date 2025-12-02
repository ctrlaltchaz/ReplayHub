import { IsString, Length, Matches } from 'class-validator';

export class SetupPinDto {
  @IsString()
  @Length(4, 6)
  @Matches(/^[0-9]+$/, { message: 'PIN must contain only numbers' })
  pin: string;

  @IsString()
  currentPassword: string;
}

export class VerifyPinDto {
  @IsString()
  @Length(4, 6)
  @Matches(/^[0-9]+$/, { message: 'PIN must contain only numbers' })
  pin: string;

  @IsString()
  deviceId: string;
}

export class DisablePinDto {
  @IsString()
  currentPassword: string;
}
