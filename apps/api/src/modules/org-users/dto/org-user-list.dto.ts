export interface OrgUserListDto {
    id: string;
    email: string;
    displayName: string;
    isActive: boolean;
    isTotpEnabled: boolean;
    roles: string[];
    createdAt: Date;
}