import { useApiMutation, useApiQuery } from "@/lib/api/query";

// Org Admin Users
export interface OrgUser {
    id: string;
    userId: string;
    email: string;
    name: string | null;
    role: string;
    status: 'active' | 'inactive' | 'pending';
    joinedAt: string;
    lastActiveAt: string | null;
}

export interface CreateUserInviteRequest {
    email: string;
    role: string;
}

export interface UpdateUserRoleRequest {
    userId: string;
    role: string;
}

export interface OrgRole {
    id: string;
    name: string;
    description: string | null;
    permissionCount: number;
}

export interface OrgInvite {
    id: string;
    email: string;
    role: string;
    status: 'pending' | 'accepted' | 'expired';
    createdAt: string;
    expiresAt: string;
}

export interface OrgSettings {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    primaryColor: string | null;
    modules: {
        events: boolean;
        rosters: boolean;
        inventory: boolean;
        reports: boolean;
    };
}

export interface AuditLog {
    id: string;
    action: string;
    resource: string;
    resourceId: string | null;
    userId: string;
    userEmail: string;
    details: Record<string, any> | null;
    timestamp: string;
}

// Users
export function useOrgAdminUsers(orgSlug: string) {
    return useApiQuery<OrgUser[]>(`/org/${orgSlug}/admin/users`);
}

export function useCreateOrgUserInvite(orgSlug: string) {
    return useApiMutation<void, CreateUserInviteRequest>(`/org/${orgSlug}/admin/users/invite`, {
        method: 'POST'
    });
}

export function useUpdateOrgUserRole(orgSlug: string) {
    return useApiMutation<void, UpdateUserRoleRequest>(`/org/${orgSlug}/admin/users/role`, {
        method: 'PATCH'
    });
}

export function useRemoveOrgUser(orgSlug: string) {
    return useApiMutation<void, { userId: string }>(`/org/${orgSlug}/admin/users/remove`, {
        method: 'POST'
    });
}

// Roles & Permissions
export function useOrgRoles(orgSlug: string) {
    return useApiQuery<OrgRole[]>(`/org/${orgSlug}/admin/roles`);
}

export function useCreateOrgRole(orgSlug: string) {
    return useApiMutation<OrgRole, { name: string; description?: string; permissionIds: string[] }>(`/org/${orgSlug}/admin/roles`, {
        method: 'POST'
    });
}

export function useUpdateOrgRole(orgSlug: string) {
    return useApiMutation<OrgRole, { id: string; name: string; description?: string; permissionIds: string[] }>(`/org/${orgSlug}/admin/roles`, {
        method: 'PATCH'
    });
}

export function useDeleteOrgRole(orgSlug: string) {
    return useApiMutation<void, { id: string }>(`/org/${orgSlug}/admin/roles`, {
        method: 'DELETE'
    });
}

// Invites
export function useOrgInvites(orgSlug: string) {
    return useApiQuery<OrgInvite[]>(`/org/${orgSlug}/admin/invites`);
}

export function useResendOrgInvite(orgSlug: string) {
    return useApiMutation<void, { inviteId: string }>(`/org/${orgSlug}/admin/invites/resend`, {
        method: 'POST'
    });
}

export function useCancelOrgInvite(orgSlug: string) {
    return useApiMutation<void, { inviteId: string }>(`/org/${orgSlug}/admin/invites/cancel`, {
        method: 'POST'
    });
}

// Settings
export function useOrgSettings(orgSlug: string) {
    return useApiQuery<OrgSettings>(`/org/${orgSlug}/admin/settings`);
}

export function useUpdateOrgSettings(orgSlug: string) {
    return useApiMutation<OrgSettings, Partial<OrgSettings>>(`/org/${orgSlug}/admin/settings`, {
        method: 'PATCH'
    });
}

// Audit Logs
export function useOrgAuditLogs(orgSlug: string, page = 1, limit = 50) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    return useApiQuery<{
        data: AuditLog[];
        pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/org/${orgSlug}/admin/audit?${params}`);
}