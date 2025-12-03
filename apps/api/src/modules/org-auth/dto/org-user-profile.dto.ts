export interface OrgUserProfileDto {
    id: string;
    email: string;
    displayName: string;
    isActive: boolean;
    isTotpEnabled: boolean;
    roles: string[];
    permissions: string[];
    createdAt: Date;
}
