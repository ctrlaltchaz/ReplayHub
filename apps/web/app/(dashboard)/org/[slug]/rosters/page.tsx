"use client";

import { PermissionGuard } from "@/components/permissions/PermissionGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { apiDelete } from "@/lib/api/client";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { PERMISSIONS } from "@/lib/permissions/utils";
import type { CreatePlayerDto, CreateTeamDto, Player, Team, UpdatePlayerDto, UpdateTeamDto } from "@/types/roster";
import { useQueryClient } from "@tanstack/react-query";
import { Award, Calendar, Edit, ListOrdered, Plus, Search, Trash2, Trophy, UserPlus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAchievementsList } from "./achievements/hooks/useAchievementsList";
import { PlayerCreateDialog } from "./components/PlayerCreateDialog";
import { PlayerEditDialog } from "./components/PlayerEditDialog";
import { TeamCreateDialog } from "./components/TeamCreateDialog";
import { TeamEditDialog } from "./components/TeamEditDialog";
import { useCreatePlayer } from "./hooks/useCreatePlayer";
import { useCreateTeam } from "./hooks/useCreateTeam";
import { usePlayersList } from "./hooks/usePlayersList";
import { useTeamsList } from "./hooks/useTeamsList";
import { useUpdatePlayer } from "./hooks/useUpdatePlayer";
import { useUpdateTeam } from "./hooks/useUpdateTeam";
import { useLineupsList } from "./lineups/hooks/useLineupsList";

const GAMES = [
    { value: "Valorant", label: "Valorant", logo: "/logos/valorant.svg" },
    { value: "League of Legends", label: "League of Legends", logo: "/logos/lol.svg" },
    { value: "Counter-Strike 2", label: "Counter-Strike 2", logo: "/logos/cs2.svg" },
    { value: "Dota 2", label: "Dota 2", logo: "/logos/dota2.svg" },
    { value: "Overwatch", label: "Overwatch", logo: "/logos/overwatch.svg" },
    { value: "Rocket League", label: "Rocket League", logo: "/logos/rocketleague.svg" },
    { value: "Apex Legends", label: "Apex Legends", logo: "/logos/apex.svg" },
];

export default function RostersPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params?.slug as string;
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { orgUser } = useAuth();

    const [showTeamDialog, setShowTeamDialog] = useState(false);
    const [showTeamEditDialog, setShowTeamEditDialog] = useState(false);
    const [showPlayerDialog, setShowPlayerDialog] = useState(false);
    const [showPlayerEditDialog, setShowPlayerEditDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"teams" | "players" | "achievements" | "availability" | "lineups">("teams");
    const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();
    const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Set active tab from URL parameter
    useEffect(() => {
        const tab = searchParams?.get('tab');
        if (tab && ['teams', 'players', 'lineups', 'achievements', 'availability'].includes(tab)) {
            setActiveTab(tab as "teams" | "players" | "achievements" | "availability" | "lineups");
        }
    }, [searchParams]);

    // Dynamic page title based on active tab
    const tabTitles = {
        teams: 'Teams',
        players: 'Players',
        lineups: 'Lineups',
        achievements: 'Achievements',
        availability: 'Availability'
    };
    usePageTitle(tabTitles[activeTab]);

    // Fetch data
    const { data: teams = [], isLoading: teamsLoading } = useTeamsList(slug, {
        q: searchQuery,
    });

    const { data: players = [], isLoading: playersLoading } = usePlayersList(slug, {
        q: searchQuery,
    });

    const { data: achievements = [], isLoading: achievementsLoading } = useAchievementsList(slug);

    const { data: lineups = [], isLoading: lineupsLoading } = useLineupsList(slug);

    // Mutations
    const createTeamMutation = useCreateTeam(slug);
    const createPlayerMutation = useCreatePlayer(slug);
    const updateTeamMutation = useUpdateTeam(slug, selectedTeam?.id || "");
    const updatePlayerMutation = useUpdatePlayer(slug, selectedPlayer?.id || "");

    const handleCreateTeam = async (data: CreateTeamDto) => {
        try {
            await createTeamMutation.mutateAsync(data);
            toast({
                title: "Team created",
                description: `${data.name} has been added to your roster.`,
            });
            setShowTeamDialog(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create team",
                variant: "destructive",
            });
        }
    };

    const handleUpdateTeam = async (data: UpdateTeamDto) => {
        if (!selectedTeam) return;
        try {
            await updateTeamMutation.mutateAsync(data);
            toast({
                title: "Team updated",
                description: "Team information has been updated.",
            });
            setShowTeamEditDialog(false);
            setSelectedTeam(undefined);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update team",
                variant: "destructive",
            });
        }
    };

    const handleDeleteTeam = async (teamId: string, teamName: string) => {
        if (!confirm(`Are you sure you want to delete ${teamName}? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(teamId);
        try {
            await apiDelete(`/org/${slug}/teams/${teamId}`, { slug });
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/teams`] });
            toast({
                title: "Team deleted",
                description: `${teamName} has been removed from your roster.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete team",
                variant: "destructive",
            });
        } finally {
            setDeletingId(null);
        }
    };

    const handleCreatePlayer = async (data: CreatePlayerDto) => {
        try {
            await createPlayerMutation.mutateAsync(data);
            toast({
                title: "Player created",
                description: `${data.gamerTag} has been added to your roster.`,
            });
            setShowPlayerDialog(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create player",
                variant: "destructive",
            });
        }
    };

    const handleUpdatePlayer = async (data: UpdatePlayerDto) => {
        if (!selectedPlayer) return;
        try {
            await updatePlayerMutation.mutateAsync(data);
            toast({
                title: "Player updated",
                description: "Player information has been updated.",
            });
            setShowPlayerEditDialog(false);
            setSelectedPlayer(undefined);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update player",
                variant: "destructive",
            });
        }
    };

    const handleDeletePlayer = async (playerId: string, gamerTag: string) => {
        if (!confirm(`Are you sure you want to delete ${gamerTag}? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(playerId);
        try {
            await apiDelete(`/org/${slug}/players/${playerId}`, { slug });
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/players`] });
            toast({
                title: "Player deleted",
                description: `${gamerTag} has been removed from your roster.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete player",
                variant: "destructive",
            });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Users className="h-6 w-6" />
                            Roster Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your teams, players, and lineups
                        </p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "teams" | "players" | "achievements" | "availability" | "lineups")}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                        <TabsList className="w-full sm:w-auto overflow-x-auto">
                            <TabsTrigger value="teams" className="gap-2">
                                <Users className="h-4 w-4" />
                                Teams
                            </TabsTrigger>
                            <TabsTrigger value="players" className="gap-2">
                                <UserPlus className="h-4 w-4" />
                                Players
                            </TabsTrigger>
                            <TabsTrigger value="lineups" className="gap-2">
                                <ListOrdered className="h-4 w-4" />
                                Lineups
                            </TabsTrigger>
                            <TabsTrigger value="achievements" className="gap-2">
                                <Trophy className="h-4 w-4" />
                                Achievements
                            </TabsTrigger>
                            <TabsTrigger value="availability" className="gap-2">
                                <Calendar className="h-4 w-4" />
                                Availability
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative flex-1 sm:flex-initial">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 w-full sm:w-64"
                                />
                            </div>
                            {activeTab === "teams" && (
                                <PermissionGuard required={PERMISSIONS.TEAM_CREATE}>
                                    <Button onClick={() => setShowTeamDialog(true)} className="w-full sm:w-auto">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Team
                                    </Button>
                                </PermissionGuard>
                            )}
                            {activeTab === "players" && (
                                <PermissionGuard required={PERMISSIONS.PLAYER_CREATE}>
                                    <Button onClick={() => setShowPlayerDialog(true)} className="w-full sm:w-auto">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Player
                                    </Button>
                                </PermissionGuard>
                            )}
                            {activeTab === "lineups" && (
                                <PermissionGuard required={PERMISSIONS.ROSTERS_VIEW}>
                                    <Button asChild className="w-full sm:w-auto">
                                        <Link href={`/org/${slug}/rosters/lineups`}>
                                            <ListOrdered className="h-4 w-4 mr-2" />
                                            View All Lineups
                                        </Link>
                                    </Button>
                                </PermissionGuard>
                            )}
                            {activeTab === "achievements" && (
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href={`/org/${slug}/rosters/achievements`}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        View All Achievements
                                    </Link>
                                </Button>
                            )}
                            {activeTab === "availability" && (
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href={`/org/${slug}/rosters/availability`}>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        View Calendar
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <TabsContent value="teams" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Teams</CardTitle>
                        <CardDescription>
                            View and manage your organization's teams
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {teamsLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                                ))}
                            </div>
                        ) : teams.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first team to get started
                                </p>
                                <PermissionGuard required={PERMISSIONS.TEAM_CREATE}>
                                    <Button onClick={() => setShowTeamDialog(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Team
                                    </Button>
                                </PermissionGuard>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {teams.map((team) => (
                                    <Link
                                        key={team.id}
                                        href={`/org/${slug}/rosters/teams/${team.id}`}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors block"
                                    >
                                        <div className="flex items-center gap-3">
                                            {GAMES.find(g => g.value === team.game)?.logo && (
                                                <Image
                                                    src={GAMES.find(g => g.value === team.game)!.logo}
                                                    alt={team.game}
                                                    width={32}
                                                    height={32}
                                                    className="rounded"
                                                />
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold font-montserrat text-sm">{team.name}</h3>
                                                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {team._count?.members || 0}
                                                    </span>
                                                    {team.captain && (
                                                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary flex items-center gap-1">
                                                            <Award className="h-3 w-3" />
                                                            {team.captain.gamerTag}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {team.game}
                                                    {team.season && ` • ${team.season}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded ${team.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                                {team.status}
                                            </span>
                                            <PermissionGuard required={PERMISSIONS.TEAM_UPDATE}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedTeam(team);
                                                        setShowTeamEditDialog(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </PermissionGuard>
                                            <PermissionGuard required={PERMISSIONS.TEAM_DELETE}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDeleteTeam(team.id, team.name);
                                                    }}
                                                    disabled={deletingId === team.id}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </PermissionGuard>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="players" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Players</CardTitle>
                        <CardDescription>
                            View and manage your organization's players
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {playersLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                                ))}
                            </div>
                        ) : players.length === 0 ? (
                            <div className="text-center py-12">
                                <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No players yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Add your first player to get started
                                </p>
                                <PermissionGuard required={PERMISSIONS.PLAYER_CREATE}>
                                    <Button onClick={() => setShowPlayerDialog(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Player
                                    </Button>
                                </PermissionGuard>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {players.map((player) => (
                                    <Link
                                        key={player.id}
                                        href={`/org/${slug}/rosters/players/${player.id}`}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors block"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                                {player.avatar ? (
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:3001'}${player.avatar}`}
                                                        alt={player.gamerTag}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-semibold">
                                                        {player.gamerTag.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold font-montserrat text-sm">{player.gamerTag}</h3>
                                                {player.realName && (
                                                    <p className="text-sm text-muted-foreground">{player.realName}</p>
                                                )}
                                                <p className="text-sm text-muted-foreground">
                                                    {player.role || "No role"}
                                                    {player.rank && ` • ${player.rank}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded ${player.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                                {player.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <PermissionGuard required={PERMISSIONS.PLAYER_UPDATE} fallback={
                                                player.orgUserId === orgUser?.id ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setSelectedPlayer(player);
                                                            setShowPlayerEditDialog(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                ) : null
                                            }>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedPlayer(player);
                                                        setShowPlayerEditDialog(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </PermissionGuard>
                                            <PermissionGuard required={PERMISSIONS.PLAYER_DELETE}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDeletePlayer(player.id, player.gamerTag);
                                                    }}
                                                    disabled={deletingId === player.id}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </PermissionGuard>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Achievements</CardTitle>
                                <CardDescription>
                                    Latest team and player accomplishments
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={`/org/${slug}/rosters/achievements`}>
                                    View All
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {achievementsLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                                ))}
                            </div>
                        ) : achievements.length === 0 ? (
                            <div className="text-center py-12">
                                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Start tracking team and player accomplishments
                                </p>
                                <PermissionGuard required={PERMISSIONS.ACHIEVEMENT_CREATE}>
                                    <Button asChild>
                                        <Link href={`/org/${slug}/rosters/achievements`}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add First Achievement
                                        </Link>
                                    </Button>
                                </PermissionGuard>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {achievements.slice(0, 5).map((achievement: any) => (
                                    <div
                                        key={achievement.id}
                                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="mt-1">
                                            {achievement.teamId ? (
                                                <Trophy className="h-5 w-5 text-yellow-500" />
                                            ) : (
                                                <Award className="h-5 w-5 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{achievement.title}</h3>
                                                {achievement.teamId && achievement.team && (
                                                    <Link href={`/org/${slug}/rosters/teams/${achievement.teamId}`}>
                                                        <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50">
                                                            {achievement.team.name}
                                                        </span>
                                                    </Link>
                                                )}
                                                {achievement.playerId && achievement.player && (
                                                    <Link href={`/org/${slug}/rosters/players/${achievement.playerId}`}>
                                                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50">
                                                            {achievement.player.gamerTag}
                                                        </span>
                                                    </Link>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(achievement.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                                {achievement.eventRef && ` • ${achievement.eventRef}`}
                                            </p>
                                            {achievement.details && (
                                                <p className="text-sm text-muted-foreground">
                                                    {achievement.details}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {achievements.length > 5 && (
                                    <div className="text-center pt-2">
                                        <Button variant="outline" asChild>
                                            <Link href={`/org/${slug}/rosters/achievements`}>
                                                View All {achievements.length} Achievements
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="lineups" className="space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Event Lineups</CardTitle>
                                <CardDescription>
                                    Manage player lineups for matches and events
                                </CardDescription>
                            </div>
                            <PermissionGuard required={PERMISSIONS.ROSTERS_VIEW}>
                                <Button asChild>
                                    <Link href={`/org/${slug}/rosters/lineups`}>
                                        <ListOrdered className="h-4 w-4 mr-2" />
                                        View All Lineups
                                    </Link>
                                </Button>
                            </PermissionGuard>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {lineupsLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                                ))}
                            </div>
                        ) : lineups.length === 0 ? (
                            <div className="text-center py-12">
                                <ListOrdered className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No lineups yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Build and manage team lineups for events and matches
                                </p>
                                <PermissionGuard required={PERMISSIONS.LINEUP_CREATE}>
                                    <Button asChild>
                                        <Link href={`/org/${slug}/rosters/lineups`}>
                                            Create First Lineup
                                        </Link>
                                    </Button>
                                </PermissionGuard>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lineups.slice(0, 5).map((lineup: any) => (
                                    <Link
                                        key={lineup.id}
                                        href={`/org/${slug}/rosters/lineups/${lineup.id}`}
                                        className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">
                                                        {lineup.title || `Lineup #${lineup.id.slice(0, 8)}`}
                                                    </h3>
                                                    {lineup.published ? (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                            <Award className="h-3 w-3" />
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                            <Edit className="h-3 w-3" />
                                                            Draft
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {lineup.team.name} • {lineup.team.game}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>{lineup._count.slots} players</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {lineups.length > 5 && (
                                    <div className="text-center pt-2">
                                        <Button variant="outline" asChild>
                                            <Link href={`/org/${slug}/rosters/lineups`}>
                                                View All {lineups.length} Lineups
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Player Availability</CardTitle>
                                <CardDescription>
                                    Track when players are available for events
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={`/org/${slug}/rosters/availability`}>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    View Calendar
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Availability Calendar</h3>
                            <p className="text-muted-foreground mb-4">
                                View and manage player availability for upcoming events
                            </p>
                            <Button asChild>
                                <Link href={`/org/${slug}/rosters/availability`}>
                                    Open Availability Calendar
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

                {/* Dialogs */ }
                <TeamCreateDialog
                    open={showTeamDialog}
                    onOpenChange={setShowTeamDialog}
                    onSubmit={handleCreateTeam}
                    isLoading={createTeamMutation.isPending}
                    players={players.map(p => ({ id: p.id, gamerTag: p.gamerTag, realName: p.realName }))}
                />

                <TeamEditDialog
                    open={showTeamEditDialog}
                    onOpenChange={setShowTeamEditDialog}
                    onSubmit={handleUpdateTeam}
                    isLoading={updateTeamMutation.isPending}
                    team={selectedTeam}
                    players={players.map(p => ({ id: p.id, gamerTag: p.gamerTag, realName: p.realName }))}
                />

                <PlayerCreateDialog
                    open={showPlayerDialog}
                    onOpenChange={setShowPlayerDialog}
                    onSubmit={handleCreatePlayer}
                    isLoading={createPlayerMutation.isPending}
                    teams={teams.map(t => ({ id: t.id, name: t.name }))}
                />

                <PlayerEditDialog
                    open={showPlayerEditDialog}
                    onOpenChange={setShowPlayerEditDialog}
                    onSubmit={handleUpdatePlayer}
                    isLoading={updatePlayerMutation.isPending}
                    player={selectedPlayer}
                    teams={teams.map(t => ({ id: t.id, name: t.name }))}
                />
            </div >
        </div >
    );
}
