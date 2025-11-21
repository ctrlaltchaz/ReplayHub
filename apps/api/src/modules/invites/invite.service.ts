import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { AcceptInviteDto, CreateInviteDto, InviteListDto } from './dto';
import { InviteMethod } from './dto/create-invite.dto';
import { RegisterFromInviteDto } from './dto/register-from-invite.dto';

@Injectable()
export class InviteService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async createInvite(
    tenantId: string,
    createInviteDto: CreateInviteDto,
    invitedById: string
  ): Promise<{ invite: InviteListDto; token: string }> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      // Default to EMAIL method if not specified
      const method = createInviteDto.method || InviteMethod.EMAIL;

      // Validate email is provided for EMAIL method
      if (method === InviteMethod.EMAIL && !createInviteDto.email) {
        throw new BadRequestException('Email is required for EMAIL invite method');
      }

      // Check if user already exists in this org (only for EMAIL method)
      if (method === InviteMethod.EMAIL && createInviteDto.email) {
        const existingUser = await tx.orgUser.findUnique({
          where: {
            tenantId_email: {
              tenantId,
              email: createInviteDto.email,
            },
          },
        });

        if (existingUser) {
          throw new ConflictException('User already exists in this organisation');
        }

        // Check if there's already a pending invite
        const existingInvite = await tx.orgInvite.findFirst({
          where: {
            tenantId,
            email: createInviteDto.email,
            acceptedAt: null,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

        if (existingInvite) {
          throw new ConflictException('Pending invite already exists for this email');
        }
      }

      // Validate roles exist
      const roles = await tx.role.findMany({
        where: {
          tenantId,
          name: { in: createInviteDto.roles },
        },
      });

      if (roles.length !== createInviteDto.roles.length) {
        const foundRoles = roles.map(r => r.name);
        const missingRoles = createInviteDto.roles.filter(role => !foundRoles.includes(role));
        throw new BadRequestException(`Invalid roles: ${missingRoles.join(', ')}`);
      }

      // Generate secure invite token (URL-safe)
      const token = crypto.randomBytes(32).toString('base64url');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Create invite
      const invite = await tx.orgInvite.create({
        data: {
          tenantId,
          email: createInviteDto.email || null,
          inviteMethod: method as any,
          invitedById,
          rolesJson: createInviteDto.roles,
          token,
          tokenHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Get inviter and organization info
      const inviter = await tx.orgUser.findUnique({
        where: { id: invitedById },
        select: { displayName: true },
      });

      const org = await tx.organisation.findUnique({
        where: { id: tenantId },
        select: {
          name: true,
          branding: true,
        },
      });

      // Send email if method is EMAIL (after transaction completes)
      setImmediate(() => {
        if (method === InviteMethod.EMAIL && createInviteDto.email) {
          (async () => {
            try {
              const branding = org?.branding as any;
              const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${token}`;

              // Build full URL for logo if it's a relative path
              let logoUrl = branding?.logoUrl || branding?.logo;
              if (logoUrl && logoUrl.startsWith('/')) {
                const apiUrl =
                  process.env.API_URL ||
                  process.env.FRONTEND_URL?.replace('app.', 'api.') ||
                  'http://localhost:3001';
                logoUrl = `${apiUrl}${logoUrl}`;
              }

              await this.emailService.sendInviteEmail({
                to: createInviteDto.email,
                organizationName: org?.name || 'Organization',
                organizationLogo: logoUrl,
                inviterName: inviter?.displayName || 'Team Member',
                roles: createInviteDto.roles,
                inviteUrl,
                expiresAt: invite.expiresAt,
              });
            } catch (error) {
              console.error('Failed to send invite email:', error);
              // Don't throw - invite was created successfully, email is best-effort
            }
          })();
        }
      });

      return {
        invite: {
          id: invite.id,
          email: invite.email || 'Link Invite',
          roles: invite.rolesJson as string[],
          invitedBy: inviter?.displayName || 'Unknown',
          expiresAt: invite.expiresAt,
          createdAt: invite.createdAt,
        },
        token, // Return raw token for link generation
      };
    });
  }

  async getPendingInvites(tenantId: string): Promise<InviteListDto[]> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const invites = await tx.orgInvite.findMany({
        where: {
          tenantId,
          acceptedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get inviter display names
      const inviterIds = [...new Set(invites.map(invite => invite.invitedById))];
      const inviters = await tx.orgUser.findMany({
        where: {
          id: { in: inviterIds },
        },
        select: {
          id: true,
          displayName: true,
        },
      });

      const inviterMap = new Map(inviters.map(inviter => [inviter.id, inviter.displayName]));

      return invites.map(invite => ({
        id: invite.id,
        email: invite.email,
        token: invite.token, // Include token for LINK invites
        inviteMethod: (invite as any).inviteMethod,
        roles: invite.rolesJson as string[],
        invitedBy: inviterMap.get(invite.invitedById) || 'Unknown',
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
      }));
    });
  }

  async getInviteInfo(token: string): Promise<{
    organizationName: string;
    organizationSlug: string;
    organizationLogo?: string;
    roles: string[];
    email?: string;
    expiresAt: Date;
    isValid: boolean;
  }> {
    // Find invite by plain token
    const invite = await this.prisma.orgInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    // Check if expired
    const isExpired = invite.expiresAt < new Date();
    const isAccepted = !!invite.acceptedAt;

    if (isExpired || isAccepted) {
      return {
        organizationName: '',
        organizationSlug: '',
        roles: [],
        expiresAt: invite.expiresAt,
        isValid: false,
      };
    }

    // Get organization info (without RLS context)
    const org = await this.prisma.organisation.findUnique({
      where: { id: invite.tenantId },
      select: {
        name: true,
        slug: true,
        branding: true,
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    // Extract logo from branding
    const branding = org.branding as any;
    const logoUrl = branding?.logoUrl || branding?.logo;

    return {
      organizationName: org.name,
      organizationSlug: org.slug,
      organizationLogo: logoUrl,
      roles: invite.rolesJson as string[],
      email: invite.email || undefined,
      expiresAt: invite.expiresAt,
      isValid: true,
    };
  }

  async acceptInvite(
    orgSlugOrTenantId: string,
    acceptInviteDto: AcceptInviteDto
  ): Promise<{ orgUser: { id: string; email: string; displayName: string } }> {
    // Resolve tenant ID from org slug if needed
    let tenantId = orgSlugOrTenantId;
    if (!orgSlugOrTenantId.startsWith('cmg')) {
      // Not a CUID, assume it's a slug
      const org = await this.prisma.organisation.findUnique({
        where: { slug: orgSlugOrTenantId },
      });
      if (!org) {
        throw new NotFoundException('Organisation not found');
      }
      tenantId = org.id;
    }

    return await this.prisma.$transaction(async tx => {
      // Set tenant context
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      // Hash the token to find the invite
      const tokenHash = crypto.createHash('sha256').update(acceptInviteDto.token).digest('hex');

      const invite = await tx.orgInvite.findFirst({
        where: {
          tenantId,
          tokenHash,
          acceptedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!invite) {
        throw new NotFoundException('Invalid or expired invite token');
      }

      // Check if org user already exists
      const existingUser = await tx.orgUser.findUnique({
        where: {
          tenantId_email: {
            tenantId,
            email: invite.email,
          },
        },
      });

      if (existingUser) {
        throw new ConflictException('User already exists in this organisation');
      }

      // Get roles to assign
      const roleNames = invite.rolesJson as string[];
      const roles = await tx.role.findMany({
        where: {
          tenantId,
          name: { in: roleNames },
        },
      });

      if (roles.length !== roleNames.length) {
        throw new BadRequestException('Some roles no longer exist');
      }

      // Validate password strength
      this.validatePasswordStrength(acceptInviteDto.password);

      // Hash password
      const passwordHash = await bcrypt.hash(acceptInviteDto.password, 12);

      // Ensure a global user exists (needed for unified sessions/memberships)
      let globalUser = await tx.globalUser.findUnique({
        where: { email: invite.email },
      });

      if (!globalUser) {
        globalUser = await tx.globalUser.create({
          data: {
            email: invite.email,
            passwordHash,
            name: acceptInviteDto.displayName,
            isActive: true,
          },
        });
      }

      // Create org user and link to global user
      const orgUser = await tx.orgUser.create({
        data: {
          tenantId,
          email: invite.email,
          passwordHash,
          displayName: acceptInviteDto.displayName,
          globalUserId: globalUser.id,
          isActive: true,
        },
      });

      // Assign roles to org user (legacy)
      if (roles.length > 0) {
        await tx.orgUserRole.createMany({
          data: roles.map(role => ({
            tenantId,
            orgUserId: orgUser.id,
            roleId: role.id,
          })),
        });
      }

      // Create membership for unified auth/session + assign membership roles
      const membership = await tx.userOrganisationMembership.create({
        data: {
          tenantId,
          userId: globalUser.id,
          email: invite.email,
          displayName: acceptInviteDto.displayName,
          isActive: true,
        },
      });

      if (roles.length > 0) {
        await tx.membershipRole.createMany({
          data: roles.map(role => ({
            tenantId,
            membershipId: membership.id,
            roleId: role.id,
          })),
        });
      }

      // Mark invite as accepted
      await tx.orgInvite.update({
        where: { id: invite.id },
        data: {
          acceptedAt: new Date(),
          acceptedById: globalUser.id,
        },
      });

      return {
        orgUser: {
          id: orgUser.id,
          email: orgUser.email,
          displayName: orgUser.displayName,
        },
      };
    });
  }

  async revokeInvite(tenantId: string, inviteId: string): Promise<{ success: boolean }> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const invite = await tx.orgInvite.findFirst({
        where: {
          id: inviteId,
          tenantId,
          acceptedAt: null,
        },
      });

      if (!invite) {
        throw new NotFoundException('Invite not found or already accepted');
      }

      await tx.orgInvite.delete({
        where: { id: inviteId },
      });

      return { success: true };
    });
  }

  async registerFromInvite(
    token: string,
    registerDto: RegisterFromInviteDto
  ): Promise<{
    globalUser: { id: string; email: string; name: string };
    orgUser: { id: string; email: string; displayName: string };
    organization: { id: string; name: string; slug: string };
  }> {
    // Find invite by plain token
    const invite = await this.prisma.orgInvite.findUnique({
      where: { token },
      include: {
        organisation: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    // Check if expired
    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    // Check if already accepted
    if (invite.acceptedAt) {
      throw new BadRequestException('Invite has already been accepted');
    }

    // For EMAIL invites, verify the email matches
    if (invite.inviteMethod === InviteMethod.EMAIL && invite.email !== registerDto.email) {
      throw new BadRequestException('Email does not match the invited email');
    }

    const tenantId = invite.tenantId;

    // Check if user already exists in this organization (outside transaction)
    const existingOrgUser = await this.prisma.orgUser.findFirst({
      where: {
        tenantId,
        email: registerDto.email,
      },
    });

    if (existingOrgUser) {
      throw new ConflictException('User already exists in this organization');
    }

    // Check if global user exists with this email
    let globalUser = await this.prisma.globalUser.findUnique({
      where: { email: registerDto.email },
    });

    // Validate password strength
    this.validatePasswordStrength(registerDto.password);

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    // Create user accounts and accept invite in transaction
    const result = await this.prisma.$transaction(async tx => {
      // Create or use existing global user
      if (!globalUser) {
        globalUser = await tx.globalUser.create({
          data: {
            email: registerDto.email,
            passwordHash,
            name: registerDto.name,
            isActive: true,
          },
        });
      }

      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      // Create org user
      const orgUser = await tx.orgUser.create({
        data: {
          tenantId,
          email: registerDto.email,
          passwordHash,
          displayName: registerDto.name,
          globalUserId: globalUser.id,
          isActive: true,
        },
      });

      // Get roles to assign
      const roleNames = invite.rolesJson as string[];
      const roles = await tx.role.findMany({
        where: {
          tenantId,
          name: { in: roleNames },
        },
      });

      // Assign roles to org user (legacy)
      if (roles.length > 0) {
        await tx.orgUserRole.createMany({
          data: roles.map(role => ({
            tenantId,
            orgUserId: orgUser.id,
            roleId: role.id,
          })),
        });
      }

      // Create membership for unified auth/session
      const membership = await tx.userOrganisationMembership.create({
        data: {
          tenantId,
          userId: globalUser.id,
          email: registerDto.email,
          displayName: registerDto.name,
          isActive: true,
        },
      });

      // Assign membership roles (perm-based auth)
      if (roles.length > 0) {
        await tx.membershipRole.createMany({
          data: roles.map(role => ({
            tenantId,
            membershipId: membership.id,
            roleId: role.id,
          })),
        });
      }

      // Link global user to organization
      const existingAdmin = await tx.organisationAdmin.findFirst({
        where: {
          organisationId: tenantId,
          globalUserId: globalUser.id,
        },
      });

      if (!existingAdmin) {
        await tx.organisationAdmin.create({
          data: {
            organisationId: tenantId,
            globalUserId: globalUser.id,
            role: 'member',
          },
        });
      }

      // Mark invite as accepted
      await tx.orgInvite.update({
        where: { id: invite.id },
        data: {
          acceptedAt: new Date(),
          acceptedById: globalUser.id,
        },
      });

      return { globalUser, orgUser };
    });

    return {
      globalUser: {
        id: result.globalUser.id,
        email: result.globalUser.email,
        name: result.globalUser.name || result.globalUser.email,
      },
      orgUser: {
        id: result.orgUser.id,
        email: result.orgUser.email,
        displayName: result.orgUser.displayName,
      },
      organization: {
        id: invite.organisation.id,
        name: invite.organisation.name,
        slug: invite.organisation.slug,
      },
    };
  }

  /**
   * Server-side password strength validation.
   * Throws BadRequestException with details if validation fails.
   */
  private validatePasswordStrength(password: string) {
    const errors: string[] = [];

    if (!password || password.length < 8) {
      errors.push('Must be at least 8 characters long');
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      errors.push('Must include both uppercase and lowercase letters');
    }
    if (!/\d/.test(password)) {
      errors.push('Must include at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Must include at least one special character (e.g. !@#$%)');
    }

    if (errors.length > 0) {
      throw new BadRequestException(
        `Password does not meet complexity requirements: ${errors.join('; ')}`
      );
    }
  }
}
