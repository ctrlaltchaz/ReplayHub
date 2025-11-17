export interface TenantData {
    id: string;
    slug: string;
    name: string;
}

export type PrincipalType = 'org' | 'global-admin';

export interface RequestOrgUser {
    id: string;
    email: string;
    displayName: string | null;
    roles: string[];
    permissions: string[];
}

export interface RequestPrincipal {
    type: PrincipalType;
    id: string;
    tenantId: string;
    permissions?: string[];
}

export interface RequestGlobalUser {
    id: string;
    email: string;
    name: string | null;
    isGlobalAdmin: boolean;
}

export interface RequestUserIdentity {
    id: string;
    type: 'global' | 'org';
    tenantId?: string | null;
    email?: string;
}
