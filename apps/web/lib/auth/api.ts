import { useApiMutation, useApiQuery, type UseApiMutationOptions, type UseApiQueryOptions } from '@/lib/api/query';
import type { GlobalUser, OrgUser, UnifiedUserProfile } from './session';

export function useUnifiedSession(options?: UseApiQueryOptions<UnifiedUserProfile>) {
    return useApiQuery<UnifiedUserProfile>('/auth/session', options);
}

// Global auth hooks
export function useGlobalMe(options?: UseApiQueryOptions<GlobalUser>) {
    return useApiQuery<GlobalUser>('/global/auth/me', options);
}

export function useGlobalLogin(options?: UseApiMutationOptions<GlobalUser, { email: string; password: string }>) {
    return useApiMutation<GlobalUser, { email: string; password: string }>('/global/auth/login', {
        method: 'POST',
        ...options,
    });
}

export function useGlobalLogout(options?: UseApiMutationOptions<void, void>) {
    return useApiMutation<void, void>('/global/auth/logout', {
        method: 'POST',
        ...options,
    });
}

// Organization auth hooks
export function useOrgMe(slug: string, options?: UseApiQueryOptions<{ orgUser: OrgUser }>) {
    const query = useApiQuery<{ orgUser: OrgUser }>(`/org/${slug}/auth/me`, {
        ...options,
        enabled: !!slug && (options?.enabled !== false),
    });

    return {
        ...query,
        data: query.data?.orgUser,
        isLoading: query.isLoading || (query.isSuccess && !query.data?.orgUser),
    };
}

export function useOrgLogin(slug: string, options?: UseApiMutationOptions<{ orgUser: OrgUser }, { email: string; password: string }>) {
    const mutation = useApiMutation<{ orgUser: OrgUser }, { email: string; password: string }>(`/org/${slug}/auth/login`, {
        method: 'POST',
        ...options,
    });

    return {
        ...mutation,
        data: mutation.data?.orgUser,
    };
}

export function useOrgLogout(slug: string, options?: UseApiMutationOptions<void, void>) {
    return useApiMutation<void, void>(`/org/${slug}/auth/logout`, {
        method: 'POST',
        ...options,
    });
}

// TOTP/2FA hooks
export function useGlobalTotpVerify(options?: UseApiMutationOptions<GlobalUser, { token: string }>) {
    return useApiMutation<GlobalUser, { token: string }>('/global/auth/totp/verify', {
        method: 'POST',
        ...options,
    });
}

export function useOrgTotpVerify(slug: string, options?: UseApiMutationOptions<OrgUser, { token: string }>) {
    return useApiMutation<OrgUser, { token: string }>(`/org/${slug}/auth/totp/verify`, {
        method: 'POST',
        ...options,
    });
}