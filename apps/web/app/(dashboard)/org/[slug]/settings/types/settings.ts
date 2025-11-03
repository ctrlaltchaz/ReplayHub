// User types
export interface OrgUser {
    id: string;
    email: string;
    displayName: string;
    isActive: boolean;
    isTotpEnabled: boolean;
    roles: string[];
    createdAt: string;
}

export interface CreateUserDto {
    userType: 'new' | 'existing';
    email: string;
    firstName: string;
    lastName: string;
    displayName: string;
    roles?: string[];
    isActive?: boolean;
    sendInviteEmail?: boolean;
}

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    isActive?: boolean;
}

export interface AssignRolesDto {
    roles: string[];
}

// Role types
export interface Role {
    id: string;
    name: string;
    description: string | null;
    permissionCount?: number;
    userCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Permission {
    id: string;
    key: string;
    group: string;
    description: string | null;
}

export interface RoleWithPermissions extends Role {
    permissions: Permission[];
}

// Invite types
export interface Invite {
    id: string;
    email: string;
    roles: string[];
    status: 'pending' | 'accepted' | 'expired';
    invitedBy: string;
    expiresAt: string;
    acceptedAt: string | null;
    createdAt: string;
}

export interface CreateInviteDto {
    email: string;
    roles: string[];
}

// Organization settings types
export interface OrganizationSettings {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    timezone?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateOrganizationDto {
    name?: string;
    description?: string;
    logoUrl?: string;
    timezone?: string;
}
