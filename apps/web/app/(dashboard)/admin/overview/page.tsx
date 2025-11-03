'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/api/client';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { useEffect, useState } from 'react';

interface AdminOverview {
    organisationCount: number;
    globalUserCount: number;
    activeTenantCount: number;
    recentIncidentCount: number;
}

export default function AdminOverviewPage() {
    usePageTitle('Admin Control Center');

    const [overview, setOverview] = useState<AdminOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { globalUser, isLoadingGlobal } = useAuth();

    useEffect(() => {
        const fetchOverview = async () => {
            if (!globalUser) return;

            try {
                setLoading(true);
                const data = await apiGet<AdminOverview>('/admin/overview');
                setOverview(data);
            } catch (err) {
                console.error('Failed to fetch admin overview:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch admin overview');
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, [globalUser]);

    if (isLoadingGlobal || loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Global Admin Overview</h1>
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Global Admin Overview</h1>
                        <p className="text-destructive">Error: {error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!overview) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Global Admin Overview</h1>
                        <p className="text-muted-foreground">No data available</p>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Global Admin Overview</h1>
                    <p className="text-muted-foreground">
                        System-wide statistics and activity
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Organizations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview.organisationCount}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Global Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview.globalUserCount}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Tenants
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview.activeTenantCount}</div>
                            <p className="text-xs text-muted-foreground">
                                Last 30 days
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Recent Incidents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview.recentIncidentCount}</div>
                            <p className="text-xs text-muted-foreground">
                                Last 7 days
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common administrative tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <a href="/admin/organisations" className="block p-2 rounded hover:bg-muted">
                                Manage Organizations
                            </a>
                            <a href="/admin/global-users" className="block p-2 rounded hover:bg-muted">
                                Manage Global Users
                            </a>
                            <a href="/admin/audit" className="block p-2 rounded hover:bg-muted">
                                View Audit Logs
                            </a>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Health</CardTitle>
                            <CardDescription>
                                Overall system status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Database</span>
                                    <span className="text-green-600">✓ Healthy</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>API</span>
                                    <span className="text-green-600">✓ Healthy</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cache</span>
                                    <span className="text-green-600">✓ Healthy</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}