import { useAuth } from '@/context/AuthContext';
import { hasAllPermissions, hasPermission, isGlobalAdmin, isOrgAdmin, PermissionRequirement, PERMISSIONS } from '@/lib/permissions/utils';

/**
 * Custom hook for permission checking
 * Provides easy access to permission utilities with current user context
 */
export function usePermissions() {
    const { permissions, globalUser } = useAuth();

    return {
        // Basic permission checking using centralized utilities
        hasPermission: (required?: PermissionRequirement) => hasPermission(permissions, required),
        hasAllPermissions: (required: string[]) => hasAllPermissions(permissions, required),

        // Legacy methods for backward compatibility
        hasAnyPermission: (permissionList: string[]): boolean => {
            return permissionList.some(permission => permissions.includes(permission));
        },
        hasModuleAccess: (module: string): boolean => {
            return permissions.some(permission => permission.startsWith(`${module}.`));
        },

        // Role-based checks
        isGlobalAdmin: () => isGlobalAdmin(globalUser),
        isOrgAdmin: (orgPermission?: string) => isOrgAdmin(permissions, orgPermission),

        // Raw permissions for advanced use cases
        permissions,
        globalUser,

        // Convenience methods for common permission patterns
        canViewEvents: () => hasPermission(permissions, PERMISSIONS.EVENTS_VIEW),
        canManageEvents: () => hasPermission(permissions, PERMISSIONS.EVENTS_MANAGE),
        canManageRosters: () => hasPermission(permissions, PERMISSIONS.ROSTERS_MANAGE),
        canManageSettings: () => hasPermission(permissions, PERMISSIONS.ORG_SETTINGS_MANAGE),
        canViewReports: () => hasPermission(permissions, PERMISSIONS.REPORTS_VIEW),
        canManageIncidents: () => hasPermission(permissions, PERMISSIONS.INCIDENTS_MANAGE),
    };
}

/**
 * Hook for filtering arrays based on permissions
 * Useful for navigation menus, action buttons, etc.
 */
export function usePermissionFilter() {
    const { permissions, globalUser } = useAuth();

    return <T extends { required?: PermissionRequirement; globalAdminOnly?: boolean }>(items: T[]): T[] => {
        return items.filter(item => {
            // Check global admin requirement
            if (item.globalAdminOnly && !isGlobalAdmin(globalUser)) {
                return false;
            }

            // Check permission requirement
            return hasPermission(permissions, item.required);
        });
    };
}