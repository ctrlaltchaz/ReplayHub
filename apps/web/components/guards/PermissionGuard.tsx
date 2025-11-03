'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { ReactNode } from 'react';

interface PermissionGuardProps {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    module?: string;
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Guard component that conditionally renders children based on user permissions
 */
export function PermissionGuard({
    permission,
    permissions,
    requireAll = false,
    module,
    children,
    fallback = null
}: PermissionGuardProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions, hasModuleAccess } = usePermissions();

    let hasAccess = false;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (permissions && permissions.length > 0) {
        hasAccess = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);
    } else if (module) {
        hasAccess = hasModuleAccess(module);
    } else {
        // If no permission criteria provided, allow access
        hasAccess = true;
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
}