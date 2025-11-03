"use client";

import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/lib/api/query";
import { Building2, Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

    const { data: organizations, isLoading } = useApiQuery<Organization[]>(
        "/global/orgs",
        {
            staleTime: 5 * 60 * 1000, // 5 minutes
        }
    );

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
                <span className="hidden sm:inline-block">
                    {currentOrg?.name || "Select Organization"}
                </span>
                <ChevronDown className="h-3 w-3" />
            </Button>

            {dropdownOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setDropdownOpen(false)}
                    />

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
                                        {currentOrg?.slug === org.slug && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
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