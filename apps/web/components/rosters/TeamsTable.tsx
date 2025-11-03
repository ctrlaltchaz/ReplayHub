import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import type { Team } from '@/types/roster';
import { Calendar, Eye, Settings, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

interface TeamsTableProps {
    teams: Team[];
    slug: string;
    isLoading?: boolean;
}

export function TeamsTable({ teams, slug, isLoading }: TeamsTableProps) {
    const { hasPermission } = usePermissions();
    const canManage = hasPermission('roster.manage');

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Teams</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (teams.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Teams</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-medium text-muted-foreground">No teams found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Get started by creating your first team.
                        </p>
                        {canManage && (
                            <div className="mt-6">
                                <Button>
                                    <Users className="mr-2 h-4 w-4" />
                                    Create Team
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Teams</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Team</TableHead>
                            <TableHead>Game</TableHead>
                            <TableHead>Season</TableHead>
                            <TableHead>Roster</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Achievements</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teams.map((team) => (
                            <TableRow key={team.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                            {team.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium">{team.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {team.coachId ? 'Coached' : 'No coach assigned'}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{team.game}</Badge>
                                </TableCell>
                                <TableCell>{team.season || '—'}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>{team.members?.length || 0}</span>
                                        <span className="text-muted-foreground">
                                            ({team.members?.filter(m => m.isStarter).length || 0} starters)
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={team.status === 'active' ? 'default' : 'secondary'}
                                    >
                                        {team.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-yellow-500" />
                                        <span>{team.achievements?.length || 0}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/org/${slug}/rosters/teams/${team.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        {canManage && (
                                            <>
                                                <Button variant="ghost" size="sm">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/org/${slug}/events?team=${team.id}`}>
                                                        <Calendar className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}