"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Award, Edit, Loader2, Plus, Save, Target, Trash2, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { usePlayersList } from "../../../rosters/hooks/usePlayersList";
import { useBulkCreatePlayerStats } from "../../hooks/useBulkCreatePlayerStats";
import { useDeletePlayerStat } from "../../hooks/useDeletePlayerStat";
import { useMatch } from "../../hooks/useMatch";
import { useUpdatePlayerStat } from "../../hooks/useUpdatePlayerStat";

interface NewStatForm {
    tempId: string;
    playerId: string;
    mapGameId?: string;
    rating?: number;
    isMvp?: boolean;
    statsJson: {
        role?: string;
        kills?: number;
        deaths?: number;
        assists?: number;
        damage?: number;
        healing?: number;
        [key: string]: any;
    };
}

export default function ManageStatsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const matchId = params?.matchId as string;
    const { hasPermission } = useAuth();
    const { toast } = useToast();

    const { data: match, isLoading: matchLoading } = useMatch(slug, matchId);
    const { data: playersData, isLoading: playersLoading } = usePlayersList(slug);
    const players = playersData || [];

    const bulkCreateStats = useBulkCreatePlayerStats(slug, matchId);
    const deletePlayerStat = useDeletePlayerStat(slug);
    const updatePlayerStat = useUpdatePlayerStat(slug, matchId);

    const [newStats, setNewStats] = useState<NewStatForm[]>([]);
    const [editingStat, setEditingStat] = useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [statToDelete, setStatToDelete] = useState<string | null>(null);

    const canManage = hasPermission("gamelog.manage");

    const addNewStat = () => {
        setNewStats([
            ...newStats,
            {
                tempId: Date.now().toString(),
                playerId: "",
                mapGameId: undefined,
                rating: undefined,
                isMvp: false,
                statsJson: {
                    role: "",
                    kills: 0,
                    deaths: 0,
                    assists: 0,
                    damage: 0,
                    healing: 0,
                },
            },
        ]);
    };

    const updateNewStat = (tempId: string, field: keyof NewStatForm | string, value: any) => {
        setNewStats((prev) =>
            prev.map((stat) => {
                if (stat.tempId === tempId) {
                    if (field.startsWith("statsJson.")) {
                        const statKey = field.split(".")[1];
                        return {
                            ...stat,
                            statsJson: {
                                ...stat.statsJson,
                                [statKey]: value,
                            },
                        };
                    }
                    return { ...stat, [field]: value };
                }
                return stat;
            })
        );
    };

    const removeNewStat = (tempId: string) => {
        setNewStats(newStats.filter((stat) => stat.tempId !== tempId));
    };

    const handleSaveStats = async () => {
        if (newStats.length === 0) {
            toast({
                title: "No stats to save",
                description: "Please add at least one player statistic",
                variant: "destructive",
            });
            return;
        }

        // Validate
        for (const stat of newStats) {
            if (!stat.playerId) {
                toast({
                    title: "Validation Error",
                    description: "All stats must have a player selected",
                    variant: "destructive",
                });
                return;
            }
        }

        try {
            // Transform data to match backend expectations
            const statsToSend = newStats.map(({ tempId, ...stat }) => ({
                playerId: stat.playerId,
                mapGameId: stat.mapGameId,
                role: stat.statsJson.role,
                rating: stat.rating,
                isMvp: stat.isMvp,
                statsJson: {
                    kills: stat.statsJson.kills,
                    deaths: stat.statsJson.deaths,
                    assists: stat.statsJson.assists,
                    damage: stat.statsJson.damage,
                    healing: stat.statsJson.healing,
                },
            }));
            const result = await bulkCreateStats.mutateAsync({ stats: statsToSend });
            console.log('Stats saved successfully:', result);
            toast({
                title: "Success",
                description: "Player statistics saved successfully",
            });
            setNewStats([]);

            // Force a small delay to ensure backend processing completes
            setTimeout(() => {
                router.push(`/org/${slug}/gamelog/${matchId}`);
            }, 500);
        } catch (error: any) {
            console.error('Error saving stats:', error);
            toast({
                title: "Error",
                description: error?.message || "Failed to save player statistics",
                variant: "destructive",
            });
        }
    };

    const handleDeleteStat = async () => {
        if (!statToDelete) return;

        try {
            await deletePlayerStat.mutateAsync(statToDelete);
            toast({
                title: "Success",
                description: "Player statistic deleted",
            });
            setDeleteDialogOpen(false);
            setStatToDelete(null);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to delete player statistic",
                variant: "destructive",
            });
        }
    };

    const handleEditStat = (stat: any) => {
        console.log('Loading stat for editing:', stat);
        setEditingStat({
            id: stat.id,
            playerId: stat.playerId,
            mapGameId: stat.mapGameId,
            rating: stat.rating ?? stat.statsJson?.rating ?? undefined,
            isMvp: stat.isMvp ?? stat.statsJson?.isMvp ?? false,
            role: stat.role || stat.statsJson?.role || "",
            statsJson: {
                kills: stat.statsJson?.kills ?? 0,
                deaths: stat.statsJson?.deaths ?? 0,
                assists: stat.statsJson?.assists ?? 0,
                damage: stat.statsJson?.damage ?? 0,
                healing: stat.statsJson?.healing ?? 0,
            },
        });
    };

    const updateEditingStat = (field: string, value: any) => {
        if (!editingStat) return;

        if (field.startsWith("statsJson.")) {
            const statKey = field.split(".")[1];
            setEditingStat({
                ...editingStat,
                statsJson: {
                    ...editingStat.statsJson,
                    [statKey]: value,
                },
            });
        } else if (field === "role") {
            setEditingStat({
                ...editingStat,
                role: value,
            });
        } else {
            setEditingStat({
                ...editingStat,
                [field]: value,
            });
        }
    };

    const handleUpdateStat = async () => {
        if (!editingStat) return;

        console.log('Updating stat with data:', {
            statId: editingStat.id,
            mapGameId: editingStat.mapGameId,
            role: editingStat.role,
            rating: editingStat.rating,
            isMvp: editingStat.isMvp,
            statsJson: editingStat.statsJson,
        });

        try {
            const result = await updatePlayerStat.mutateAsync({
                statId: editingStat.id,
                data: {
                    mapGameId: editingStat.mapGameId,
                    role: editingStat.role,
                    rating: editingStat.rating,
                    isMvp: editingStat.isMvp,
                    statsJson: {
                        kills: editingStat.statsJson.kills ?? 0,
                        deaths: editingStat.statsJson.deaths ?? 0,
                        assists: editingStat.statsJson.assists ?? 0,
                        damage: editingStat.statsJson.damage ?? 0,
                        healing: editingStat.statsJson.healing ?? 0,
                        rating: editingStat.rating,
                        isMvp: editingStat.isMvp,
                    },
                },
            });
            console.log('Update successful:', result);
            toast({
                title: "Success",
                description: "Player statistics updated successfully",
            });
            setEditingStat(null);
        } catch (error: any) {
            console.error('Update error:', error);
            toast({
                title: "Error",
                description: error?.message || "Failed to update player statistics",
                variant: "destructive",
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingStat(null);
    };

    if (!canManage) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            You don't have permission to manage player statistics.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (matchLoading || playersLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Match not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/org/${slug}/gamelog/${matchId}`)}
                        className="mb-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Match
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Target className="h-6 w-6" />
                        Manage Player Statistics
                    </h1>
                    <p className="text-muted-foreground">
                        {match.team?.name} vs {match.opponent} {match.score && `• Score: ${match.score}`}
                    </p>
                </div>

                {/* Existing Stats */}
                {match.playerStats && match.playerStats.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Existing Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Player</TableHead>
                                        <TableHead className="text-center">K</TableHead>
                                        <TableHead className="text-center">D</TableHead>
                                        <TableHead className="text-center">A</TableHead>
                                        <TableHead className="text-center">K/D</TableHead>
                                        <TableHead className="text-center">Damage</TableHead>
                                        <TableHead className="text-center">Rating</TableHead>
                                        <TableHead className="text-center">MVP</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {match.playerStats.map((stat: any) => (
                                        <TableRow key={stat.id}>
                                            <TableCell className="font-medium">
                                                {stat.player?.gamerTag || stat.playerName || "Unknown Player"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stat.statsJson?.kills ?? stat.kills ?? "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stat.statsJson?.deaths ?? stat.deaths ?? "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stat.statsJson?.assists ?? stat.assists ?? "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(stat.statsJson?.kills || stat.kills) && (stat.statsJson?.deaths || stat.deaths)
                                                    ? ((stat.statsJson?.kills || stat.kills) / (stat.statsJson?.deaths || stat.deaths)).toFixed(2)
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stat.statsJson?.damage ?? stat.damage ?? "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stat.rating?.toFixed(2) ?? "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stat.isMvp && (
                                                    <Award className="h-4 w-4 text-yellow-500 mx-auto" />
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditStat(stat)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setStatToDelete(stat.id);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Edit Stat Form */}
                {editingStat && (
                    <Card className="border-2 border-primary">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Edit Player Statistics</CardTitle>
                                    <CardDescription>
                                        Update stats for {(match.playerStats as any)?.find((s: any) => s.id === editingStat.id)?.player?.gamerTag || "player"}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Map (Optional)</Label>
                                    <Select
                                        value={editingStat.mapGameId || "none"}
                                        onValueChange={(value) =>
                                            updateEditingStat("mapGameId", value === "none" ? undefined : value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select map (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No specific map</SelectItem>
                                            {match.maps?.map((map: any) => (
                                                <SelectItem key={map.id} value={map.id}>
                                                    {map.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input
                                        value={editingStat.role || ""}
                                        onChange={(e) =>
                                            updateEditingStat("role", e.target.value)
                                        }
                                        placeholder="e.g., Duelist, Entry Fragger"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-5">
                                <div className="space-y-2">
                                    <Label>Kills</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={editingStat.statsJson.kills || 0}
                                        onChange={(e) =>
                                            updateEditingStat("statsJson.kills", parseInt(e.target.value) || 0)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Deaths</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={editingStat.statsJson.deaths || 0}
                                        onChange={(e) =>
                                            updateEditingStat("statsJson.deaths", parseInt(e.target.value) || 0)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Assists</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={editingStat.statsJson.assists || 0}
                                        onChange={(e) =>
                                            updateEditingStat("statsJson.assists", parseInt(e.target.value) || 0)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Damage</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={editingStat.statsJson.damage || 0}
                                        onChange={(e) =>
                                            updateEditingStat("statsJson.damage", parseInt(e.target.value) || 0)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Healing</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={editingStat.statsJson.healing || 0}
                                        onChange={(e) =>
                                            updateEditingStat("statsJson.healing", parseInt(e.target.value) || 0)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Rating (0-10)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={editingStat.rating || ""}
                                        onChange={(e) =>
                                            updateEditingStat("rating", e.target.value ? parseFloat(e.target.value) : undefined)
                                        }
                                        placeholder="e.g., 7.5"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>MVP</Label>
                                    <Select
                                        value={editingStat.isMvp ? "yes" : "no"}
                                        onValueChange={(value) =>
                                            updateEditingStat("isMvp", value === "yes")
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no">No</SelectItem>
                                            <SelectItem value="yes">Yes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateStat}
                                    disabled={updatePlayerStat.isPending}
                                >
                                    {updatePlayerStat.isPending && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Add New Stats */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Add New Statistics</CardTitle>
                                <CardDescription>
                                    Record player performance stats for this match
                                </CardDescription>
                            </div>
                            <Button onClick={addNewStat} size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Player
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {newStats.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No new statistics added yet</p>
                                <Button onClick={addNewStat} size="sm" className="mt-3">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Player
                                </Button>
                            </div>
                        ) : (
                            <>
                                {newStats.map((stat) => (
                                    <Card key={stat.tempId} className="border-2">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm">
                                                    Player Statistics
                                                </CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeNewStat(stat.tempId)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>
                                                        Player{" "}
                                                        <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Select
                                                        value={stat.playerId || "none"}
                                                        onValueChange={(value) =>
                                                            updateNewStat(
                                                                stat.tempId,
                                                                "playerId",
                                                                value === "none" ? "" : value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select player" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">
                                                                Select a player
                                                            </SelectItem>
                                                            {players.map((player: any) => (
                                                                <SelectItem
                                                                    key={player.id}
                                                                    value={player.id}
                                                                >
                                                                    {player.gamerTag}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Map (Optional)</Label>
                                                    <Select
                                                        value={stat.mapGameId || "none"}
                                                        onValueChange={(value) =>
                                                            updateNewStat(
                                                                stat.tempId,
                                                                "mapGameId",
                                                                value === "none"
                                                                    ? undefined
                                                                    : value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Overall stats" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">
                                                                Overall stats
                                                            </SelectItem>
                                                            {match.maps?.map((map) => (
                                                                <SelectItem
                                                                    key={map.id}
                                                                    value={map.id}
                                                                >
                                                                    {map.title}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Role</Label>
                                                <Input
                                                    value={stat.statsJson.role || ""}
                                                    onChange={(e) =>
                                                        updateNewStat(
                                                            stat.tempId,
                                                            "statsJson.role",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g., Duelist, Entry Fragger"
                                                />
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-5">
                                                <div className="space-y-2">
                                                    <Label>Kills</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={stat.statsJson.kills || 0}
                                                        onChange={(e) =>
                                                            updateNewStat(
                                                                stat.tempId,
                                                                "statsJson.kills",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Deaths</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={stat.statsJson.deaths || 0}
                                                        onChange={(e) =>
                                                            updateNewStat(
                                                                stat.tempId,
                                                                "statsJson.deaths",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Assists</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={stat.statsJson.assists || 0}
                                                        onChange={(e) =>
                                                            updateNewStat(
                                                                stat.tempId,
                                                                "statsJson.assists",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Damage</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={stat.statsJson.damage || 0}
                                                        onChange={(e) =>
                                                            updateNewStat(
                                                                stat.tempId,
                                                                "statsJson.damage",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Healing</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={stat.statsJson.healing || 0}
                                                        onChange={(e) =>
                                                            updateNewStat(
                                                                stat.tempId,
                                                                "statsJson.healing",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>Rating (0-10)</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        value={stat.rating || ""}
                                                        onChange={(e) =>
                                                            updateNewStat(
                                                                stat.tempId,
                                                                "rating",
                                                                parseFloat(e.target.value) || undefined
                                                            )
                                                        }
                                                        placeholder="e.g., 7.5"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>MVP</Label>
                                                    <Select
                                                        value={stat.isMvp ? "true" : "false"}
                                                        onValueChange={(value) =>
                                                            updateNewStat(
                                                                stat.tempId,
                                                                "isMvp",
                                                                value === "true"
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="false">No</SelectItem>
                                                            <SelectItem value="true">Yes</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={handleSaveStats}
                                        disabled={bulkCreateStats.isPending}
                                    >
                                        {bulkCreateStats.isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Statistics
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            router.push(`/org/${slug}/gamelog/${matchId}`)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Player Statistic</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this player statistic? This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteStat}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
