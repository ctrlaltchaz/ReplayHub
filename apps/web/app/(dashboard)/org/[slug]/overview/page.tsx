'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/api/client';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { hasPermission, PERMISSIONS } from '@/lib/permissions/utils';
import { AlertTriangle, Calendar, Lightbulb, Package, RefreshCw, Target, Trophy, Users } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OrgOverview {
    totalEvents?: number;
    totalPlayers?: number;
    totalTeams?: number;
    openIncidents?: number;
    equipmentInUse?: number;
    upcomingEvents?: number;
}

const quickTips = [
    {
        icon: Trophy,
        title: "Manage Your Teams",
        description: "Create teams, assign captains, and manage rosters all in one place."
    },
    {
        icon: Calendar,
        title: "Schedule Events",
        description: "Plan matches, tournaments, and practice sessions with our calendar."
    },
    {
        icon: Package,
        title: "Track Inventory",
        description: "Keep tabs on equipment, peripherals, and resources for your org."
    },
    {
        icon: Target,
        title: "Set Lineups",
        description: "Configure starting lineups and substitute positions for each match."
    },
];

export default function OverviewPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { permissions } = useAuth();

    usePageTitle('Overview');

    const [overview, setOverview] = useState<OrgOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOverview = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch data from multiple endpoints in parallel
            const [events, rosters, incidents, inventory] = await Promise.allSettled([
                apiGet<{ total: number; upcoming?: number }>(`/org/${slug}/events/summary`),
                apiGet<{ totalPlayers: number; totalTeams?: number }>(`/org/${slug}/rosters/stats`),
                apiGet<{ open: number }>(`/org/${slug}/incidents/summary`),
                apiGet<{ inUse: number }>(`/org/${slug}/inventory/summary`),
            ]);

            setOverview({
                totalEvents: events.status === 'fulfilled' ? events.value.total : undefined,
                upcomingEvents: events.status === 'fulfilled' ? events.value.upcoming : undefined,
                totalPlayers: rosters.status === 'fulfilled' ? rosters.value.totalPlayers : undefined,
                totalTeams: rosters.status === 'fulfilled' ? rosters.value.totalTeams : undefined,
                openIncidents: incidents.status === 'fulfilled' ? incidents.value.open : undefined,
                equipmentInUse: inventory.status === 'fulfilled' ? inventory.value.inUse : undefined,
            });
        } catch (err) {
            console.error('Failed to fetch org overview:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch overview data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (slug) {
            fetchOverview();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                        <p className="text-muted-foreground">
                            Organization dashboard and statistics
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                                </CardContent>
                            </Card>
                        ))}
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
                        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                        <p className="text-muted-foreground">
                            Organization dashboard and statistics
                        </p>
                    </div>

                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>Failed to load overview: {error}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchOverview}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold font-montserrat tracking-tight">Overview</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome to your esports operations dashboard
                    </p>
                </div>

                {/* Introduction Card */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 font-montserrat">
                            <img
                                src="https://assets.mckeonwebsolutions.com/replayhub/replaylogo.png"
                                alt="ReplayHub"
                                className="h-20 w-20 object-contain"
                            />
                            Welcome to ReplayHub
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            This platform helps you manage every aspect of your esports organization.
                            Create and manage teams, schedule matches and tournaments, track your equipment inventory,
                            handle incidents and reports, and keep your entire operation organized in one place.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {hasPermission(permissions, PERMISSIONS.ROSTERS_MANAGE) && (
                                <Button asChild variant="default" size="sm">
                                    <a href={`/org/${slug}/rosters`}>
                                        <Trophy className="h-4 w-4 mr-2" />
                                        Manage Teams
                                    </a>
                                </Button>
                            )}
                            {hasPermission(permissions, PERMISSIONS.EVENTS_CREATE) && (
                                <Button asChild variant="outline" size="sm">
                                    <a href={`/org/${slug}/events`}>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Schedule Events
                                    </a>
                                </Button>
                            )}
                            {hasPermission(permissions, PERMISSIONS.INVENTORY_VIEW) && (
                                <Button asChild variant="outline" size="sm">
                                    <a href={`/org/${slug}/inventory`}>
                                        <Package className="h-4 w-4 mr-2" />
                                        View Inventory
                                    </a>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div>
                    <h2 className="text-xl font-semibold font-montserrat mb-4">Organization Statistics</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Teams
                                </CardTitle>
                                <Trophy className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold font-montserrat">
                                    {overview?.totalTeams !== undefined ? overview.totalTeams : '-'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Active competitive teams
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Players
                                </CardTitle>
                                <Users className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold font-montserrat">
                                    {overview?.totalPlayers !== undefined ? overview.totalPlayers : '-'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Registered roster members
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Upcoming Events
                                </CardTitle>
                                <Calendar className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold font-montserrat">
                                    {overview?.upcomingEvents !== undefined ? overview.upcomingEvents : '-'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Scheduled matches & tournaments
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Events
                                </CardTitle>
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold font-montserrat">
                                    {overview?.totalEvents !== undefined ? overview.totalEvents : '-'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    All-time event count
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Equipment In Use
                                </CardTitle>
                                <Package className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold font-montserrat">
                                    {overview?.equipmentInUse !== undefined ? overview.equipmentInUse : '-'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Currently allocated items
                                </p>
                            </CardContent>
                        </Card>

                        <Card className={`hover:shadow-lg transition-shadow ${overview?.openIncidents && overview.openIncidents > 0 ? 'border-orange-500/50' : ''}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Open Incidents
                                </CardTitle>
                                <AlertTriangle className={`h-5 w-5 ${overview?.openIncidents && overview.openIncidents > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold font-montserrat">
                                    {overview?.openIncidents !== undefined ? overview.openIncidents : '-'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Requiring attention
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Quick Tips Section */}
                <div>
                    <h2 className="text-xl font-semibold font-montserrat mb-4 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Quick Tips
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {quickTips.map((tip, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base font-montserrat">
                                        <tip.icon className="h-5 w-5 text-primary" />
                                        {tip.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {tip.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Additional Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-montserrat">Need Help?</CardTitle>
                        <CardDescription>
                            Explore the navigation menu on the left to access different modules.
                            Each section is designed to help you manage specific aspects of your esports organization efficiently.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
