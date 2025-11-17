import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Request } from 'express';
import { UnifiedSessionGuard } from './guards/unified-session.guard';
import { UniversalAuthService } from './universal-auth.service';

export class UniversalLoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsBoolean()
    @IsOptional()
    rememberMe?: boolean;
}

export class UniversalTotpVerifyDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    userType: 'global' | 'org';

    @IsString()
    @IsOptional()
    tenantSlug?: string;
}

export class RequestPasswordResetDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    newPassword: string;
}

export class VerifyResetTokenDto {
    @IsString()
    @IsNotEmpty()
    token: string;
}

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class UniversalAuthController {
    constructor(private universalAuthService: UniversalAuthService) { }

    @Post('universal-login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
    async universalLogin(
        @Body() loginDto: UniversalLoginDto,
        @Req() req: Request,
    ) {
        return await this.universalAuthService.universalLogin(loginDto, req);
    }

    @Post('universal-totp-verify')
    @HttpCode(HttpStatus.OK)
    async universalTotpVerify(
        @Body() verifyDto: UniversalTotpVerifyDto,
        @Req() req: Request,
    ) {
        return await this.universalAuthService.universalTotpVerify(verifyDto, req);
    }

    @UseGuards(UnifiedSessionGuard)
    @Get('session')
    async getSessionProfile(@Req() req: Request) {
        return await this.universalAuthService.getCurrentSessionProfile(req);
    }

    @Post('request-password-reset')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
    async requestPasswordReset(
        @Body() dto: RequestPasswordResetDto,
    ) {
        return await this.universalAuthService.requestPasswordReset(dto.email);
    }

    @Post('verify-reset-token')
    @HttpCode(HttpStatus.OK)
    async verifyResetToken(
        @Body() dto: VerifyResetTokenDto,
    ) {
        return await this.universalAuthService.verifyResetToken(dto.token);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Body() dto: ResetPasswordDto,
    ) {
        return await this.universalAuthService.resetPassword(dto.token, dto.newPassword);
    }
}
