export interface UnifiedOrgMembership {
  membershipId: string;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  email: string;
  displayName: string | null;
  isActive: boolean;
  isTotpEnabled: boolean;
}

export interface UnifiedUserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  hasGlobalAccount: boolean;
  isGlobalAdmin: boolean;
  isActive: boolean;
  isTotpEnabled: boolean;
  quickLoginEnabled?: boolean;
  globalOrganisations: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  memberships: UnifiedOrgMembership[];
  activeMembership?: UnifiedOrgMembership;
}
