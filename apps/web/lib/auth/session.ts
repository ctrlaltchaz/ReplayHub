export interface GlobalUser {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    isGlobalAdmin?: boolean;
    createdAt: string;
    updatedAt?: string;
    lastLoginAt?: string;
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

/**
 * Flattens nested permission arrays into a single array of permission strings
 * @param perms - Array of permission strings or nested arrays
 * @returns Flattened array of unique permission strings
 */
export function flattenPermissions(perms: string[]): string[] {
    return Array.from(new Set(perms.filter(Boolean)));
}