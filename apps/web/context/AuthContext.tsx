"use client";

import { useGlobalLogin, useGlobalLogout, useGlobalMe, useGlobalTotpVerify, useOrgLogin, useOrgLogout, useOrgMe, useOrgTotpVerify } from '@/lib/auth/api';
import { flattenPermissions, type GlobalUser, type OrgUser, type PermissionKey } from '@/lib/auth/session';
import * as React from 'react';

interface AuthContextType {
    // State
    globalUser: GlobalUser | null;
    orgUser: OrgUser | null;
    permissions: PermissionKey[];
    isGlobalAdmin: boolean;
    hasPermission: (required?: string | string[]) => boolean;

    // Actions
    loginGlobal: (credentials: { email: string; password: string }) => Promise<void>;
    logoutGlobal: () => Promise<void>;
    loginOrg: (slug: string, credentials: { email: string; password: string }) => Promise<void>;
    logoutOrg: (slug: string) => Promise<void>;
    verifyGlobalTotp: (token: string) => Promise<void>;
    verifyOrgTotp: (slug: string, token: string) => Promise<void>;
    refresh: () => Promise<void>;

    // Loading states
    isLoadingGlobal: boolean;
    isLoadingOrg: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
    orgSlug?: string; // Current org context
}

export function AuthProvider({ children, orgSlug }: AuthProviderProps) {
    const [refreshKey, setRefreshKey] = React.useState(0);

    // Global auth queries - always enabled
    const { data: globalUser, isLoading: isLoadingGlobal, refetch: refetchGlobal } = useGlobalMe({
        retry: false,
        refetchOnWindowFocus: false,
    });

    // Org auth queries (only when orgSlug is provided)
    const { data: orgUser, isLoading: isLoadingOrg, refetch: refetchOrg } = useOrgMe(
        orgSlug || '',
        {
            enabled: !!orgSlug,
            retry: false,
            refetchOnWindowFocus: false,
        }
    );

    // Mutations
    const globalLoginMutation = useGlobalLogin();
    const globalLogoutMutation = useGlobalLogout();
    const globalTotpMutation = useGlobalTotpVerify();
    const orgLoginMutation = useOrgLogin(orgSlug || '');
    const orgLogoutMutation = useOrgLogout(orgSlug || '');
    const orgTotpMutation = useOrgTotpVerify(orgSlug || '');

    // Computed permissions - flatten from org user permissions array
    const permissions = orgUser?.permissions ? flattenPermissions(orgUser.permissions) : [];

    // Compute isGlobalAdmin flag
    const isGlobalAdmin = globalUser?.isGlobalAdmin === true;

    // Actions
    const loginGlobal = React.useCallback(async (credentials: { email: string; password: string }) => {
        await globalLoginMutation.mutateAsync(credentials);
        await refetchGlobal();
    }, [globalLoginMutation, refetchGlobal]);

    const logoutGlobal = React.useCallback(async () => {
        await globalLogoutMutation.mutateAsync();
        await refetchGlobal();
    }, [globalLogoutMutation, refetchGlobal]);

    const loginOrg = React.useCallback(async (slug: string, credentials: { email: string; password: string }) => {
        await orgLoginMutation.mutateAsync(credentials);
        if (orgSlug === slug) {
            await refetchOrg();
        }
    }, [orgLoginMutation, orgSlug, refetchOrg]);

    const logoutOrg = React.useCallback(async (slug: string) => {
        await orgLogoutMutation.mutateAsync();
        if (orgSlug === slug) {
            await refetchOrg();
        }
    }, [orgLogoutMutation, orgSlug, refetchOrg]);

    const verifyGlobalTotp = React.useCallback(async (token: string) => {
        await globalTotpMutation.mutateAsync({ token });
        await refetchGlobal();
    }, [globalTotpMutation, refetchGlobal]);

    const verifyOrgTotp = React.useCallback(async (slug: string, token: string) => {
        await orgTotpMutation.mutateAsync({ token });
        if (orgSlug === slug) {
            await refetchOrg();
        }
    }, [orgTotpMutation, orgSlug, refetchOrg]);

    const refresh = React.useCallback(async () => {
        console.log('[AuthContext] Refreshing auth state...');
        const results = await Promise.all([
            refetchGlobal(),
            orgSlug ? refetchOrg() : Promise.resolve(),
        ]);
        console.log('[AuthContext] Refresh complete. Global user:', results[0].data);
        setRefreshKey((prev: number) => prev + 1);
    }, [refetchGlobal, refetchOrg, orgSlug]);

    const contextValue: AuthContextType = {
        globalUser: globalUser || null,
        orgUser: orgUser || null,
        permissions,
        isGlobalAdmin,
        hasPermission: (required?: string | string[]) => {
            if (!required) return true;
            if (isGlobalAdmin) return true;
            const requiredPerms = Array.isArray(required) ? required : [required];
            return requiredPerms.some(perm => permissions.includes(perm));
        },
        loginGlobal,
        logoutGlobal,
        loginOrg,
        logoutOrg,
        verifyGlobalTotp,
        verifyOrgTotp,
        refresh,
        isLoadingGlobal,
        isLoadingOrg,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}