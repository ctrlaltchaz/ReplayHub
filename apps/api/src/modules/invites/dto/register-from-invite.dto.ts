import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterFromInviteDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
}
