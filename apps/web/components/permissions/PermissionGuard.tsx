'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { PermissionRequirement } from '@/lib/permissions/utils';
import { ReactNode } from 'react';

interface PermissionGuardProps {
    required?: PermissionRequirement;
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * If user doesn't have required permission, renders fallback (or nothing)
 */
export function PermissionGuard({ required, children, fallback = null }: PermissionGuardProps) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(required)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
