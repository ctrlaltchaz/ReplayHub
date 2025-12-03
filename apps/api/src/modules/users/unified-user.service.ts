import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { UnifiedOrgMembership, UnifiedUserProfile } from './dto/unified-user.dto';

export interface UnifiedOrgAccount {
  id: string;
  tenantId: string;
  email: string;
  displayName: string | null;
  isActive: boolean;
  isTotpEnabled: boolean;
  parentGlobalUserId: string | null;
  passwordHash: string;
  organisation?: {
    id: string;
    slug: string;
    name: string;
  } | null;
}

export interface UnifiedGlobalAccount {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  isGlobalAdmin: boolean;
  isActive: boolean;
  isTotpEnabled: boolean;
  totpSecret: string | null;
  passwordHash: string;
  pendingEmail: string | null;
  emailVerificationCode: string | null;
  emailVerificationExpiry: Date | null;
  quickLoginPinHash: string | null;
  quickLoginEnabled: boolean;
  quickLoginDeviceId: string | null;
  bio: string | null;
  location: string | null;
  timezone: string | null;
  socialLinks: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  organisations: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface UnifiedAccountsByEmail {
  globalAccount: UnifiedGlobalAccount | null;
  orgAccounts: UnifiedOrgAccount[];
}

@Injectable()
export class UnifiedUserService {
  constructor(private readonly prisma: PrismaService) {}

  private mapGlobalUser(globalUser: GlobalUserWithRelations): UnifiedGlobalAccount {
    return {
      id: globalUser.id,
      email: globalUser.email,
      name: globalUser.name,
      avatar: globalUser.avatar,
      isGlobalAdmin: globalUser.isGlobalAdmin,
      isActive: globalUser.isActive,
      isTotpEnabled: globalUser.isTotpEnabled,
      totpSecret: globalUser.totpSecret,
      passwordHash: globalUser.passwordHash,
      pendingEmail: globalUser.pendingEmail,
      emailVerificationCode: globalUser.emailVerificationCode,
      emailVerificationExpiry: globalUser.emailVerificationExpiry,
      quickLoginPinHash: globalUser.quickLoginPinHash ?? null,
      quickLoginEnabled: globalUser.quickLoginEnabled ?? false,
      quickLoginDeviceId: globalUser.quickLoginDeviceId ?? null,
      bio: globalUser.bio,
      location: globalUser.location,
      timezone: globalUser.timezone,
      socialLinks: globalUser.socialLinks,
      createdAt: globalUser.createdAt,
      updatedAt: globalUser.updatedAt,
      organisations: (globalUser.organisationAdmins || []).map(admin => ({
        id: admin.organisation.id,
        name: admin.organisation.name,
        slug: admin.organisation.slug,
      })),
    };
  }

  private mapOrgUser(orgUser: OrgUserWithOrganisation): UnifiedOrgAccount {
    return {
      id: orgUser.id,
      tenantId: orgUser.tenantId,
      email: orgUser.email,
      displayName: orgUser.displayName,
      isActive: orgUser.isActive,
      isTotpEnabled: orgUser.isTotpEnabled,
      parentGlobalUserId: orgUser.globalUserId,
      passwordHash: orgUser.passwordHash,
      organisation: orgUser.organisation
        ? {
            id: orgUser.organisation.id,
            name: orgUser.organisation.name,
            slug: orgUser.organisation.slug,
          }
        : null,
    };
  }

  private mapMembershipToOrgAccount(membership: MembershipWithRelations): UnifiedOrgAccount {
    return {
      id: membership.id,
      tenantId: membership.tenantId,
      email: membership.email,
      displayName: membership.displayName,
      isActive: membership.isActive,
      isTotpEnabled: membership.isTotpEnabled,
      parentGlobalUserId: membership.userId,
      passwordHash: membership.user.passwordHash,
      organisation: membership.organisation
        ? {
            id: membership.organisation.id,
            name: membership.organisation.name,
            slug: membership.organisation.slug,
          }
        : null,
    };
  }

  async getAccountsByEmail(email: string): Promise<UnifiedAccountsByEmail> {
    const [globalUser, memberships] = await Promise.all([
      this.prisma.globalUser.findUnique({
        where: { email },
        include: {
          organisationAdmins: {
            include: {
              organisation: true,
            },
          },
        },
      }),
      this.prisma.userOrganisationMembership.findMany({
        where: { email },
        include: {
          user: true,
          organisation: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    const unifiedGlobal = globalUser ? this.mapGlobalUser(globalUser) : null;
    const unifiedOrgAccounts = memberships.map(membership =>
      this.mapMembershipToOrgAccount(membership)
    );

    return {
      globalAccount: unifiedGlobal,
      orgAccounts: unifiedOrgAccounts,
    };
  }

  async getGlobalAccountById(id: string): Promise<UnifiedGlobalAccount | null> {
    const globalUser = await this.prisma.globalUser.findUnique({
      where: { id },
      include: {
        organisationAdmins: {
          include: {
            organisation: true,
          },
        },
      },
    });

    return globalUser ? this.mapGlobalUser(globalUser) : null;
  }

  async getOrgAccountsForGlobalUser(globalUserId: string): Promise<UnifiedOrgAccount[]> {
    const memberships = await this.prisma.userOrganisationMembership.findMany({
      where: { userId: globalUserId },
      include: {
        user: true,
        organisation: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return memberships.map(membership => this.mapMembershipToOrgAccount(membership));
  }

  async getOrgAccountById(membershipId: string): Promise<UnifiedOrgAccount | null> {
    const membership = await this.prisma.userOrganisationMembership.findUnique({
      where: { id: membershipId },
      include: {
        user: true,
        organisation: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!membership) {
      return null;
    }

    return this.mapMembershipToOrgAccount(membership);
  }

  async getOrgAccountByUserIdAndTenantId(
    userId: string,
    tenantId: string
  ): Promise<UnifiedOrgAccount | null> {
    const membership = await this.prisma.userOrganisationMembership.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
        },
      },
      include: {
        user: true,
        organisation: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!membership) {
      return null;
    }

    return this.mapMembershipToOrgAccount(membership);
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      if (hash.startsWith('$argon2')) {
        return await argon2.verify(hash, password);
      }

      if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
        return await bcrypt.compare(password, hash);
      }

      return false;
    } catch (error) {
      // Avoid leaking verification errors to the caller; treat as invalid credentials
      return false;
    }
  }

  buildUnifiedProfile(params: {
    globalAccount: UnifiedGlobalAccount | null;
    orgAccounts: UnifiedOrgAccount[];
    activeMembershipId?: string | null;
  }): UnifiedUserProfile {
    const { globalAccount, orgAccounts, activeMembershipId } = params;

    const memberships: UnifiedOrgMembership[] = orgAccounts.map(account => ({
      membershipId: account.id,
      tenantId: account.tenantId,
      tenantSlug: account.organisation?.slug ?? '',
      tenantName: account.organisation?.name ?? '',
      email: account.email,
      displayName: account.displayName,
      isActive: account.isActive,
      isTotpEnabled: account.isTotpEnabled,
    }));

    const activeMembership = activeMembershipId
      ? memberships.find(membership => membership.membershipId === activeMembershipId)
      : undefined;

    const primaryMembership = activeMembership ?? memberships[0];

    const profile: UnifiedUserProfile = {
      id: globalAccount?.id ?? primaryMembership?.membershipId ?? '',
      email: globalAccount?.email ?? primaryMembership?.email ?? '',
      name: globalAccount?.name ?? primaryMembership?.displayName ?? null,
      avatar: globalAccount?.avatar ?? null,
      hasGlobalAccount: Boolean(globalAccount),
      isGlobalAdmin: Boolean(globalAccount?.isGlobalAdmin),
      isActive: globalAccount?.isActive ?? primaryMembership?.isActive ?? false,
      isTotpEnabled: globalAccount?.isTotpEnabled ?? primaryMembership?.isTotpEnabled ?? false,
      quickLoginEnabled: globalAccount?.quickLoginEnabled ?? false,
      globalOrganisations: globalAccount?.organisations ?? [],
      memberships,
      activeMembership,
    };

    return profile;
  }
}

type GlobalUserWithRelations = Prisma.GlobalUserGetPayload<{
  include: {
    organisationAdmins: {
      include: {
        organisation: true;
      };
    };
  };
}>;

type OrgUserWithOrganisation = Prisma.OrgUserGetPayload<{
  include: {
    organisation: {
      select: {
        id: true;
        name: true;
        slug: true;
      };
    };
  };
}>;

type MembershipWithRelations = Prisma.UserOrganisationMembershipGetPayload<{
  include: {
    user: true;
    organisation: {
      select: {
        id: true;
        name: true;
        slug: true;
      };
    };
  };
}>;
