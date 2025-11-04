import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';
import * as otplib from 'otplib';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { ChangePasswordDto, LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';

@Injectable()
export class GlobalAuthService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password } = registerDto;

        // Check if user already exists
        const existingUser = await this.prisma.globalUser.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const passwordHash = await argon2.hash(password);

        // Create user
        const user = await this.prisma.globalUser.create({
            data: {
                email,
                passwordHash,
            },
        });

        // Return user without password hash
        const { passwordHash: _, ...userResponse } = user;
        return userResponse;
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user
        const user = await this.prisma.globalUser.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await argon2.verify(user.passwordHash, password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Return user without password hash
        const { passwordHash: _, ...userResponse } = user;
        return userResponse;
    }

    async setupTotp(userId: string) {
        const user = await this.prisma.globalUser.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (user.isTotpEnabled) {
            throw new Error('TOTP already enabled');
        }

        // Generate TOTP secret
        const secret = otplib.authenticator.generateSecret();

        // Update user with TOTP secret (but not enabled yet)
        await this.prisma.globalUser.update({
            where: { id: userId },
            data: { totpSecret: secret },
        });

        // Generate otpauth URL for QR code
        const otpauthUrl = otplib.authenticator.keyuri(
            user.email,
            'Esports Ops Platform',
            secret
        );

        return { secret, otpauthUrl };
    }

    async verifyTotpSetup(userId: string, token: string) {
        const user = await this.prisma.globalUser.findUnique({
            where: { id: userId },
        });

        if (!user || !user.totpSecret) {
            throw new Error('TOTP setup not initiated');
        }

        const isValid = otplib.authenticator.verify({
            token,
            secret: user.totpSecret,
        });

        if (!isValid) {
            throw new Error('Invalid TOTP token');
        }

        // Enable TOTP
        await this.prisma.globalUser.update({
            where: { id: userId },
            data: { isTotpEnabled: true },
        });

        return { success: true };
    }

    async verifyTotp(userId: string, token: string) {
        const user = await this.prisma.globalUser.findUnique({
            where: { id: userId },
        });

        if (!user || !user.isTotpEnabled || !user.totpSecret) {
            throw new Error('TOTP not enabled');
        }

        const isValid = otplib.authenticator.verify({
            token,
            secret: user.totpSecret,
        });

        if (!isValid) {
            throw new Error('Invalid TOTP token');
        }

        return { success: true };
    }

    async getUserById(id: string) {
        const user = await this.prisma.globalUser.findUnique({
            where: { id },
        });

        if (!user) {
            return null;
        }

        // Return user without password hash
        const { passwordHash: _, ...userResponse } = user;
        return userResponse;
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
        const { name, email } = updateProfileDto;

        // If email is being changed, check if it's already taken
        if (email) {
            const existing = await this.prisma.globalUser.findUnique({
                where: { email },
            });

            if (existing && existing.id !== userId) {
                throw new Error('Email already in use');
            }
        }

        // Update user
        const user = await this.prisma.globalUser.update({
            where: { id: userId },
            data: {
                ...(name !== undefined && { name }),
                ...(email !== undefined && { email }),
            },
        });

        // Return user without password hash
        const { passwordHash: _, ...userResponse } = user;
        return userResponse;
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;

        // Get user
        const user = await this.prisma.globalUser.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password - support both bcrypt and argon2
        let isValidPassword = false;

        // Try bcrypt first (most common from universal-auth)
        if (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$')) {
            isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
        } else {
            // Try argon2
            try {
                isValidPassword = await argon2.verify(user.passwordHash, currentPassword);
            } catch (err) {
                isValidPassword = false;
            }
        }

        if (!isValidPassword) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password with argon2
        const newPasswordHash = await argon2.hash(newPassword);

        // Update password
        await this.prisma.globalUser.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });

        return { success: true };
    }

    async requestEmailChange(userId: string, newEmail: string) {
        // Check if new email is already in use
        const existingUser = await this.prisma.globalUser.findUnique({
            where: { email: newEmail },
        });

        if (existingUser && existingUser.id !== userId) {
            throw new Error('Email address is already in use');
        }

        // Generate 6-digit verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code in user record with expiration (10 minutes)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.prisma.globalUser.update({
            where: { id: userId },
            data: {
                pendingEmail: newEmail,
                emailVerificationCode: code,
                emailVerificationExpiry: expiresAt,
            },
        });

        // Send verification email to new address
        await this.emailService.sendEmailVerificationCode(newEmail, code);

        return { success: true, message: 'Verification code sent to new email address' };
    }

    async verifyEmailChange(userId: string, newEmail: string, code: string) {
        const user = await this.prisma.globalUser.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Check if pending email matches
        if (user.pendingEmail !== newEmail) {
            throw new Error('Email change request not found or expired');
        }

        // Check if code matches
        if (user.emailVerificationCode !== code) {
            throw new Error('Invalid verification code');
        }

        // Check if code has expired
        if (!user.emailVerificationExpiry || user.emailVerificationExpiry < new Date()) {
            throw new Error('Verification code has expired');
        }

        // Use transaction to update both global user and all linked org users
        await this.prisma.$transaction(async (tx) => {
            // Update global user email and clear verification fields
            await tx.globalUser.update({
                where: { id: userId },
                data: {
                    email: newEmail,
                    pendingEmail: null,
                    emailVerificationCode: null,
                    emailVerificationExpiry: null,
                },
            });

            // Update email in all linked org user accounts
            await tx.orgUser.updateMany({
                where: { globalUserId: userId },
                data: { email: newEmail },
            });
        });

        return { success: true, message: 'Email changed successfully' };
    }

    async uploadAvatar(userId: string, file: Express.Multer.File) {
        // For now, we'll just store a placeholder URL
        // In production, you would upload to S3/MinIO/CDN
        const fs = require('fs').promises;
        const path = require('path');

        // Use the same upload directory as configured in main.ts
        const uploadBaseDir = process.env.ASSET_UPLOAD_DIR || './data';
        const uploadsDir = path.join(uploadBaseDir, 'avatars');
        await fs.mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const ext = path.extname(file.originalname);
        const filename = `${userId}-${Date.now()}${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // Save file
        await fs.writeFile(filepath, file.buffer);

        // Generate relative URL (will be served as /uploads/avatars/filename)
        const avatarUrl = `/uploads/avatars/${filename}`;

        // Update user record
        await this.prisma.globalUser.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
        });

        return avatarUrl;
    }

    async switchOrg(globalUserId: string, orgSlug: string, req: any) {
        // Find the organization
        const org = await this.prisma.organisation.findUnique({
            where: { slug: orgSlug }
        });

        if (!org) {
            throw new Error('Organization not found');
        }

        // Find org_user for this global user in this org
        const orgUser = await this.prisma.orgUser.findFirst({
            where: {
                tenantId: org.id,
                globalUserId: globalUserId
            }
        });

        if (!orgUser) {
            throw new Error('You do not have access to this organization');
        }

        // Set session org context
        req.session.currentOrgId = org.id;
        req.session.currentOrgSlug = org.slug;
        req.session.currentOrgUserId = orgUser.id;

        return {
            message: 'Switched to organization',
            org: {
                id: org.id,
                slug: org.slug,
                name: org.name
            }
        };
    }
}