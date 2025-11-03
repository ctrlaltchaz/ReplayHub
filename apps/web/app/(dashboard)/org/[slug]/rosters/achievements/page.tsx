"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import type { CreateAchievementDto } from "@/types/roster";
import { ArrowLeft, Award, Plus, Trash2, Trophy } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { usePlayersList } from "../hooks/usePlayersList";
import { useTeamsList } from "../hooks/useTeamsList";
import { CreateAchievementDialog } from "./components/CreateAchievementDialog";
import { useAchievementsList } from "./hooks/useAchievementsList";
import { useCreateAchievement } from "./hooks/useCreateAchievement";
import { useDeleteAchievement } from "./hooks/useDeleteAchievement";

export default function AchievementsPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { toast } = useToast();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [filterType, setFilterType] = useState<"all" | "team" | "player">("all");
    const [selectedTeamId, setSelectedTeamId] = useState<string>("");
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");

    // Build query params based on filters
    const queryParams = {
        ...(filterType === "team" && selectedTeamId && { teamId: selectedTeamId }),
        ...(filterType === "player" && selectedPlayerId && { playerId: selectedPlayerId }),
    };

    const { data: achievements = [], isLoading } = useAchievementsList(slug, queryParams);
    const { data: teams = [] } = useTeamsList(slug);
    const { data: players = [] } = usePlayersList(slug);
    const createAchievementMutation = useCreateAchievement(slug);
    const deleteAchievementMutation = useDeleteAchievement(slug);

    const handleCreateAchievement = async (data: CreateAchievementDto) => {
        try {
            await createAchievementMutation.mutateAsync(data);
            toast({
                title: "Achievement created",
                description: "The achievement has been recorded successfully.",
            });
            setShowCreateDialog(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create achievement",
                variant: "destructive",
            });
        }
    };

    const handleDeleteAchievement = async (achievementId: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteAchievementMutation.mutateAsync(achievementId);
            toast({
                title: "Achievement deleted",
                description: "The achievement has been removed.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete achievement",
                variant: "destructive",
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/org/${slug}/rosters`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Rosters
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
                        <p className="text-muted-foreground">
                            Track team and player accomplishments
                        </p>
                    </div>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Achievement
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Filter achievements by team or player</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="w-48">
                            <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Achievements</SelectItem>
                                    <SelectItem value="team">Team Achievements</SelectItem>
                                    <SelectItem value="player">Player Achievements</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {filterType === "team" && (
                            <div className="w-64">
                                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select team..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teams.map((team) => (
                                            <SelectItem key={team.id} value={team.id}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {filterType === "player" && (
                            <div className="w-64">
                                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select player..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {players.map((player) => (
                                            <SelectItem key={player.id} value={player.id}>
                                                {player.gamerTag}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Achievements List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Achievements
                    </CardTitle>
                    <CardDescription>
                        {achievements.length} {achievements.length === 1 ? 'achievement' : 'achievements'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-24" />
                            ))}
                        </div>
                    ) : achievements.length === 0 ? (
                        <div className="text-center py-12">
                            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Start tracking your team and player accomplishments
                            </p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Achievement
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {achievements.map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {achievement.teamId ? (
                                                <Trophy className="h-5 w-5 text-yellow-500" />
                                            ) : (
                                                <Award className="h-5 w-5 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{achievement.title}</h3>
                                                {achievement.teamId && achievement.team && (
                                                    <Link href={`/org/${slug}/rosters/teams/${achievement.teamId}`}>
                                                        <Badge variant="outline" className="hover:bg-accent">
                                                            {achievement.team.name}
                                                        </Badge>
                                                    </Link>
                                                )}
                                                {achievement.playerId && achievement.player && (
                                                    <Link href={`/org/${slug}/rosters/players/${achievement.playerId}`}>
                                                        <Badge variant="outline" className="hover:bg-accent">
                                                            {achievement.player.gamerTag}
                                                        </Badge>
                                                    </Link>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(achievement.date)}
                                                {achievement.eventRef && ` • ${achievement.eventRef}`}
                                            </p>
                                            {achievement.details && (
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    {achievement.details}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteAchievement(achievement.id, achievement.title)}
                                        disabled={deleteAchievementMutation.isPending}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Achievement Dialog */}
            <CreateAchievementDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSubmit={handleCreateAchievement}
                teams={teams}
                players={players}
                isLoading={createAchievementMutation.isPending}
            />
        </div>
    );
}
