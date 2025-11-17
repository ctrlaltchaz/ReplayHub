"use client";

import { AppButton } from "@/components/ui/AppButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiGet } from "@/lib/api/client";
import { ArrowRight, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Organization {
    id: string;
    name: string;
    slug: string;
    description?: string;
    brandingJson?: {
        logoUrl?: string;
        iconUrl?: string;
        primaryColor?: string;
        description?: string;
    };
}

export function OrgSelectClient() {
    const router = useRouter();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching organizations from /global/orgs');
                const response = await apiGet<{ organisations?: Organization[], organizations?: Organization[] }>('/global/orgs');
                console.log('API Response:', response);
                const orgs = response.organisations || response.organizations || [];
                console.log('Organizations found:', orgs.length, orgs);

                // Auto-redirect if only one org
                if (orgs.length === 1) {
                    router.push(`/org/${orgs[0].slug}/dashboard`);
                    return;
                }

                setOrganizations(orgs);
            } catch (err: any) {
                console.error('Failed to fetch organizations:', err);
                setError(err.message || 'Failed to load organizations');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrganizations();
    }, [router]);

    const handleSelectOrg = (slug: string) => {
        router.push(`/org/${slug}/dashboard`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading organizations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <EmptyState
                        icon={<Building2 className="h-12 w-12" />}
                        title="Failed to Load Organizations"
                        description={error}
                        cta={
                            <AppButton onClick={() => router.push("/login")}>
                                Go to Login
                            </AppButton>
                        }
                    />
                </div>
            </div>
        );
    }

    if (organizations.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <EmptyState
                        icon={<Building2 className="h-12 w-12" />}
                        title="No Organizations Found"
                        description="You don't have access to any organizations yet."
                        cta={
                            <AppButton onClick={() => router.push("/admin/get-started")}>
                                Create an Organization
                            </AppButton>
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Select Organization</h1>
                    <p className="mt-2 text-muted-foreground">
                        Choose which organization you&apos;d like to access
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {organizations.map((org) => {
                        const logoUrl = org.brandingJson?.logoUrl || org.brandingJson?.iconUrl;
                        const description = org.brandingJson?.description || org.description;

                        return (
                            <Card
                                key={org.id}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleSelectOrg(org.slug)}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {logoUrl ? (
                                                <img
                                                    src={logoUrl}
                                                    alt={org.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <span className="font-montserrat">{org.name}</span>
                                    </CardTitle>
                                    {description && (
                                        <CardDescription className="mt-2">
                                            {description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <AppButton
                                        variant="outline"
                                        className="w-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectOrg(org.slug);
                                        }}
                                    >
                                        Access Organization
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </AppButton>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-12 text-center">
                    <AppButton
                        variant="ghost"
                        onClick={() => router.push("/login")}
                    >
                        Switch Account
                    </AppButton>
                </div>
            </div>
        </div>
    );
}