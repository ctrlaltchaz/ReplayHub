'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiQuery } from '@/lib/api/query';
import { Activity, AlertTriangle, Bug, Building, Lightbulb, Loader2, Users } from 'lucide-react';

interface OverviewStats {
    organisationCount: number;
    globalUserCount: number;
    activeTenantCount: number;
    recentIncidentCount: number;
}

interface FeedbackStats {
    totalSubmissions: number;
    openBugs: number;
    pendingSuggestions: number;
    resolvedThisWeek: number;
}

export function AdminOverviewStats() {
    const { data: stats, isLoading } = useApiQuery<OverviewStats>('/admin/overview', {
        staleTime: 60 * 1000, // 1 minute
    });

    const { data: feedbackStats } = useApiQuery<FeedbackStats>('/admin/feedback/statistics', {
        staleTime: 60 * 1000, // 1 minute
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.organisationCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Active tenants
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Global Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.globalUserCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Platform administrators
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Incidents (7d)</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.recentIncidentCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Last 7 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeTenantCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently active
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Feedback Statistics */}
            {feedbackStats && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">User Feedback</h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Open Bugs</CardTitle>
                                <Bug className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{feedbackStats.openBugs || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Needs attention
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Suggestions</CardTitle>
                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{feedbackStats.pendingSuggestions || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Awaiting review
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Resolved This Week</CardTitle>
                                <Activity className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{feedbackStats.resolvedThisWeek || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Last 7 days
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{feedbackStats.totalSubmissions || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    All time
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
