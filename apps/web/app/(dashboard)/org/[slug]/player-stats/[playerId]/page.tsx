"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayer } from "@/hooks/rosters/usePlayers";
import { getServerUrl } from "@/lib/api/config";
import { ArrowLeft, BarChart3, Lock, Target, TrendingUp, Trophy, User, Zap } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  result: "win" | "loss" | "draw" | null;
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

export default function PlayerStatsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const playerId = params?.playerId as string;

  const { data: player, isLoading: playerLoading } = usePlayer(slug, playerId);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (!slug || !playerId) return;

    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch(
          `${getServerUrl()}/api/org/${slug}/players/${playerId}/game-stats`,
          { credentials: "include" }
        );

        if (response.ok) {
          const text = await response.text();
          if (text) {
            try {
              const data = JSON.parse(text);
              // Check if stats object is empty or has no data
              if (!data || Object.keys(data).length === 0) {
                setStats(null);
              } else {
                setStats(data);
                setIsPrivate(false);
              }
            } catch (e) {
              console.error("Error parsing stats:", e);
              setStats(null);
            }
          } else {
            setStats(null);
          }
        } else {
          setStats(null);
          // Check if player has stats private
          if (player?.statsVisible === false) {
            setIsPrivate(true);
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    };

    if (player) {
      fetchStats();
    }
  }, [slug, playerId, player]);

  const loading = playerLoading || statsLoading;

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Player Not Found</CardTitle>
            <CardDescription>The requested player could not be found.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-500";
    if (rating >= 6) return "text-blue-500";
    if (rating >= 4) return "text-yellow-500";
    return "text-red-500";
  };

  const getResultBadgeColor = (result: string | null) => {
    switch (result) {
      case "win":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "loss":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "draw":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const totalKills = stats
    ? Object.values(stats.gameBreakdown).reduce((acc, game) => acc + game.totalKills, 0)
    : 0;
  const totalDeaths = stats
    ? Object.values(stats.gameBreakdown).reduce((acc, game) => acc + game.totalDeaths, 0)
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/org/${slug}/player-stats`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
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
          <div>
            <h1 className="text-3xl font-bold">{player.gamerTag}</h1>
            {player.realName && <p className="text-muted-foreground">{player.realName}</p>}
          </div>
        </div>
      </div>

      {/* Privacy Message */}
      {isPrivate && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
              <Lock className="h-5 w-5" />
              Statistics Private
            </CardTitle>
            <CardDescription>
              This player has chosen to keep their game statistics private.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Stats Content */}
      {!isPrivate && stats && (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Target className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-3xl font-bold">{stats.totalMatches}</p>
                  <p className="text-sm text-muted-foreground">Total Matches</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Zap className="h-8 w-8 text-red-500 mb-2" />
                  <p className="text-3xl font-bold">{totalKills}</p>
                  <p className="text-sm text-muted-foreground">Total Kills</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Trophy className="h-8 w-8 text-gray-500 mb-2" />
                  <p className="text-3xl font-bold">{totalDeaths}</p>
                  <p className="text-sm text-muted-foreground">Total Deaths</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                  <p className={`text-3xl font-bold ${getRatingColor(stats.avgRating)}`}>
                    {stats.avgRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Logs (click to view rounds and stats) */}
          {stats.recentPerformance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Game Logs
                </CardTitle>
                <CardDescription>
                  Click a game log to see all rounds and per-player stats.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.recentPerformance.map((match) => (
                  <div
                    key={match.matchId}
                    onClick={() => router.push(`/org/${slug}/gamelog/${match.matchId}/stats`)}
                    className="flex flex-col gap-3 p-4 rounded-lg border bg-card hover:bg-accent/60 transition-colors cursor-pointer md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {match.teamName
                          ? `${match.teamName} vs ${match.opponent}`
                          : `vs ${match.opponent}`}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        {new Date(match.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        {match.result && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-xs capitalize">
                            {match.result}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="text-right">
                        <p className="text-xs uppercase text-muted-foreground">Avg Rating</p>
                        <p className={`text-lg font-semibold ${getRatingColor(match.avgRating)}`}>
                          {match.avgRating.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                        {match.mvp && <Trophy className="h-4 w-4" />}
                        {match.mvp ? "MVP" : "No MVP"}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Match History */}
          {stats.recentPerformance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Match History</CardTitle>
                <CardDescription>Recent performance in competitive matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.recentPerformance.map((match) => (
                    <div
                      key={match.matchId}
                      onClick={() => router.push(`/org/${slug}/gamelog/${match.matchId}`)}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col">
                          <p className="font-medium">
                            {match.teamName && `${match.teamName} vs `}
                            {match.opponent}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(match.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {match.mvp && (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Trophy className="h-4 w-4" />
                            <span className="text-sm font-medium">MVP</span>
                          </div>
                        )}
                        <span
                          className={`text-sm px-3 py-1 rounded-full border font-medium ${getResultBadgeColor(
                            match.result
                          )}`}
                        >
                          {match.result?.toUpperCase() || "N/A"}
                        </span>
                        <div className="text-right min-w-[60px]">
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <p className={`text-lg font-bold ${getRatingColor(match.avgRating)}`}>
                            {match.avgRating.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* No Stats */}
      {!isPrivate && !stats && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Statistics Recorded</h3>
              <p className="text-muted-foreground">
                This player hasn't participated in any recorded matches yet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
