import { useApiMutation, useApiQuery, type UseApiMutationOptions, type UseApiQueryOptions } from '@/lib/api/query';

// Global Admin Types
export interface AdminOverview {
    organisationCount: number;
    globalUserCount: number;
    activeTenantCount: number;
    recentIncidentCount: number;
}

export interface Organisation {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

export interface GlobalUser {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrganisationDto {
    name: string;
    slug: string;
    ownerEmail: string;
    description?: string;
}

export interface CreateGlobalUserDto {
    email: string;
    name: string;
    password: string;
    isSuperAdmin?: boolean;
}

// Global Admin Hooks
export function useAdminOverview(options?: UseApiQueryOptions<AdminOverview>) {
    return useApiQuery<AdminOverview>('/admin/overview', options);
}

export function useAdminOrganisations(
    page = 1,
    limit = 20,
    search?: string,
    options?: UseApiQueryOptions<{ organisations: Organisation[]; total: number; page: number; totalPages: number }>
) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
    });

    return useApiQuery<{ organisations: Organisation[]; total: number; page: number; totalPages: number }>(
        `/admin/organisations?${params}`,
        options
    );
}

export function useCreateOrganisation(options?: UseApiMutationOptions<Organisation, CreateOrganisationDto>) {
    return useApiMutation<Organisation, CreateOrganisationDto>('/admin/organisations', {
        method: 'POST',
        ...options,
    });
}

export function useAdminOrganisation(orgId: string, options?: UseApiQueryOptions<Organisation>) {
    return useApiQuery<Organisation>(`/admin/organisations/${orgId}`, options);
}

export function useAdminGlobalUsers(
    page = 1,
    limit = 20,
    search?: string,
    options?: UseApiQueryOptions<{ users: GlobalUser[]; total: number; page: number; totalPages: number }>
) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
    });

    return useApiQuery<{ users: GlobalUser[]; total: number; page: number; totalPages: number }>(
        `/admin/global-users?${params}`,
        options
    );
}

export function useCreateGlobalUser(options?: UseApiMutationOptions<GlobalUser, CreateGlobalUserDto>) {
    return useApiMutation<GlobalUser, CreateGlobalUserDto>('/admin/global-users', {
        method: 'POST',
        ...options,
    });
}

export function useGlobalAudit(
    page = 1,
    limit = 50,
    options?: UseApiQueryOptions<any>
) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
    });

    return useApiQuery<any>(`/admin/audit?${params}`, options);
}

// Impersonation
export interface ImpersonateDto {
    orgId: string;
    orgUserId?: string;
    reason?: string;
}

export function useImpersonate(options?: UseApiMutationOptions<any, ImpersonateDto>) {
    return useApiMutation<any, ImpersonateDto>('/admin/impersonate', {
        method: 'POST',
        ...options,
    });
}

export function useStopImpersonation(options?: UseApiMutationOptions<any, void>) {
    return useApiMutation<any, void>('/admin/impersonate/stop', {
        method: 'POST',
        ...options,
    });
}

export interface ImpersonationStatus {
    isImpersonating: boolean;
    targetOrg?: {
        id: string;
        name: string;
        slug: string;
    };
    originalUserId?: string;
    expiresAt?: string;
    reason?: string;
}

export function useImpersonationStatus(options?: UseApiQueryOptions<ImpersonationStatus>) {
    return useApiQuery<ImpersonationStatus>('/admin/impersonate/status', {
        ...options,
    });
}