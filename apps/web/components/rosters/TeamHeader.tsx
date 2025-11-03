import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import type { Team } from '@/types/roster';
import { Calendar, Edit, Settings, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

interface TeamHeaderProps {
    team: Team;
    slug: string;
}

export function TeamHeader({ team, slug }: TeamHeaderProps) {
    const { hasPermission } = usePermissions();
    const canManage = hasPermission('roster.manage');

    const starterCount = team.members?.filter(m => m.isStarter).length || 0;
    const benchCount = (team.members?.length || 0) - starterCount;

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {team.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <Badge variant="secondary" className="text-sm">
                                {team.game}
                            </Badge>
                            {team.season && (
                                <Badge variant="outline" className="text-sm">
                                    {team.season}
                                </Badge>
                            )}
                            <Badge
                                variant={team.status === 'active' ? 'default' : 'secondary'}
                                className="text-sm"
                            >
                                {team.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {canManage && (
                        <>
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Team
                            </Button>
                            <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Button>
                        </>
                    )}
                    <Button size="sm" asChild>
                        <Link href={`/org/${slug}/events?team=${team.id}`}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Assign to Event
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Roster Size</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{team.members?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {starterCount} starters, {benchCount} bench
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{team.achievements?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Team accomplishments
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Coach</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {team.coachId ? '✓' : '—'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {team.coachId ? 'Assigned' : 'No coach assigned'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}