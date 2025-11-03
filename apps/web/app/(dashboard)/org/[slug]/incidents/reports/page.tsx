'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BarChart3, Loader2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useIncidentReports } from '../hooks/useIncidentReports';

const categoryColors = {
    tech: 'bg-blue-500',
    comms: 'bg-purple-500',
    people: 'bg-green-500',
    safety: 'bg-red-500',
    other: 'bg-gray-500',
};

const severityColors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
};

const statusColors = {
    open: 'bg-red-500',
    in_progress: 'bg-yellow-500',
    resolved: 'bg-green-500',
    dismissed: 'bg-gray-500',
};

export default function IncidentReportsPage() {
    const params = useParams();
    const { toast } = useToast();
    const orgSlug = params?.slug as string;

    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const { data: reportData, isLoading, refetch } = useIncidentReports(orgSlug, {
        from: dateFrom || undefined,
        to: dateTo || undefined,
    });

    const handleApplyFilters = () => {
        refetch();
    };

    const getPercentage = (value: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href={`/org/${orgSlug}/incidents`}>
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Incidents
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <BarChart3 className="w-6 h-6" />
                            Incident Reports & Analytics
                        </h1>
                        <p className="text-muted-foreground">
                            Analyze incident trends and patterns over time
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Date Range Filter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dateFrom">From Date</Label>
                                <Input
                                    id="dateFrom"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateTo">To Date</Label>
                                <Input
                                    id="dateTo"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleApplyFilters} className="w-full">
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : reportData ? (
                    <>
                        {/* Summary Stats */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-3xl font-bold">{reportData.totalIncidents}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Total Incidents
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-3xl font-bold text-red-600">
                                        {reportData.byStatus.open}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Open</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-3xl font-bold text-yellow-600">
                                        {reportData.byStatus.in_progress}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">In Progress</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-3xl font-bold text-green-600">
                                        {reportData.byStatus.resolved}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Resolved</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* By Category */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Incidents by Category</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {Object.entries(reportData.byCategory).map(([category, count]) => {
                                        const percentage = getPercentage(count, reportData.totalIncidents);
                                        return (
                                            <div key={category} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="capitalize">{category}</span>
                                                    <span className="font-semibold">
                                                        {count} ({percentage}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${categoryColors[category as keyof typeof categoryColors]}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* By Severity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Incidents by Severity</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {Object.entries(reportData.bySeverity).map(([severity, count]) => {
                                        const percentage = getPercentage(count, reportData.totalIncidents);
                                        return (
                                            <div key={severity} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="capitalize">{severity}</span>
                                                    <span className="font-semibold">
                                                        {count} ({percentage}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${severityColors[severity as keyof typeof severityColors]}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* By Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Incidents by Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {Object.entries(reportData.byStatus).map(([status, count]) => {
                                        const percentage = getPercentage(count, reportData.totalIncidents);
                                        return (
                                            <div key={status} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="capitalize">
                                                        {status.replace('_', ' ')}
                                                    </span>
                                                    <span className="font-semibold">
                                                        {count} ({percentage}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${statusColors[status as keyof typeof statusColors]}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Top Tags */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Most Common Tags</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {reportData.topTags.length > 0 ? (
                                        <div className="space-y-3">
                                            {reportData.topTags.slice(0, 10).map((tag) => (
                                                <div
                                                    key={tag.tag}
                                                    className="flex items-center justify-between"
                                                >
                                                    <Badge variant="outline">{tag.tag}</Badge>
                                                    <span className="text-sm font-semibold">
                                                        {tag.count}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No tags found
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Date Range Info */}
                        {reportData.dateRange && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>
                                            Showing data from{' '}
                                            {new Date(reportData.dateRange.from).toLocaleDateString()} to{' '}
                                            {new Date(reportData.dateRange.to).toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                            <p className="text-sm text-muted-foreground">
                                Unable to load report data. Please try again.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
