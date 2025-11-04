"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayers } from "@/hooks/rosters/usePlayers";
import { getServerUrl } from "@/lib/api/config";
import { BarChart3, Search, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PlayerStats {
    id: string;
    gamerTag: string;
    realName?: string;
    avatar?: string;
    role?: string;
    rank?: string;
    isActive: boolean;
    statsVisible?: boolean;
    teams?: Array<{
        id: string;
        team: {
            name: string;
            game: string;
        };
    }>;
    stats?: {
        totalMatches: number;
        totalGames: number;
        avgRating: number;
        totalMvps: number;
    };
}

export default function PlayerStatsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const { data: playersData, isLoading: playersLoading, error: playersError } = usePlayers(slug, { active: true });

    const [playersWithStats, setPlayersWithStats] = useState<PlayerStats[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [gameFilter, setGameFilter] = useState<string>("all");
    const [teamFilter, setTeamFilter] = useState<string>("all");
    const [activeFilter, setActiveFilter] = useState<string>("all");

    useEffect(() => {
        if (!playersData || !slug) return;

        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                // Fetch stats for each player
                const playersWithStatsData = await Promise.all(
                    playersData.map(async (player: any) => {
                        // Only fetch stats if player has made them visible
                        if (player.statsVisible === false) {
                            return { ...player, stats: null };
                        }

                        try {
                            const statsResponse = await fetch(
                                `${getServerUrl()}/api/org/${slug}/players/${player.id}/game-stats`,
                                { credentials: "include" }
                            );

                            if (statsResponse.ok) {
                                const stats = await statsResponse.json();
                                return { ...player, stats };
                            }
                            return { ...player, stats: null };
                        } catch {
                            return { ...player, stats: null };
                        }
                    })
                );

                setPlayersWithStats(playersWithStatsData);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, [playersData, slug]);

    // Get unique games from teams
    const availableGames = Array.from(
        new Set(
            playersWithStats.flatMap(p => p.teams?.map(t => t.team.game) || [])
        )
    ).filter(game => game && game.trim() !== '').sort();

    // Get unique teams
    const availableTeams = Array.from(
        new Set(
            playersWithStats.flatMap(p => p.teams?.map(t => JSON.stringify({ id: t.team.name, name: t.team.name })) || [])
        )
    ).map(t => JSON.parse(t)).filter(team => team.name && team.name.trim() !== '').sort((a, b) => a.name.localeCompare(b.name));

    // Filter players
    const filteredPlayers = playersWithStats.filter(player => {
        // Search filter
        const matchesSearch =
            player.gamerTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.realName?.toLowerCase().includes(searchQuery.toLowerCase());

        // Game filter
        const matchesGame = gameFilter === "all" ||
            player.teams?.some(t => t.team.game === gameFilter);

        // Team filter
        const matchesTeam = teamFilter === "all" ||
            player.teams?.some(t => t.team.name === teamFilter);

        // Active filter
        const matchesActive = activeFilter === "all" ||
            (activeFilter === "active" && player.isActive) ||
            (activeFilter === "inactive" && !player.isActive);

        return matchesSearch && matchesGame && matchesTeam && matchesActive;
    });

    const loading = playersLoading || loadingStats;
    const error = playersError;

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8" />
                    <div>
                        <h1 className="text-3xl font-bold">Player Statistics</h1>
                        <p className="text-muted-foreground">View game statistics for all players</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-20 w-20 rounded-lg" />
                                <Skeleton className="h-6 w-32 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>{error?.message || 'Failed to load players'}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8" />
                <div>
                    <h1 className="text-3xl font-bold">Player Statistics</h1>
                    <p className="text-muted-foreground">View game statistics for all players</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search players..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={gameFilter} onValueChange={setGameFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by game" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Games</SelectItem>
                                {availableGames.map(game => (
                                    <SelectItem key={game} value={game}>{game}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={teamFilter} onValueChange={setTeamFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by team" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Teams</SelectItem>
                                {availableTeams.map(team => (
                                    <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={activeFilter} onValueChange={setActiveFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Player Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlayers.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            No players found matching your filters.
                        </CardContent>
                    </Card>
                ) : (
                    filteredPlayers.map(player => (
                        <Card
                            key={player.id}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => router.push(`/org/${slug}/player-stats/${player.id}`)}
                        >
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-border shrink-0">
                                        {player.avatar ? (
                                            <img
                                                src={`${getServerUrl()}${player.avatar}`}
                                                alt={player.gamerTag}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg truncate">{player.gamerTag}</CardTitle>
                                        {player.realName && (
                                            <CardDescription className="truncate">{player.realName}</CardDescription>
                                        )}
                                        <div className="flex gap-2 mt-1 flex-wrap">
                                            {player.role && (
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                    {player.role}
                                                </span>
                                            )}
                                            {player.rank && (
                                                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                                                    {player.rank}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {player.teams && player.teams.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Teams</p>
                                        <div className="flex flex-wrap gap-1">
                                            {player.teams.map(tm => (
                                                <span
                                                    key={tm.id}
                                                    className="text-xs bg-muted px-2 py-1 rounded"
                                                >
                                                    {tm.team.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {player.stats ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-2xl font-bold">{player.stats.totalMatches}</p>
                                            <p className="text-xs text-muted-foreground">Matches</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{player.stats.totalGames}</p>
                                            <p className="text-xs text-muted-foreground">Games</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">
                                                {player.stats.avgRating > 0 ? player.stats.avgRating.toFixed(1) : '-'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Avg Rating</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{player.stats.totalMvps}</p>
                                            <p className="text-xs text-muted-foreground">MVPs</p>
                                        </div>
                                    </div>
                                ) : player.statsVisible === false ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Statistics are private
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No statistics recorded
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
