"use client";

import { ApiError } from "@/lib/api/errors";
import {
  useGlobalLogin,
  useGlobalLogout,
  useGlobalTotpVerify,
  useOrgLogin,
  useOrgLogout,
  useOrgMe,
  useOrgTotpVerify,
  useUnifiedSession,
} from "@/lib/auth/api";
import {
  flattenPermissions,
  type GlobalUser,
  type OrgUser,
  type PermissionKey,
  type UnifiedOrgMembership,
  type UnifiedUserProfile,
} from "@/lib/auth/session";
import * as React from "react";

interface AuthContextType {
  // State
  sessionUser: UnifiedUserProfile | null;
  activeMembership: UnifiedOrgMembership | null;
  globalUser: GlobalUser | null;
  orgUser: OrgUser | null;
  permissions: PermissionKey[];
  isGlobalAdmin: boolean;
  hasPermission: (required?: string | string[]) => boolean;
  isUnauthenticated: boolean;
  authError: ApiError | null;

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
  isPermissionsReady: boolean; // New flag to indicate permissions are loaded and ready
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  orgSlug?: string; // Current org context
}

export function AuthProvider({ children, orgSlug }: AuthProviderProps) {
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Unified session query (global + org context)
  const {
    data: sessionUser,
    isLoading: isLoadingSession,
    refetch: refetchSession,
    error: sessionError,
  } = useUnifiedSession({
    // Avoid hammering the session endpoint (helps prevent 429s/rate limits)
    staleTime: 5 * 60 * 1000, // cache session data for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false, // rely on initial mount + explicit refresh calls
    retry: (failureCount, error: any) => {
      // Gracefully retry a couple times on 429 to absorb short bursts, otherwise don't retry
      if (error?.status === 429 && failureCount < 2) {
        return true;
      }
      return false;
    },
    retryDelay: (attempt) => Math.min(2000 * attempt, 5000),
  });

  const activeMembership = React.useMemo<UnifiedOrgMembership | null>(() => {
    if (!sessionUser) {
      return null;
    }

    if (orgSlug) {
      const matching = sessionUser.memberships.find(
        (membership) => membership.tenantSlug === orgSlug
      );
      if (matching) {
        return matching;
      }
    }

    return sessionUser.activeMembership ?? sessionUser.memberships[0] ?? null;
  }, [sessionUser, orgSlug]);

  const effectiveOrgSlug = React.useMemo(() => {
    if (orgSlug) {
      return orgSlug;
    }
    return activeMembership?.tenantSlug ?? "";
  }, [orgSlug, activeMembership]);

  // Org auth queries (only when orgSlug is provided)
  const {
    data: orgUser,
    isLoading: isLoadingOrg,
    isFetched: isOrgFetched,
    isError: isOrgError,
    refetch: refetchOrg,
  } = useOrgMe(effectiveOrgSlug, {
    enabled: !!effectiveOrgSlug,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Mutations
  const globalLoginMutation = useGlobalLogin();
  const globalLogoutMutation = useGlobalLogout();
  const globalTotpMutation = useGlobalTotpVerify();
  const orgLoginMutation = useOrgLogin(orgSlug || "");
  const orgLogoutMutation = useOrgLogout(orgSlug || "");
  const orgTotpMutation = useOrgTotpVerify(orgSlug || "");

  // Computed permissions - flatten from org user permissions array
  // Memoize to ensure the array reference only changes when orgUser changes
  const permissions = React.useMemo(() => {
    return orgUser?.permissions ? flattenPermissions(orgUser.permissions) : [];
  }, [orgUser]);

  // Determine if permissions are ready:
  // - If no orgSlug, permissions are ready (we're not in an org context)
  // - If orgSlug exists, wait for the fetch to complete AND have valid orgUser data
  const isPermissionsReady = React.useMemo(() => {
    if (!effectiveOrgSlug) return true; // Not in org context, no permissions needed
    if (isLoadingOrg) return false; // Still loading
    // If the org query errored (common for limited roles), treat as ready even without orgUser
    if (isOrgError) return true;
    // Ready when the query has completed (orgUser may be null if the user lacks access)
    return isOrgFetched;
  }, [effectiveOrgSlug, isLoadingOrg, isOrgFetched, isOrgError]);

  // Debug logging for permissions
  React.useEffect(() => {
    console.log("[AuthContext] State:", {
      orgSlug,
      effectiveOrgSlug,
      isLoadingOrg,
      isOrgFetched,
      hasOrgUser: !!orgUser,
      isPermissionsReady,
      permissionsCount: permissions.length,
    });

    if (orgUser) {
      console.log("[AuthContext] OrgUser loaded:", {
        userId: orgUser.id,
        email: orgUser.email,
        rawPermissions: orgUser.permissions,
        flattenedPermissions: permissions,
        permissionsCount: permissions.length,
      });
    } else if (effectiveOrgSlug && isOrgFetched) {
      console.log("[AuthContext] No orgUser - user may not have access to this org");
    }
  }, [
    orgSlug,
    effectiveOrgSlug,
    isLoadingOrg,
    isOrgFetched,
    orgUser,
    permissions,
    isPermissionsReady,
  ]);

  const globalUser = React.useMemo<GlobalUser | null>(() => {
    if (!sessionUser) {
      return null;
    }

    return {
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
      avatar: sessionUser.avatar,
      isGlobalAdmin: sessionUser.isGlobalAdmin,
      quickLoginEnabled: (sessionUser as any).quickLoginEnabled ?? false,
    };
  }, [sessionUser]);

  // Compute isGlobalAdmin flag
  const isGlobalAdmin = sessionUser?.isGlobalAdmin === true;

  // Actions
  const loginGlobal = React.useCallback(
    async (credentials: { email: string; password: string }) => {
      await globalLoginMutation.mutateAsync(credentials);
      await refetchSession();
      if (effectiveOrgSlug) {
        await refetchOrg();
      }
    },
    [globalLoginMutation, refetchSession, refetchOrg, effectiveOrgSlug]
  );

  const logoutGlobal = React.useCallback(async () => {
    await globalLogoutMutation.mutateAsync();
    await Promise.all([refetchSession(), effectiveOrgSlug ? refetchOrg() : Promise.resolve()]);
  }, [globalLogoutMutation, refetchSession, refetchOrg, effectiveOrgSlug]);

  const loginOrg = React.useCallback(
    async (slug: string, credentials: { email: string; password: string }) => {
      await orgLoginMutation.mutateAsync(credentials);
      if (orgSlug === slug) {
        await refetchOrg();
      }
      await refetchSession();
    },
    [orgLoginMutation, orgSlug, refetchOrg, refetchSession]
  );

  const logoutOrg = React.useCallback(
    async (slug: string) => {
      await orgLogoutMutation.mutateAsync();
      if (orgSlug === slug) {
        await refetchOrg();
      }
      await refetchSession();
    },
    [orgLogoutMutation, orgSlug, refetchOrg, refetchSession]
  );

  const verifyGlobalTotp = React.useCallback(
    async (token: string) => {
      await globalTotpMutation.mutateAsync({ token });
      await refetchSession();
    },
    [globalTotpMutation, refetchSession]
  );

  const verifyOrgTotp = React.useCallback(
    async (slug: string, token: string) => {
      await orgTotpMutation.mutateAsync({ token });
      if (orgSlug === slug) {
        await refetchOrg();
      }
      await refetchSession();
    },
    [orgTotpMutation, orgSlug, refetchOrg, refetchSession]
  );

  const refresh = React.useCallback(async () => {
    console.log("[AuthContext] Refreshing auth state...");
    const results = await Promise.all([
      refetchSession(),
      effectiveOrgSlug ? refetchOrg() : Promise.resolve(),
    ]);
    console.log("[AuthContext] Refresh complete. Session user:", results[0]?.data);
    setRefreshKey((prev: number) => prev + 1);
  }, [refetchSession, refetchOrg, effectiveOrgSlug]);

  const hasPermission = React.useCallback(
    (required?: string | string[]) => {
      if (!required) return true;
      if (isGlobalAdmin) return true;
      const requiredPerms = Array.isArray(required) ? required : [required];
      return requiredPerms.some((perm) => permissions.includes(perm));
    },
    [isGlobalAdmin, permissions]
  );

  const contextValue: AuthContextType = React.useMemo(
    () => ({
      sessionUser: sessionUser || null,
      activeMembership,
      globalUser: globalUser || null,
      orgUser: orgUser || null,
      permissions,
      isGlobalAdmin,
      hasPermission,
      loginGlobal,
      logoutGlobal,
      loginOrg,
      logoutOrg,
      verifyGlobalTotp,
      verifyOrgTotp,
      refresh,
      isLoadingGlobal: isLoadingSession,
      isLoadingOrg,
      isPermissionsReady,
      isUnauthenticated: !isLoadingSession && !!sessionError?.isAuthError,
      authError: sessionError ?? null,
    }),
    [
      sessionUser,
      activeMembership,
      globalUser,
      orgUser,
      permissions,
      isGlobalAdmin,
      hasPermission,
      loginGlobal,
      logoutGlobal,
      loginOrg,
      logoutOrg,
      verifyGlobalTotp,
      verifyOrgTotp,
      refresh,
      isLoadingSession,
      isLoadingOrg,
      isPermissionsReady,
      sessionError,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
