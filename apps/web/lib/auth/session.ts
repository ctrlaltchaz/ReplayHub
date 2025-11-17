export interface GlobalUser {
    id: string;
    email: string;
    name?: string | null;
    avatar?: string | null;
    isGlobalAdmin?: boolean;
    createdAt?: string;
    updatedAt?: string | null;
    lastLoginAt?: string | null;
}

export interface OrgUser {
    id: string;
    email: string;
    displayName: string;
    isActive: boolean;
    isTotpEnabled: boolean;
    roles: string[];
    permissions: string[];
    createdAt: string;
}

export type PermissionKey = string;

export interface UnifiedOrgMembership {
    orgUserId: string;
    tenantId: string;
    tenantSlug: string;
    tenantName: string;
    email: string;
    displayName: string | null;
    isActive: boolean;
    isTotpEnabled: boolean;
}

export interface UnifiedUserProfile {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    hasGlobalAccount: boolean;
    isGlobalAdmin: boolean;
    isActive: boolean;
    isTotpEnabled: boolean;
    globalOrganisations: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    memberships: UnifiedOrgMembership[];
    activeMembership?: UnifiedOrgMembership;
}

/**
 * Flattens nested permission arrays into a single array of permission strings
 * @param perms - Array of permission strings or nested arrays
 * @returns Flattened array of unique permission strings
 */
export function flattenPermissions(perms: string[]): string[] {
    return Array.from(new Set(perms.filter(Boolean)));
}