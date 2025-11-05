'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useUpdatePlayerSettings } from '@/hooks/profile/useUpdatePlayerSettings';
import { getServerUrl } from '@/lib/api/config';
import { BarChart3, Eye, EyeOff, Target, TrendingUp, Trophy, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface GameBreakdown {
    gamesPlayed: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    mvps: number;
    avgRating: number;
    kda: number;
}

interface RecentMatch {
    matchId: string;
    teamName?: string;
    opponent: string;
    result: 'win' | 'loss' | 'draw' | null;
    date: Date;
    avgRating: number;
    mvp: boolean;
}

interface PlayerStats {
    playerId: string;
    totalGames: number;
    totalMatches: number;
    totalMvps: number;
    avgRating: number;
    gameBreakdown: Record<string, GameBreakdown>;
    recentPerformance: RecentMatch[];
}

interface PlayerStatsCardProps {
    playerId: string;
    slug: string;
    showPrivacyToggle?: boolean;
    statsVisible?: boolean;
}

export function PlayerStatsCard({ playerId, slug, showPrivacyToggle = false, statsVisible = true }: PlayerStatsCardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const updateSettings = useUpdatePlayerSettings(slug, playerId);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch(
                    `${getServerUrl()}/api/org/${slug}/players/${playerId}/game-stats`,
                    {
                        credentials: 'include',
                    }
                );

                if (response.ok) {
                    const text = await response.text();
                    // Handle empty response
                    if (!text) {
                        setStats(null);
                        return;
                    }
                    const data = JSON.parse(text);
                    setStats(data);
                } else {
                    setStats(null);
                }
            } catch (error) {
                console.error('Error fetching player stats:', error);
                setStats(null);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [playerId, slug]);

    const handleStatsVisibilityToggle = async (checked: boolean) => {
        try {
            await updateSettings.mutateAsync({ statsVisible: checked });
            toast({
                title: "Privacy settings updated",
                description: `Your game statistics are now ${checked ? 'visible' : 'hidden'} to other players.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update privacy settings",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Game Statistics
                    </CardTitle>
                    <CardDescription>Loading player statistics...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!stats) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Game Statistics
                    </CardTitle>
                    <CardDescription>Competitive performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">No Matches Recorded</p>
                        <p className="text-sm text-muted-foreground">
                            Game statistics will appear here once you have played matches
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getResultBadgeColor = (result: string | null) => {
        switch (result) {
            case 'win':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'loss':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'draw':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 8) return 'text-green-500';
        if (rating >= 6) return 'text-blue-500';
        if (rating >= 4) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Game Statistics
                </CardTitle>
                <CardDescription>Competitive performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center p-3 rounded-lg border bg-card">
                        <Target className="h-6 w-6 text-blue-500 mb-2" />
                        <p className="text-2xl font-bold">{stats.totalMatches}</p>
                        <p className="text-xs text-muted-foreground">Matches</p>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg border bg-card">
                        <Zap className="h-6 w-6 text-purple-500 mb-2" />
                        <p className="text-2xl font-bold">{stats.totalGames}</p>
                        <p className="text-xs text-muted-foreground">Games</p>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg border bg-card">
                        <Trophy className="h-6 w-6 text-yellow-500 mb-2" />
                        <p className="text-2xl font-bold">{stats.totalMvps}</p>
                        <p className="text-xs text-muted-foreground">MVPs</p>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg border bg-card">
                        <TrendingUp className="h-6 w-6 text-green-500 mb-2" />
                        <p className={`text-2xl font-bold ${getRatingColor(stats.avgRating)}`}>
                            {stats.avgRating}
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Rating</p>
                    </div>
                </div>

                {/* Privacy Toggle */}
                {showPrivacyToggle && (
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    {statsVisible ? (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <Label htmlFor="stats-visibility-card" className="text-base cursor-pointer">
                                        Statistics Visibility
                                    </Label>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {statsVisible
                                        ? "Your game statistics are visible to other players"
                                        : "Your game statistics are hidden from other players"}
                                </p>
                            </div>
                            <Switch
                                id="stats-visibility-card"
                                checked={statsVisible}
                                onCheckedChange={handleStatsVisibilityToggle}
                                disabled={updateSettings.isPending}
                            />
                        </div>
                    </div>
                )}

                {/* Game Breakdown */}
                {stats.gameBreakdown && Object.keys(stats.gameBreakdown).length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Performance by Game</h3>
                        {Object.entries(stats.gameBreakdown).map(([game, breakdown]) => (
                            <div key={game} className="p-4 rounded-lg border bg-card space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">{game}</p>
                                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                        {breakdown.gamesPlayed} {breakdown.gamesPlayed === 1 ? 'game' : 'games'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    <div>
                                        <p className="text-xs text-muted-foreground">K/D/A</p>
                                        <p className="text-sm font-semibold">
                                            {breakdown.totalKills}/{breakdown.totalDeaths}/{breakdown.totalAssists}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">KDA</p>
                                        <p className="text-sm font-semibold">{breakdown.kda}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Rating</p>
                                        <p className={`text-sm font-semibold ${getRatingColor(breakdown.avgRating)}`}>
                                            {breakdown.avgRating}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">MVPs</p>
                                        <p className="text-sm font-semibold">{breakdown.mvps}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recent Performance */}
                {stats.recentPerformance && stats.recentPerformance.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Recent Matches</h3>
                        <div className="space-y-2">
                            {stats.recentPerformance.map((match) => (
                                <div
                                    key={match.matchId}
                                    onClick={() => router.push(`/org/${slug}/gamelog/${match.matchId}`)}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="flex flex-col">
                                            <p className="font-medium text-sm">
                                                {match.teamName && `${match.teamName} vs `}
                                                {match.opponent}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(match.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {match.mvp && (
                                            <div title="MVP">
                                                <Trophy className="h-4 w-4 text-yellow-500" />
                                            </div>
                                        )}
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full border ${getResultBadgeColor(
                                                match.result
                                            )}`}
                                        >
                                            {match.result || 'N/A'}
                                        </span>
                                        <span className={`text-sm font-semibold ${getRatingColor(match.avgRating)}`}>
                                            {match.avgRating}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
