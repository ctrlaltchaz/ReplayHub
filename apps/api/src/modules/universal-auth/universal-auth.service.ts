import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { UnifiedUserProfile } from '../users/dto/unified-user.dto';
import { UnifiedGlobalAccount, UnifiedOrgAccount, UnifiedUserService } from '../users/unified-user.service';
import { UniversalLoginDto, UniversalTotpVerifyDto } from './universal-auth.controller';

@Injectable()
export class UniversalAuthService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
        private unifiedUsers: UnifiedUserService,
    ) { }

    async universalLogin(loginDto: UniversalLoginDto, req: Request) {
        const { email, password, rememberMe } = loginDto;

        console.log('[UniversalAuth] Login attempt for:', email);
        const { globalAccount, orgAccounts } = await this.unifiedUsers.getAccountsByEmail(email);
        console.log('[UniversalAuth] Found globalAccount:', !!globalAccount, 'orgAccounts:', orgAccounts.length);

        if (!globalAccount && orgAccounts.length === 0) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const organisationMap = new Map(
            orgAccounts
                .filter((account) => account.organisation)
                .map((account) => [account.organisation!.id, account.organisation!]),
        );

        let userType: 'global' | 'org' | 'both';
        if (globalAccount && orgAccounts.length > 0) {
            userType = 'both';
        } else if (globalAccount) {
            userType = 'global';
        } else {
            userType = 'org';
        }

        if (globalAccount) {
            console.log('[UniversalAuth] Verifying password for global account');
            const isValidPassword = await this.unifiedUsers.verifyPassword(globalAccount.passwordHash, password);
            console.log('[UniversalAuth] Password valid:', isValidPassword);

            if (!isValidPassword) {
                throw new UnauthorizedException('Invalid credentials');
            }

            if (!globalAccount.isActive) {
                throw new UnauthorizedException('Account is inactive');
            }

            req.session.userId = globalAccount.id;

            // Set cookie maxAge based on rememberMe
            if (rememberMe) {
                // 30 days for remember me
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            } else {
                // 24 hours for regular login
                req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
            }

            if (orgAccounts.length > 0) {
                const firstOrgUser = orgAccounts[0];
                const firstOrg = firstOrgUser.organisation ?? organisationMap.get(firstOrgUser.tenantId);

                if (firstOrg) {
                    req.session.membershipId = firstOrgUser.id;
                    req.session.orgTenant = firstOrg.slug;
                }
            }

            await new Promise<void>((resolve, reject) => {
                req.session.save((err) => {
                    if (err) {
                        console.error('[UniversalAuth] Session save error:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            const profile = this.unifiedUsers.buildUnifiedProfile({
                globalAccount,
                orgAccounts,
                activeMembershipId: req.session.membershipId,
            });

            if (globalAccount.isTotpEnabled) {
                req.session.requiresTotp = true;
                req.session.totpVerified = false;
                return {
                    success: true,
                    userType,
                    message: 'TOTP verification required',
                    requiresTotp: true,
                    user: profile,
                    globalUser: {
                        id: globalAccount.id,
                        email: globalAccount.email,
                        isGlobalAdmin: globalAccount.isGlobalAdmin,
                        organizations: globalAccount.organisations,
                    },
                    orgAccounts: profile.memberships.map((membership) => ({
                        id: membership.membershipId,
                        tenantSlug: membership.tenantSlug,
                        tenantName: membership.tenantName,
                        email: membership.email,
                    })),
                };
            }

            return {
                success: true,
                userType,
                message: 'Login successful',
                user: profile,
                globalUser: {
                    id: globalAccount.id,
                    email: globalAccount.email,
                    isGlobalAdmin: globalAccount.isGlobalAdmin,
                    organizations: globalAccount.organisations,
                },
                orgAccounts: profile.memberships.map((membership) => ({
                    id: membership.membershipId,
                    tenantSlug: membership.tenantSlug,
                    tenantName: membership.tenantName,
                    email: membership.email,
                })),
            };
        }

        if (orgAccounts.length > 0) {
            const firstOrgUser = orgAccounts[0];
            const isValidPassword = await this.unifiedUsers.verifyPassword(firstOrgUser.passwordHash, password);

            if (!isValidPassword) {
                throw new UnauthorizedException('Invalid credentials');
            }

            if (orgAccounts.length === 1) {
                const orgUser = orgAccounts[0];
                const org = orgUser.organisation ?? organisationMap.get(orgUser.tenantId);

                if (!orgUser.isActive) {
                    throw new UnauthorizedException('Account is inactive');
                }

                req.session.membershipId = orgUser.id;
                req.session.orgTenant = org?.slug || '';

                await new Promise<void>((resolve, reject) => {
                    req.session.save((err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                const profile = this.unifiedUsers.buildUnifiedProfile({
                    globalAccount,
                    orgAccounts,
                    activeMembershipId: req.session.membershipId,
                });

                return {
                    success: true,
                    userType: 'org',
                    message: 'Login successful',
                    user: profile,
                    orgAccounts: profile.memberships.map((membership) => ({
                        id: membership.membershipId,
                        tenantSlug: membership.tenantSlug,
                        tenantName: membership.tenantName,
                        email: membership.email,
                    })),
                };
            }

            const profile = this.unifiedUsers.buildUnifiedProfile({
                globalAccount,
                orgAccounts,
                activeMembershipId: req.session.membershipId,
            });

            return {
                success: true,
                userType: 'org',
                message: 'Select organization',
                user: profile,
                orgAccounts: profile.memberships.map((membership) => ({
                    id: membership.membershipId,
                    tenantSlug: membership.tenantSlug,
                    tenantName: membership.tenantName,
                    email: membership.email,
                })),
            };
        }

        throw new UnauthorizedException('Invalid credentials');
    }

    async universalTotpVerify(verifyDto: UniversalTotpVerifyDto, req: Request) {
        const { token, userType } = verifyDto;

        if (userType === 'global') {
            const userId = req.session.userId;
            if (!userId) {
                throw new UnauthorizedException('No active session');
            }

            const globalAccount = await this.unifiedUsers.getGlobalAccountById(userId);

            if (!globalAccount || !globalAccount.isTotpEnabled) {
                throw new UnauthorizedException('TOTP not enabled');
            }

            req.session.totpVerified = true;
            req.session.requiresTotp = false;

            const { orgAccounts } = await this.unifiedUsers.getAccountsByEmail(globalAccount.email);
            const profile = this.unifiedUsers.buildUnifiedProfile({
                globalAccount,
                orgAccounts,
                activeMembershipId: req.session.membershipId,
            });

            return {
                success: true,
                userType: 'global',
                message: 'TOTP verified',
                user: profile,
                globalUser: {
                    id: globalAccount.id,
                    email: globalAccount.email,
                    isGlobalAdmin: globalAccount.isGlobalAdmin,
                    organizations: globalAccount.organisations,
                },
                orgAccounts: profile.memberships.map((membership) => ({
                    id: membership.membershipId,
                    tenantSlug: membership.tenantSlug,
                    tenantName: membership.tenantName,
                    email: membership.email,
                })),
            };
        }

        throw new UnauthorizedException('Invalid verification request');
    }

    /**
     * Request password reset - generates token and sends email
     */
    async getCurrentSessionProfile(req: Request): Promise<UnifiedUserProfile> {
        const { userId, membershipId } = req.session;

        let globalAccount: UnifiedGlobalAccount | null = null;
        let orgAccounts: UnifiedOrgAccount[] = [];

        if (userId) {
            globalAccount = await this.unifiedUsers.getGlobalAccountById(userId);
            if (globalAccount) {
                orgAccounts = await this.unifiedUsers.getOrgAccountsForGlobalUser(userId);
            }
        }

        if (membershipId) {
            const orgAccount = await this.unifiedUsers.getOrgAccountById(membershipId);
            if (orgAccount) {
                const merged = new Map<string, UnifiedOrgAccount>();
                orgAccounts.forEach((account) => merged.set(account.id, account));
                merged.set(orgAccount.id, orgAccount);

                if (!globalAccount && orgAccount.parentGlobalUserId) {
                    const parentGlobal = await this.unifiedUsers.getGlobalAccountById(orgAccount.parentGlobalUserId);
                    if (parentGlobal) {
                        globalAccount = parentGlobal;
                        const linkedAccounts = await this.unifiedUsers.getOrgAccountsForGlobalUser(parentGlobal.id);
                        linkedAccounts.forEach((account) => merged.set(account.id, account));
                    }
                }

                orgAccounts = Array.from(merged.values());
            }
        }

        if (!globalAccount && orgAccounts.length === 0) {
            throw new UnauthorizedException('No active session');
        }

        return this.unifiedUsers.buildUnifiedProfile({
            globalAccount,
            orgAccounts,
            activeMembershipId: membershipId,
        });
    }

    /**
     * Request password reset - generates token and sends email
     */
    async requestPasswordReset(email: string) {
        // Check if user exists (global or org)
        // Always return success to prevent email enumeration
        const { globalAccount, orgAccounts } = await this.unifiedUsers.getAccountsByEmail(email);

        if (!globalAccount && orgAccounts.length === 0) {
            return {
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.',
            };
        }

        // Generate secure random token
        const token = crypto.randomBytes(32).toString('hex');

        // Token expires in 1 hour
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // Store token in database
        await this.prisma.passwordResetToken.create({
            data: {
                token,
                email,
                expiresAt,
                used: false,
            },
        });

        // Send password reset email
        try {
            await this.emailService.sendPasswordResetEmail(email, token);
        } catch (error) {
            console.error(`Failed to send password reset email to ${email}:`, error);
            // Don't throw error to prevent email enumeration
        }

        return {
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
            // Include link in dev mode for testing
            ...(process.env.NODE_ENV === 'development' && {
                resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`
            }),
        };
    }

    /**
     * Verify reset token is valid
     */
    async verifyResetToken(token: string) {
        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        if (resetToken.used) {
            throw new UnauthorizedException('This reset token has already been used');
        }

        if (new Date() > resetToken.expiresAt) {
            throw new UnauthorizedException('This reset token has expired');
        }

        return {
            success: true,
            email: resetToken.email,
        };
    }

    /**
     * Reset password using valid token
     */
    async resetPassword(token: string, newPassword: string) {
        // Verify token is valid
        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        if (resetToken.used) {
            throw new UnauthorizedException('This reset token has already been used');
        }

        if (new Date() > resetToken.expiresAt) {
            throw new UnauthorizedException('This reset token has expired');
        }

        const { email } = resetToken;

        // Hash the new password with argon2
        const hashedPassword = await argon2.hash(newPassword);

        // Update password for global user if exists
        // Update password for all org users with this email
        const { globalAccount, orgAccounts } = await this.unifiedUsers.getAccountsByEmail(email);

        if (globalAccount) {
            await this.prisma.globalUser.update({
                where: { id: globalAccount.id },
                data: { passwordHash: hashedPassword },
            });
        }

        if (orgAccounts.length > 0) {
            await this.prisma.orgUser.updateMany({
                where: {
                    id: {
                        in: orgAccounts.map((account) => account.id),
                    },
                },
                data: { passwordHash: hashedPassword },
            });
        }

        // Mark token as used
        await this.prisma.passwordResetToken.update({
            where: { token },
            data: { used: true },
        });

        return {
            success: true,
            message: 'Password has been reset successfully',
        };
    }
}
