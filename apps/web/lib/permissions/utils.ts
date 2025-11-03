import { PermissionKey } from '@/lib/auth/session';

/**
 * Centralized permission checking utilities
 * Provides consistent permission validation across all components
 */

export type PermissionRequirement = string | string[] | undefined;

/**
 * Check if user has the required permission(s)
 * 
 * @param userPermissions - Array of permissions the user has
 * @param required - Permission requirement (string, array of strings, or undefined)
 * @returns boolean - True if user has required permissions
 */
export function hasPermission(userPermissions: PermissionKey[], required?: PermissionRequirement): boolean {
    // No permission required - allow access
    if (!required) {
        return true;
    }

    // Handle array of permissions (user needs ANY of them)
    if (Array.isArray(required)) {
        return required.some(perm => userPermissions.includes(perm));
    }

    // Handle single permission requirement
    return userPermissions.includes(required);
}

/**
 * Check if user has ALL of the required permissions
 * 
 * @param userPermissions - Array of permissions the user has
 * @param required - Array of permissions that are ALL required
 * @returns boolean - True if user has all required permissions
 */
export function hasAllPermissions(userPermissions: PermissionKey[], required: string[]): boolean {
    return required.every(perm => userPermissions.includes(perm));
}

/**
 * Check if user has global admin permissions
 * 
 * @param globalUser - Global user object (null if not logged in globally)
 * @returns boolean - True if user is a global admin
 */
export function isGlobalAdmin(globalUser: any): boolean {
    return !!globalUser; // For now, any global user is considered admin
}

/**
 * Check if user has specific org-level admin permissions
 * 
 * @param userPermissions - Array of permissions the user has
 * @param orgPermission - Specific org permission to check (defaults to 'org.admin')
 * @returns boolean - True if user has org admin permissions
 */
export function isOrgAdmin(userPermissions: PermissionKey[], orgPermission: string = 'org.admin'): boolean {
    return userPermissions.includes(orgPermission);
}

/**
 * Filter navigation items based on user permissions
 * 
 * @param items - Array of navigation items with 'required' permission property
 * @param userPermissions - Array of permissions the user has
 * @param globalUser - Global user object for global admin checks
 * @returns Filtered array of navigation items
 */
export function filterNavByPermissions<T extends { required?: PermissionRequirement; globalAdminOnly?: boolean }>(
    items: T[],
    userPermissions: PermissionKey[],
    globalUser?: any
): T[] {
    return items.filter(item => {
        // Check global admin requirement
        if (item.globalAdminOnly && !isGlobalAdmin(globalUser)) {
            return false;
        }

        // Check permission requirement
        return hasPermission(userPermissions, item.required);
    });
}

/**
 * Permission constants for common use cases
 */
export const PERMISSIONS = {
    // Organization management
    ORG_ADMIN: 'org.admin' as const,
    ORG_SETTINGS_MANAGE: 'org.settings.manage' as const,
    ORG_USERS_MANAGE: 'org.users.manage' as const,

    // Events and calendar
    EVENTS_VIEW: 'events.view' as const,
    EVENTS_MANAGE: 'events.manage' as const,
    CALENDAR_MANAGE: 'calendar.manage' as const,

    // Teams and rosters
    ROSTERS_VIEW: 'roster.view' as const,
    ROSTERS_MANAGE: 'roster.manage' as const,

    // Game logs and results
    GAMELOG_VIEW: 'gamelog.view' as const,
    GAMELOG_MANAGE: 'gamelog.manage' as const,

    // Inventory and assets
    INVENTORY_VIEW: 'inventory.view' as const,
    INVENTORY_MANAGE: 'inventory.manage' as const,
    ASSETS_MANAGE: 'assets.manage' as const,

    // Incidents and reports
    INCIDENTS_VIEW: 'incidents.view' as const,
    INCIDENTS_MANAGE: 'incidents.manage' as const,
    REPORTS_VIEW: 'reports.view' as const,

    // Runsheets and checklists
    RUNSHEETS_VIEW: 'runsheet.view' as const,
    RUNSHEETS_MANAGE: 'runsheet.manage' as const,
    CHECKLISTS_VIEW: 'checklists.view' as const,
    CHECKLISTS_MANAGE: 'checklists.manage' as const,

    // Global admin permissions
    GLOBAL_ADMIN: 'global.admin' as const,
    GLOBAL_USERS_MANAGE: 'global.users.manage' as const,
    GLOBAL_ORGS_MANAGE: 'global.orgs.manage' as const,
    GLOBAL_IMPERSONATE: 'global.impersonate' as const,
} as const;

/**
 * Permission groups for easier management
 */
export const PERMISSION_GROUPS = {
    ORG_ADMINS: [PERMISSIONS.ORG_ADMIN, PERMISSIONS.ORG_SETTINGS_MANAGE] as const,
    EVENT_MANAGERS: [PERMISSIONS.EVENTS_MANAGE, PERMISSIONS.CALENDAR_MANAGE] as const,
    ROSTER_MANAGERS: [PERMISSIONS.ROSTERS_MANAGE] as const,
    ASSET_MANAGERS: [PERMISSIONS.INVENTORY_MANAGE, PERMISSIONS.ASSETS_MANAGE] as const,
    GLOBAL_ADMINS: [PERMISSIONS.GLOBAL_ADMIN, PERMISSIONS.GLOBAL_USERS_MANAGE, PERMISSIONS.GLOBAL_ORGS_MANAGE] as const,
} as const;