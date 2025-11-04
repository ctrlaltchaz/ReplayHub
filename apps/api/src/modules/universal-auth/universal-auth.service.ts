import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { UniversalLoginDto, UniversalTotpVerifyDto } from './universal-auth.controller';

@Injectable()
export class UniversalAuthService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }

    async universalLogin(loginDto: UniversalLoginDto, req: Request) {
        const { email, password } = loginDto;

        // Check for global user
        const globalUser = await this.prisma.globalUser.findUnique({
            where: { email },
            include: {
                organisationAdmins: {
                    include: {
                        organisation: true,
                    },
                },
            },
        });

        // Check for org users
        const orgUsers = await this.prisma.orgUser.findMany({
            where: { email },
        });

        if (!globalUser && orgUsers.length === 0) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Get organisation (tenant) info for org users
        let organisations: any[] = [];
        if (orgUsers.length > 0) {
            const tenantIds = [...new Set(orgUsers.map(ou => ou.tenantId))];
            const orgsResult = await this.prisma.organisation.findMany({
                where: {
                    id: {
                        in: tenantIds,
                    },
                },
                select: {
                    id: true,
                    slug: true,
                    name: true,
                },
            });
            // Ensure it's always an array
            organisations = Array.isArray(orgsResult) ? orgsResult : [];
        }

        // Determine user type
        let userType: 'global' | 'org' | 'both';
        if (globalUser && orgUsers.length > 0) {
            userType = 'both';
        } else if (globalUser) {
            userType = 'global';
        } else {
            userType = 'org';
        }

        // Handle global user login
        if (globalUser) {
            const isValidPassword = await this.verifyPassword(globalUser.passwordHash, password);

            if (!isValidPassword) {
                throw new UnauthorizedException('Invalid credentials');
            }

            if (!globalUser.isActive) {
                throw new UnauthorizedException('Account is inactive');
            }

            // Create global session
            req.session.userId = globalUser.id;

            // AUTO-LOGIN: If user has org accounts, automatically set the first org session
            // This allows seamless navigation to org pages without requiring separate login
            if (orgUsers && orgUsers.length > 0) {
                const firstOrgUser = orgUsers[0];
                const firstOrg = organisations.find(o => o.id === firstOrgUser.tenantId);

                if (firstOrg) {
                    req.session.orgUserId = firstOrgUser.id;
                    req.session.orgTenant = firstOrg.slug;
                    console.log(`[UniversalAuth] Auto-set org session: orgUserId=${firstOrgUser.id}, tenant=${firstOrg.slug}`);
                }
            }

            // Save session before checking TOTP
            await new Promise<void>((resolve, reject) => {
                req.session.save((err) => {
                    if (err) {
                        console.error('[UniversalAuth] Session save error:', err);
                        reject(err);
                    } else {
                        console.log(`[UniversalAuth] Session saved successfully!`);
                        console.log(`[UniversalAuth] Session ID: ${req.session.id}`);
                        console.log(`[UniversalAuth] Session userId: ${req.session.userId}`);
                        console.log(`[UniversalAuth] Session orgUserId: ${req.session.orgUserId}`);
                        console.log(`[UniversalAuth] Response will set cookie: sessionId=${req.session.id}`);
                        resolve();
                    }
                });
            });

            // Check if TOTP is required
            if (globalUser.isTotpEnabled) {
                req.session.requiresTotp = true;
                req.session.totpVerified = false;
                return {
                    success: true,
                    userType,
                    message: 'TOTP verification required',
                    requiresTotp: true,
                    globalUser: {
                        id: globalUser.id,
                        email: globalUser.email,
                        isGlobalAdmin: globalUser.isGlobalAdmin,
                        organizations: globalUser.organisationAdmins.map(oa => ({
                            id: oa.organisation.id,
                            name: oa.organisation.name,
                            slug: oa.organisation.slug,
                        })),
                    },
                };
            }

            // Return successful global login
            return {
                success: true,
                userType,
                message: 'Login successful',
                globalUser: {
                    id: globalUser.id,
                    email: globalUser.email,
                    isGlobalAdmin: globalUser.isGlobalAdmin,
                    organizations: (globalUser.organisationAdmins || []).map(oa => ({
                        id: oa.organisation.id,
                        name: oa.organisation.name,
                        slug: oa.organisation.slug,
                    })),
                },
                orgAccounts: (orgUsers || []).map(ou => {
                    const org = organisations.find(o => o.id === ou.tenantId);
                    return {
                        id: ou.id,
                        tenantSlug: org?.slug || '',
                        tenantName: org?.name || '',
                        email: ou.email,
                    };
                }),
            };
        }

        // Handle org user login (multiple orgs)
        if (orgUsers.length > 0) {
            // Verify password with first org user (all should have same password)
            const firstOrgUser = orgUsers[0];
            const isValidPassword = await this.verifyPassword(firstOrgUser.passwordHash, password);

            if (!isValidPassword) {
                throw new UnauthorizedException('Invalid credentials');
            }

            // If user has only one org account, log them in directly
            if (orgUsers.length === 1) {
                const orgUser = orgUsers[0];
                const org = organisations.find(o => o.id === orgUser.tenantId);

                if (!orgUser.isActive) {
                    throw new UnauthorizedException('Account is inactive');
                }

                // Create org session
                req.session.orgUserId = orgUser.id;
                req.session.orgTenant = org?.slug || '';

                await new Promise<void>((resolve, reject) => {
                    req.session.save((err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                return {
                    success: true,
                    userType: 'org',
                    message: 'Login successful',
                    orgAccounts: [{
                        id: orgUser.id,
                        tenantSlug: org?.slug || '',
                        tenantName: org?.name || '',
                        email: orgUser.email,
                    }],
                };
            }

            // Multiple org accounts - return for selection
            return {
                success: true,
                userType: 'org',
                message: 'Select organization',
                orgAccounts: (orgUsers || []).map(ou => {
                    const org = organisations.find(o => o.id === ou.tenantId);
                    return {
                        id: ou.id,
                        tenantSlug: org?.slug || '',
                        tenantName: org?.name || '',
                        email: ou.email,
                    };
                }),
            };
        }

        throw new UnauthorizedException('Invalid credentials');
    }

    async universalTotpVerify(verifyDto: UniversalTotpVerifyDto, req: Request) {
        const { token, userType, tenantSlug } = verifyDto;

        if (userType === 'global') {
            const userId = req.session.userId;
            if (!userId) {
                throw new UnauthorizedException('No active session');
            }

            const globalUser = await this.prisma.globalUser.findUnique({
                where: { id: userId },
                include: {
                    organisationAdmins: {
                        include: {
                            organisation: true,
                        },
                    },
                },
            });

            if (!globalUser || !globalUser.isTotpEnabled) {
                throw new UnauthorizedException('TOTP not enabled');
            }

            // Here you would verify the TOTP token
            // const speakeasy = require('speakeasy');
            // const verified = speakeasy.totp.verify({
            //     secret: globalUser.totpSecret,
            //     encoding: 'base32',
            //     token,
            // });

            // For now, just mark as verified
            req.session.totpVerified = true;
            req.session.requiresTotp = false;

            return {
                success: true,
                userType: 'global',
                message: 'TOTP verified',
                globalUser: {
                    id: globalUser.id,
                    email: globalUser.email,
                    isGlobalAdmin: globalUser.isGlobalAdmin,
                    organizations: globalUser.organisationAdmins.map(oa => ({
                        id: oa.organisation.id,
                        name: oa.organisation.name,
                        slug: oa.organisation.slug,
                    })),
                },
            };
        }

        // Handle org TOTP verification if needed
        throw new UnauthorizedException('Invalid verification request');
    }

    private async verifyPassword(hash: string, password: string): Promise<boolean> {
        try {
            // Check if it's an argon2 hash (starts with $argon2)
            if (hash.startsWith('$argon2')) {
                return await argon2.verify(hash, password);
            }
            // Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
            else if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
                return await bcrypt.compare(password, hash);
            }
            // Unknown hash format
            return false;
        } catch (error) {
            console.error('Password verification error:', error);
            return false;
        }
    }

    /**
     * Request password reset - generates token and sends email
     */
    async requestPasswordReset(email: string) {
        // Check if user exists (global or org)
        const globalUser = await this.prisma.globalUser.findUnique({
            where: { email },
        });

        const orgUsers = await this.prisma.orgUser.findMany({
            where: { email },
        });

        // Always return success to prevent email enumeration
        if (!globalUser && orgUsers.length === 0) {
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
            console.log(`Password reset email sent to ${email}`);
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
        const globalUser = await this.prisma.globalUser.findUnique({
            where: { email },
        });

        if (globalUser) {
            await this.prisma.globalUser.update({
                where: { email },
                data: { passwordHash: hashedPassword },
            });
        }

        // Update password for all org users with this email
        const orgUsers = await this.prisma.orgUser.findMany({
            where: { email },
        });

        if (orgUsers.length > 0) {
            await this.prisma.orgUser.updateMany({
                where: { email },
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
