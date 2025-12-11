import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';
import { PrismaService } from '../../database/prisma.service';
import { OrgAuthLoginDto, OrgAuthRegisterDto, OrgUserProfileDto, TotpSetupDto } from './dto';

@Injectable()
export class OrgAuthService {
    constructor(private prisma: PrismaService) { }

    async register(tenantId: string, registerDto: OrgAuthRegisterDto, createdById: string): Promise<{ orgUser: Partial<OrgUserProfileDto> }> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Check if user already exists in this org
            const existingUser = await tx.orgUser.findUnique({
                where: {
                    tenantId_email: {
                        tenantId,
                        email: registerDto.email,
                    },
                },
            });

            if (existingUser) {
                throw new ConflictException('User already exists in this organisation');
            }

            // Hash password
            const passwordHash = await bcrypt.hash(registerDto.password, 12);

            // Create org user
            const orgUser = await tx.orgUser.create({
                data: {
                    tenantId,
                    email: registerDto.email,
                    passwordHash,
                    displayName: registerDto.displayName,
                },
            });

            return {
                orgUser: {
                    id: orgUser.id,
                    email: orgUser.email,
                    displayName: orgUser.displayName,
                    isActive: orgUser.isActive,
                    isTotpEnabled: orgUser.isTotpEnabled,
                    roles: [],
                    permissions: [],
                    createdAt: orgUser.createdAt,
                },
            };
        });
    }

    async login(tenantSlugOrId: string, loginDto: OrgAuthLoginDto): Promise<{ orgUser: OrgUserProfileDto }> {
        // Resolve tenant ID from slug if needed
        let tenantId = tenantSlugOrId;
        if (!tenantSlugOrId.startsWith('cmg')) { // CUID format check
            const org = await this.prisma.organisation.findUnique({
                where: { slug: tenantSlugOrId }
            });
            if (!org) {
                throw new UnauthorizedException('Invalid credentials');
            }
            tenantId = org.id;
        }

        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Find user for password verification (still using OrgUser for auth)
            const orgUser = await tx.orgUser.findUnique({
                where: {
                    tenantId_email: {
                        tenantId,
                        email: loginDto.email,
                    },
                },
            });

            if (!orgUser || !orgUser.isActive) {
                throw new UnauthorizedException('Invalid credentials');
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(loginDto.password, orgUser.passwordHash);
            if (!isValidPassword) {
                throw new UnauthorizedException('Invalid credentials');
            }

            // Check 2FA if enabled
            if (orgUser.isTotpEnabled) {
                if (!loginDto.totpToken) {
                    throw new BadRequestException('TOTP token required');
                }

                const isValidTotp = speakeasy.totp.verify({
                    secret: orgUser.totpSecret,
                    encoding: 'base32',
                    token: loginDto.totpToken,
                    window: 2,
                });

                if (!isValidTotp) {
                    throw new UnauthorizedException('Invalid TOTP token');
                }
            }

            // Find the corresponding membership
            // If orgUser has globalUserId, find membership by that
            // Otherwise, find by email (for legacy org-only users)
            let membership;
            if (orgUser.globalUserId) {
                membership = await tx.userOrganisationMembership.findUnique({
                    where: {
                        userId_tenantId: {
                            userId: orgUser.globalUserId,
                            tenantId,
                        },
                    },
                    include: {
                        roles: {
                            include: {
                                role: {
                                    include: {
                                        permissions: {
                                            include: {
                                                permission: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            } else {
                // Legacy: org-only user, find by email
                membership = await tx.userOrganisationMembership.findUnique({
                    where: {
                        tenantId_email: {
                            tenantId,
                            email: orgUser.email,
                        },
                    },
                    include: {
                        roles: {
                            include: {
                                role: {
                                    include: {
                                        permissions: {
                                            include: {
                                                permission: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            }

            if (!membership) {
                throw new UnauthorizedException('Membership not found - please contact support');
            }

            // Extract roles and permissions from membership (new system)
            const roles = membership.roles.map(mr => mr.role.name);
            const permissions = [...new Set(
                membership.roles.flatMap(mr =>
                    mr.role.permissions.map(rp => rp.permission.key)
                )
            )] as string[];

            // TODO: Log successful login

            return {
                orgUser: {
                    id: membership.id, // Return membership ID, not orgUser ID!
                    email: membership.email,
                    displayName: membership.displayName ?? orgUser.displayName,
                    isActive: membership.isActive,
                    isTotpEnabled: membership.isTotpEnabled,
                    roles,
                    permissions,
                    createdAt: orgUser.createdAt,
                },
            };
        });
    }

    async getProfile(tenantId: string, orgUserId: string): Promise<OrgUserProfileDto> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const orgUser = await tx.orgUser.findUnique({
                where: { id: orgUserId },
                include: {
                    roles: {
                        include: {
                            role: {
                                include: {
                                    permissions: {
                                        include: {
                                            permission: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!orgUser) {
                throw new UnauthorizedException('User not found');
            }

            // Extract roles and permissions
            const roles = orgUser.roles.map(ur => ur.role.name);
            const permissions = [...new Set(
                orgUser.roles.flatMap(ur =>
                    ur.role.permissions.map(rp => rp.permission.key)
                )
            )] as string[];

            return {
                id: orgUser.id,
                email: orgUser.email,
                displayName: orgUser.displayName,
                isActive: orgUser.isActive,
                isTotpEnabled: orgUser.isTotpEnabled,
                roles,
                permissions,
                createdAt: orgUser.createdAt,
            };
        });
    }

    async setupTotp(tenantId: string, orgUserId: string, organisationName: string): Promise<TotpSetupDto> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const orgUser = await tx.orgUser.findUnique({
                where: { id: orgUserId },
            });

            if (!orgUser) {
                throw new UnauthorizedException('User not found');
            }

            // Generate TOTP secret
            const secret = speakeasy.generateSecret({
                name: `${orgUser.email} (${organisationName})`,
                issuer: 'Esports Ops Platform',
                length: 32,
            });

            // Update user with TOTP secret (but don't enable yet)
            await tx.orgUser.update({
                where: { id: orgUserId },
                data: {
                    totpSecret: secret.base32,
                },
            });

            // Generate QR code
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

            return {
                secret: secret.base32,
                qrCodeUrl,
                manualEntryKey: secret.base32,
            };
        });
    }

    async verifyAndEnableTotp(tenantId: string, orgUserId: string, token: string): Promise<{ success: boolean }> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const orgUser = await tx.orgUser.findUnique({
                where: { id: orgUserId },
            });

            if (!orgUser || !orgUser.totpSecret) {
                throw new BadRequestException('TOTP setup required first');
            }

            // Verify TOTP token
            const isValid = speakeasy.totp.verify({
                secret: orgUser.totpSecret,
                encoding: 'base32',
                token,
                window: 2,
            });

            if (!isValid) {
                throw new BadRequestException('Invalid TOTP token');
            }

            // Enable TOTP
            await tx.orgUser.update({
                where: { id: orgUserId },
                data: {
                    isTotpEnabled: true,
                },
            });

            return { success: true };
        });
    }

    async validateOrgUser(tenantId: string, orgUserId: string): Promise<OrgUserProfileDto | null> {
        try {
            return await this.getProfile(tenantId, orgUserId);
        } catch {
            return null;
        }
    }

    /**
     * New membership-based profile method
     * Gets user profile from UserOrganisationMembership + roles
     */
    async getProfileFromMembership(tenantId: string, membershipId: string): Promise<OrgUserProfileDto> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const membership = await tx.userOrganisationMembership.findUnique({
                where: { id: membershipId },
                include: {
                    roles: {
                        include: {
                            role: {
                                include: {
                                    permissions: {
                                        include: {
                                            permission: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!membership) {
                throw new UnauthorizedException('Membership not found');
            }

            // Get roles and permissions from membership roles
            const roles = membership.roles.map(mr => mr.role.name);
            const permissions = [...new Set(
                membership.roles.flatMap(mr =>
                    mr.role.permissions.map(rp => rp.permission.key)
                )
            )] as string[];

            const profile = {
                id: membership.id,
                email: membership.email,
                displayName: membership.displayName ?? membership.email,
                isActive: membership.isActive,
                isTotpEnabled: membership.isTotpEnabled,
                roles,
                permissions,
                createdAt: membership.createdAt,
            };

            return profile;
        });
    }

    /**
     * Validate membership and return profile
     */
    async validateMembership(tenantId: string, membershipId: string): Promise<OrgUserProfileDto | null> {
        try {
            return await this.getProfileFromMembership(tenantId, membershipId);
        } catch {
            return null;
        }
    }
}

