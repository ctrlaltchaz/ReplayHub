"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Edit2, Hash, Map, Trophy, Users } from "lucide-react";

interface ReviewQuestionProps {
    wizardState: {
        teamId?: string;
        teamName?: string;
        opponent?: string;
        startedAt?: string;
        bestOf?: number;
        maps?: Array<{
            mapName?: string;
            ourScore?: number;
            theirScore?: number;
        }>;
        playerStats?: Array<{
            playerId: string;
            playerName?: string;
            mapIndex?: number;
            role?: string;
            statsJson?: Record<string, any>;
            rating?: number;
            isMvp?: boolean;
        }>;
    };
    onEdit: (questionId: string) => void;
}

export function ReviewQuestion({ wizardState, onEdit }: ReviewQuestionProps) {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "Not set";
        try {
            return new Date(dateStr).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
            });
        } catch {
            return dateStr;
        }
    };

    const calculateMatchResult = () => {
        if (!wizardState.maps?.length) return null;

        let wins = 0;
        let losses = 0;

        wizardState.maps.forEach(map => {
            if (map.ourScore !== undefined && map.theirScore !== undefined) {
                if (map.ourScore > map.theirScore) wins++;
                else if (map.theirScore > map.ourScore) losses++;
            }
        });

        if (wins > losses) return { result: "win", score: `${wins}-${losses}` };
        if (losses > wins) return { result: "loss", score: `${wins}-${losses}` };
        if (wins === losses && wins > 0) return { result: "draw", score: `${wins}-${losses}` };
        return null;
    };

    const matchResult = calculateMatchResult();

    const statsCount = wizardState.playerStats?.filter(
        stat => Object.keys(stat.statsJson || {}).length > 0
    ).length || 0;

    const mvpCount = wizardState.playerStats?.filter(stat => stat.isMvp).length || 0;

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Review Match Details</h3>
                <p className="text-muted-foreground">
                    Please review all information before submitting
                </p>
            </div>

            {/* Match Basics */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Match Information</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit("team")}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Trophy className="h-4 w-4" />
                                <span>Team</span>
                            </div>
                            <p className="font-medium">{wizardState.teamName || "Not set"}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>Opponent</span>
                            </div>
                            <p className="font-medium">{wizardState.opponent || "Not set"}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Date & Time</span>
                            </div>
                            <p className="font-medium">{formatDate(wizardState.startedAt)}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Hash className="h-4 w-4" />
                                <span>Format</span>
                            </div>
                            <p className="font-medium">
                                Best of {wizardState.bestOf || 1}
                            </p>
                        </div>
                    </div>

                    {matchResult && (
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Match Result</span>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={
                                            matchResult.result === "win"
                                                ? "default"
                                                : matchResult.result === "loss"
                                                    ? "destructive"
                                                    : "secondary"
                                        }
                                        className="text-base px-3 py-1"
                                    >
                                        {matchResult.result.toUpperCase()}
                                    </Badge>
                                    <span className="font-bold text-lg">{matchResult.score}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Maps */}
            {wizardState.maps && wizardState.maps.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Maps Played</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit("map-0")}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {wizardState.maps.map((map, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-background border">
                                            <Map className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {map.mapName || `Map ${idx + 1}`}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Round {idx + 1}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">
                                            {map.ourScore ?? 0} - {map.theirScore ?? 0}
                                        </p>
                                        {map.ourScore !== undefined && map.theirScore !== undefined && (
                                            <Badge
                                                variant={
                                                    map.ourScore > map.theirScore
                                                        ? "default"
                                                        : map.ourScore < map.theirScore
                                                            ? "destructive"
                                                            : "secondary"
                                                }
                                                className="text-xs"
                                            >
                                                {map.ourScore > map.theirScore
                                                    ? "Won"
                                                    : map.ourScore < map.theirScore
                                                        ? "Lost"
                                                        : "Draw"}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Player Stats Summary */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Player Statistics</CardTitle>
                        {statsCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit("stats-map0-player0")}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <CardDescription>
                        {statsCount === 0
                            ? "No player stats recorded"
                            : `${statsCount} player stat ${statsCount === 1 ? "entry" : "entries"} recorded`}
                    </CardDescription>
                </CardHeader>
                {statsCount > 0 && (
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg border bg-muted/50">
                                <p className="text-sm text-muted-foreground mb-1">Total Entries</p>
                                <p className="text-2xl font-bold">{statsCount}</p>
                            </div>
                            {mvpCount > 0 && (
                                <div className="p-3 rounded-lg border bg-muted/50">
                                    <p className="text-sm text-muted-foreground mb-1">MVPs</p>
                                    <p className="text-2xl font-bold">⭐ {mvpCount}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Submission Warning */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400">ℹ</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-blue-900 dark:text-blue-100">
                                Ready to Submit
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                Once submitted, this match will be saved as a draft. You can edit it later
                                or submit it for approval by a team manager or administrator.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
