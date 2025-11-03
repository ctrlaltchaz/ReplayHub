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
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        // Check if user already exists in this org
        const existingUser = await this.prisma.orgUser.findUnique({
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
        const orgUser = await this.prisma.orgUser.create({
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

        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        // Find user
        const orgUser = await this.prisma.orgUser.findUnique({
            where: {
                tenantId_email: {
                    tenantId,
                    email: loginDto.email,
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

        // Extract roles and permissions
        const roles = orgUser.roles.map(ur => ur.role.name);
        const permissions = [...new Set(
            orgUser.roles.flatMap(ur =>
                ur.role.permissions.map(rp => rp.permission.key)
            )
        )] as string[];

        // TODO: Log successful login

        return {
            orgUser: {
                id: orgUser.id,
                email: orgUser.email,
                displayName: orgUser.displayName,
                isActive: orgUser.isActive,
                isTotpEnabled: orgUser.isTotpEnabled,
                roles,
                permissions,
                createdAt: orgUser.createdAt,
            },
        };
    }

    async getProfile(tenantId: string, orgUserId: string): Promise<OrgUserProfileDto> {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const orgUser = await this.prisma.orgUser.findUnique({
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
    }

    async setupTotp(tenantId: string, orgUserId: string, organisationName: string): Promise<TotpSetupDto> {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const orgUser = await this.prisma.orgUser.findUnique({
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
        await this.prisma.orgUser.update({
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
    }

    async verifyAndEnableTotp(tenantId: string, orgUserId: string, token: string): Promise<{ success: boolean }> {
        // Set tenant context for RLS
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const orgUser = await this.prisma.orgUser.findUnique({
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
        await this.prisma.orgUser.update({
            where: { id: orgUserId },
            data: {
                isTotpEnabled: true,
            },
        });

        return { success: true };
    }

    async validateOrgUser(tenantId: string, orgUserId: string): Promise<OrgUserProfileDto | null> {
        try {
            return await this.getProfile(tenantId, orgUserId);
        } catch {
            return null;
        }
    }
}