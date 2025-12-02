import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as otplib from 'otplib';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { UnifiedUserService } from '../users/unified-user.service';
import { ChangePasswordDto, LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';

@Injectable()
export class GlobalAuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private unifiedUsers: UnifiedUserService
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const { globalAccount } = await this.unifiedUsers.getAccountsByEmail(email);

    if (globalAccount) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create user
    const created = await this.prisma.globalUser.create({
      data: {
        email,
        passwordHash,
      },
    });

    const account = await this.unifiedUsers.getGlobalAccountById(created.id);
    if (!account) {
      throw new Error('User registration failed to load account');
    }

    const { passwordHash: _, ...userResponse } = account;
    return userResponse;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const { globalAccount } = await this.unifiedUsers.getAccountsByEmail(email);

    if (!globalAccount) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await this.unifiedUsers.verifyPassword(
      globalAccount.passwordHash,
      password
    );
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Return user without password hash
    const { passwordHash: _, ...userResponse } = globalAccount;
    return userResponse;
  }

  async setupTotp(userId: string) {
    const user = await this.unifiedUsers.getGlobalAccountById(userId);
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
    const otpauthUrl = otplib.authenticator.keyuri(user.email, 'Esports Ops Platform', secret);

    return { secret, otpauthUrl };
  }

  async verifyTotpSetup(userId: string, token: string) {
    const user = await this.unifiedUsers.getGlobalAccountById(userId);

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
    const user = await this.unifiedUsers.getGlobalAccountById(userId);

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
    const account = await this.unifiedUsers.getGlobalAccountById(id);

    if (!account) {
      return null;
    }

    // Return user without password hash
    const { passwordHash: _, ...userResponse } = account;
    return userResponse;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const { name, email } = updateProfileDto;

    // If email is being changed, check if it's already taken
    if (email) {
      const { globalAccount: existing } = await this.unifiedUsers.getAccountsByEmail(email);
      if (existing && existing.id !== userId) {
        throw new Error('Email already in use');
      }
    }

    // Update user
    await this.prisma.globalUser.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
      },
    });

    const updatedAccount = await this.unifiedUsers.getGlobalAccountById(userId);
    if (!updatedAccount) {
      throw new Error('User not found');
    }

    const { passwordHash: _, ...userResponse } = updatedAccount;
    return userResponse;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    // Get user
    const user = await this.unifiedUsers.getGlobalAccountById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await this.unifiedUsers.verifyPassword(
      user.passwordHash,
      currentPassword
    );

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
    const { globalAccount: existing } = await this.unifiedUsers.getAccountsByEmail(newEmail);

    if (existing && existing.id !== userId) {
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
    const user = await this.unifiedUsers.getGlobalAccountById(userId);

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
    await this.prisma.$transaction(async tx => {
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
      where: { slug: orgSlug },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    // Find org_user for this global user in this org
    const orgAccounts = await this.unifiedUsers.getOrgAccountsForGlobalUser(globalUserId);
    const orgAccount = orgAccounts.find(account => account.organisation?.id === org.id);

    if (!orgAccount) {
      throw new Error('You do not have access to this organization');
    }

    // Set session org context - using same keys as universal login
    req.session.membershipId = orgAccount.id;
    req.session.orgTenant = org.slug;

    console.log(
      `[GlobalAuth] Switched org session: membershipId=${orgAccount.id}, tenant=${org.slug}`
    );

    // Save session explicitly
    await new Promise<void>((resolve, reject) => {
      req.session.save(err => {
        if (err) {
          console.error('[GlobalAuth] Session save failed:', err);
          reject(err);
        } else {
          console.log('[GlobalAuth] Session saved successfully');
          resolve();
        }
      });
    });

    return {
      message: 'Switched to organization',
      org: {
        id: org.id,
        slug: org.slug,
        name: org.name,
      },
    };
  }

  async getOrgUsersForGlobalUser(globalUserId: string) {
    return this.unifiedUsers.getOrgAccountsForGlobalUser(globalUserId);
  }

  // Quick Login PIN Methods
  async setupQuickLoginPin(userId: string, pin: string, currentPassword: string, deviceId: string) {
    // Verify current password
    const user = await this.prisma.globalUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const valid = await this.unifiedUsers.verifyPassword(user.passwordHash, currentPassword);
    if (!valid) {
      throw new Error('Invalid password');
    }

    // Hash the PIN
    const pinHash = await argon2.hash(pin);

    // Update user with PIN (works on all devices)
    await this.prisma.globalUser.update({
      where: { id: userId },
      data: {
        quickLoginPinHash: pinHash,
        quickLoginEnabled: true,
      },
    });

    return { message: 'Quick login PIN enabled successfully on all devices' };
  }

  async verifyQuickLoginPin(pin: string, email: string) {
    // Find user by email
    const user = await this.prisma.globalUser.findFirst({
      where: {
        email: email,
        quickLoginEnabled: true,
        isActive: true,
      },
    });

    if (!user || !user.quickLoginPinHash) {
      throw new Error('Quick login not enabled for this account');
    }

    // Verify PIN
    const valid = await argon2.verify(user.quickLoginPinHash, pin);
    if (!valid) {
      throw new Error('Invalid PIN');
    }

    // Return user info for login
    const account = await this.unifiedUsers.getGlobalAccountById(user.id);
    if (!account) {
      throw new Error('User account not found');
    }

    const { passwordHash: _, quickLoginPinHash: __, ...userResponse } = account;
    return userResponse;
  }

  async disableQuickLoginPin(userId: string, currentPassword: string) {
    // Verify current password
    const user = await this.prisma.globalUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const valid = await this.unifiedUsers.verifyPassword(user.passwordHash, currentPassword);
    if (!valid) {
      throw new Error('Invalid password');
    }

    // Disable PIN
    await this.prisma.globalUser.update({
      where: { id: userId },
      data: {
        quickLoginPinHash: null,
        quickLoginEnabled: false,
        quickLoginDeviceId: null,
      },
    });

    return { message: 'Quick login PIN disabled successfully' };
  }

  async checkQuickLoginAvailable(email: string) {
    const user = await this.prisma.globalUser.findFirst({
      where: {
        email: email,
        quickLoginEnabled: true,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        quickLoginEnabled: true,
      },
    });

    return {
      available: !!user,
      user: user
        ? {
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          }
        : null,
    };
  }
}
