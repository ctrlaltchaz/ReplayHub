"use client";

import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { getServerUrl } from "@/lib/api/config";
import { adminPath } from "@/lib/paths/org";
import { LogOut, Menu, Shield, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { OrgSwitcher } from "./OrgSwitcher";

interface TopbarProps {
  org?: {
    name: string;
    slug: string;
  };
  onMobileMenuToggle?: () => void;
}

export function Topbar({ org, onMobileMenuToggle }: TopbarProps) {
  const { globalUser, logoutGlobal } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAdminPage = pathname?.startsWith("/admin");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Use organization context for branding (only available in org pages)
  let organization: any = null;
  let branding: any = null;
  try {
    const orgContext = useOrganization();
    organization = orgContext.organization;
    branding = orgContext.branding;
  } catch (e) {
    // Not in org context, that's fine (e.g., admin pages)
  }

  // Determine display name and logo
  const displayName = organization?.name || org?.name || "ReplayHub";
  const logoUrl = branding?.logoUrl || branding?.logo;

  // Convert relative logo URL to full URL for Next.js Image component
  const fullLogoUrl = logoUrl?.startsWith("/") ? `${getServerUrl()}${logoUrl}` : logoUrl;

  // Convert relative avatar URL to full URL
  const avatarUrl = globalUser?.avatar?.startsWith("/")
    ? `${getServerUrl()}${globalUser.avatar}`
    : globalUser?.avatar;

  const handleLogout = async () => {
    try {
      await logoutGlobal();
      // Redirect to login after successful logout
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Impersonation Banner (only query for global admins to avoid 401 redirects for org users) */}
      <ImpersonationBanner orgName={org?.name} enabled={globalUser?.isGlobalAdmin === true} />

      <header
        data-topbar="true"
        className="h-20 border-b bg-card flex items-center justify-between px-6 shadow-modern"
      >
        {/* Left side */}
        <div className="flex items-center gap-6">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMobileMenuToggle}>
            <Menu className="h-6 w-6" />
          </Button>

          <Link href="/" className="flex items-center gap-3">
            {fullLogoUrl ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={fullLogoUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
            )}
            <h1 className="text-2xl font-bold tracking-tight font-montserrat hidden sm:block">
              {displayName}
            </h1>
          </Link>
          {org && <Breadcrumbs org={org} />}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Show different UI for admin vs org pages */}
          {isAdminPage ? (
            <Button
              variant="outline"
              size="default"
              className="flex items-center gap-3 px-4 py-2 font-montserrat"
              disabled
            >
              <Shield className="h-5 w-5" />
              <span className="hidden sm:inline-block font-semibold">Global Admin</span>
            </Button>
          ) : (
            <OrgSwitcher currentOrg={organization || org} />
          )}

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="default"
              className="flex items-center gap-3 px-4 py-2 hover:bg-accent"
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
              }}
            >
              <div className="h-8 w-8 rounded-full overflow-hidden gradient-primary flex items-center justify-center">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={globalUser?.name || globalUser?.email || "User"}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
              <span className="hidden sm:inline-block text-base font-medium">
                {globalUser?.name || globalUser?.email || "User"}
              </span>
            </Button>

            {dropdownOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-card border rounded-md shadow-lg z-50 p-2">
                  <div className="py-3 px-2 opacity-60 cursor-not-allowed">
                    <User className="inline-block mr-3 h-5 w-5" />
                    <span className="font-medium">
                      {globalUser?.name || globalUser?.email || "Not logged in"}
                    </span>
                  </div>
                  <div className="h-px bg-border my-1" />
                  {globalUser && (
                    <>
                      {(org?.slug || organization?.slug) && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            const slug = org?.slug || organization?.slug;
                            router.push(`/org/${slug}/profile`);
                          }}
                          className="w-full py-3 px-2 hover:bg-accent rounded cursor-pointer text-left"
                        >
                          <User className="inline-block mr-3 h-5 w-5" />
                          <span className="font-medium">My Profile</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          router.push(adminPath.controlCenter());
                        }}
                        className="w-full py-3 px-2 hover:bg-accent rounded cursor-pointer text-left"
                      >
                        <Shield className="inline-block mr-3 h-5 w-5" />
                        <span className="font-medium">Global Control Center</span>
                      </button>
                      <div className="h-px bg-border my-1" />
                    </>
                  )}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-3 px-2 hover:bg-accent rounded cursor-pointer text-left"
                  >
                    <LogOut className="inline-block mr-3 h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
