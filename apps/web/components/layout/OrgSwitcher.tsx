"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useApiQuery } from "@/lib/api/query";
import { Building2, Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface OrgSwitcherProps {
  currentOrg?: {
    name: string;
    slug: string;
  };
}

interface Organization {
  id: string;
  slug: string;
  name: string;
}

export function OrgSwitcher({ currentOrg }: OrgSwitcherProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { sessionUser } = useAuth();

  // Only global accounts should hit the global org list endpoint.
  const isGlobalAccount = sessionUser?.hasGlobalAccount === true;

  // For org-only users, build the org list from their memberships to avoid 401s.
  const membershipOrganizations = useMemo<Organization[]>(() => {
    if (!sessionUser?.memberships?.length) return [];

    return sessionUser.memberships
      .filter((membership) => Boolean(membership.tenantSlug))
      .map((membership) => ({
        id:
          // field names differ between legacy and unified responses
          (membership as any).orgUserId ??
          (membership as any).membershipId ??
          membership.tenantId ??
          membership.tenantSlug,
        slug: membership.tenantSlug,
        name: membership.tenantName || membership.tenantSlug,
      }));
  }, [sessionUser]);

  const { data: globalOrganizations, isLoading: isLoadingGlobalOrgs } = useApiQuery<Organization[]>(
    "/global/orgs",
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: isGlobalAccount,
    }
  );

  const organizations = isGlobalAccount ? (globalOrganizations ?? []) : membershipOrganizations;
  const isLoading = isGlobalAccount ? isLoadingGlobalOrgs : false;

  const handleOrgSwitch = (orgSlug: string) => {
    setDropdownOpen(false);
    router.push(`/org/${orgSlug}/overview`);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <Building2 className="h-4 w-4" />
        <span className="hidden sm:inline-block">{currentOrg?.name || "Select Organization"}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {dropdownOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-card border rounded-md shadow-lg z-50 p-2">
            {isLoading ? (
              <div className="py-3 px-2 text-sm text-muted-foreground">
                Loading organizations...
              </div>
            ) : organizations && organizations.length > 0 ? (
              <>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleOrgSwitch(org.slug)}
                    className="w-full py-3 px-2 hover:bg-accent rounded cursor-pointer text-left flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{org.name}</span>
                      <span className="text-xs text-muted-foreground">/{org.slug}</span>
                    </div>
                    {currentOrg?.slug === org.slug && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/org/select");
                  }}
                  className="w-full py-3 px-2 hover:bg-accent rounded cursor-pointer text-left"
                >
                  <Building2 className="inline-block mr-2 h-4 w-4" />
                  <span className="font-medium">Manage Organizations</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/org/select");
                }}
                className="w-full py-3 px-2 hover:bg-accent rounded cursor-pointer text-left"
              >
                <Building2 className="inline-block mr-2 h-4 w-4" />
                <span className="font-medium">Select Organization</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
