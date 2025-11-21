export interface OrgUserListDto {
  id: string;
  membershipId?: string;
  globalUserId?: string | null;
  email: string;
  displayName: string;
  isActive: boolean;
  isTotpEnabled: boolean;
  roles: string[];
  createdAt: Date;
}
