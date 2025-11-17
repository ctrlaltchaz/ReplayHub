import {
    BadRequestException,
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Patch,
    Post,
    Req,
    UnauthorizedException,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import * as QRCode from 'qrcode';
import { ChangeEmailDto, ChangePasswordDto, LoginDto, RegisterDto, UpdateProfileDto, VerifyEmailChangeDto, VerifyTotpDto } from './dto/auth.dto';
import { GlobalAuthService } from './global-auth.service';
import { SessionGuard } from './guards/session.guard';

@Controller('global/auth')
export class GlobalAuthController {
    constructor(private globalAuthService: GlobalAuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
        try {
            const user = await this.globalAuthService.register(registerDto);

            // Create session
            req.session.userId = user.id;

            return { message: 'Registration successful', user };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Req() req: Request) {
        try {
            const user = await this.globalAuthService.login(loginDto);

            // Create session
            req.session.userId = user.id;

            // Set cookie maxAge based on rememberMe
            if (loginDto.rememberMe) {
                // 30 days for remember me
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            } else {
                // 24 hours for regular login
                req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
            }

            // AUTO-LOGIN TO ORG: Check if user has org accounts and auto-set first org session
            const orgUsers = await this.globalAuthService.getOrgUsersForGlobalUser(user.id);
            if (orgUsers && orgUsers.length > 0) {
                const firstOrgUserWithOrg = orgUsers.find((account) => account.organisation);
                if (firstOrgUserWithOrg && firstOrgUserWithOrg.organisation) {
                    req.session.membershipId = firstOrgUserWithOrg.id;
                    req.session.orgTenant = firstOrgUserWithOrg.organisation.slug;
                }
            }

            // Save session before checking TOTP
            await new Promise<void>((resolve, reject) => {
                req.session.save((err) => {
                    if (err) {
                        console.error('[GlobalAuth/Login] Session save error:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            // Check if user has 2FA enabled
            if (user.isTotpEnabled) {
                req.session.requiresTotp = true;
                req.session.totpVerified = false;
                return {
                    message: 'Login successful, TOTP verification required',
                    requiresTotp: true,
                    user
                };
            }

            return { message: 'Login successful', user };
        } catch (error) {
            throw new UnauthorizedException(error.message);
        }
    }

    @Post('logout')
    async logout(@Req() req: Request) {
        return new Promise((resolve) => {
            req.session.destroy((err) => {
                if (err) {
                    throw new InternalServerErrorException('Could not log out');
                }
                resolve({ message: 'Logout successful' });
            });
        });
    }

    @UseGuards(SessionGuard)
    @Get('me')
    async getMe(@Req() req: Request) {
        const user = await this.globalAuthService.getUserById(req.session.userId!);
        return user;
    }

    @UseGuards(SessionGuard)
    @Post('totp/setup')
    async setupTotp(@Req() req: Request) {
        try {
            const { secret, otpauthUrl } = await this.globalAuthService.setupTotp(req.session.userId!);

            // Generate QR code
            const qrCode = await QRCode.toDataURL(otpauthUrl);

            return {
                message: 'TOTP setup initiated',
                secret,
                otpauthUrl,
                qrCode
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @UseGuards(SessionGuard)
    @Post('totp/verify-setup')
    async verifyTotpSetup(@Body() verifyTotpDto: VerifyTotpDto, @Req() req: Request) {
        try {
            await this.globalAuthService.verifyTotpSetup(req.session.userId!, verifyTotpDto.token);

            // Update session to reflect that user now has TOTP enabled
            req.session.requiresTotp = true;
            req.session.totpVerified = true;

            return { message: 'TOTP enabled successfully' };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post('totp/verify')
    async verifyTotp(@Body() verifyTotpDto: VerifyTotpDto, @Req() req: Request) {
        if (!req.session.userId) {
            throw new UnauthorizedException('Not logged in');
        }

        if (!req.session.requiresTotp) {
            throw new BadRequestException('TOTP verification not required');
        }

        try {
            await this.globalAuthService.verifyTotp(req.session.userId, verifyTotpDto.token);

            // Mark TOTP as verified for this session
            req.session.totpVerified = true;

            return { message: 'TOTP verified successfully' };
        } catch (error) {
            throw new UnauthorizedException(error.message);
        }
    }

    @UseGuards(SessionGuard)
    @Patch('profile')
    async updateProfile(@Body() updateProfileDto: UpdateProfileDto, @Req() req: Request) {
        try {
            const user = await this.globalAuthService.updateProfile(req.session.userId!, updateProfileDto);
            return user;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @UseGuards(SessionGuard)
    @Post('change-password')
    async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: Request) {
        try {
            await this.globalAuthService.changePassword(req.session.userId!, changePasswordDto);
            return { message: 'Password changed successfully' };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @UseGuards(SessionGuard)
    @Post('change-email')
    async requestEmailChange(@Body() changeEmailDto: ChangeEmailDto, @Req() req: Request) {
        try {
            const result = await this.globalAuthService.requestEmailChange(req.session.userId!, changeEmailDto.newEmail);
            return result;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @UseGuards(SessionGuard)
    @Post('verify-email-change')
    async verifyEmailChange(@Body() verifyEmailDto: VerifyEmailChangeDto, @Req() req: Request) {
        try {
            const result = await this.globalAuthService.verifyEmailChange(
                req.session.userId!,
                verifyEmailDto.newEmail,
                verifyEmailDto.code
            );
            return result;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @UseGuards(SessionGuard)
    @Post('avatar')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
        try {
            if (!file) {
                throw new BadRequestException('No file uploaded');
            }

            // Validate file type
            const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedMimes.includes(file.mimetype)) {
                throw new BadRequestException('Invalid file type. Only images are allowed.');
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                throw new BadRequestException('File too large. Maximum size is 5MB.');
            }

            const avatarUrl = await this.globalAuthService.uploadAvatar(req.session.userId!, file);
            return { url: avatarUrl };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @UseGuards(SessionGuard)
    @Post('switch-org')
    async switchOrg(@Body() body: { orgSlug: string }, @Req() req: Request) {
        try {
            const result = await this.globalAuthService.switchOrg(req.session.userId!, body.orgSlug, req);
            return result;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}