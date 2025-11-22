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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { usePlayersList } from "../../../rosters/hooks/usePlayersList";
import { useBulkCreatePlayerStats } from "../../hooks/useBulkCreatePlayerStats";
import { useDeletePlayerStat } from "../../hooks/useDeletePlayerStat";
import { useMatch } from "../../hooks/useMatch";
import { useUpdatePlayerStat } from "../../hooks/useUpdatePlayerStat";

interface NewStatForm {
  tempId: string;
  playerId: string;
  mapGameId?: string;
  groupId: string;
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
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const matchId = params?.matchId as string;
  const { hasPermission } = useAuth();
  const { toast } = useToast();

  const { data: match, isLoading: matchLoading } = useMatch(slug, matchId);
  const selectedMapId = searchParams?.get("map") || null;
  const selectedMap = useMemo(
    () => match?.maps?.find((m: any) => m.id === selectedMapId),
    [match, selectedMapId]
  );
  const { data: playersData, isLoading: playersLoading } = usePlayersList(slug);
  const players = playersData || [];

  const bulkCreateStats = useBulkCreatePlayerStats(slug, matchId);
  const deletePlayerStat = useDeletePlayerStat(slug);
  const updatePlayerStat = useUpdatePlayerStat(slug, matchId);

  const [newStats, setNewStats] = useState<NewStatForm[]>([]);
  const [editingStat, setEditingStat] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statToDelete, setStatToDelete] = useState<string | null>(null);
  const [roundModalPlayer, setRoundModalPlayer] = useState<{
    playerId: string;
    name: string;
  } | null>(null);

  const canManage = hasPermission("gamelog.manage");

  const groupedNewStats = useMemo(() => {
    const groups: Record<string, { groupId: string; playerId: string; entries: NewStatForm[] }> =
      {};
    newStats.forEach((stat) => {
      const key = stat.groupId || stat.playerId || stat.tempId;
      if (!groups[key]) {
        groups[key] = { groupId: key, playerId: stat.playerId, entries: [] };
      }
      groups[key].entries.push(stat);
    });
    return Object.values(groups);
  }, [newStats]);

  const playerRounds = useMemo(() => {
    const rounds = match?.playerStatsByRound || [];
    const grouped: Record<string, { playerId: string; name: string; entries: any[] }> = {};

    rounds.forEach((stat: any) => {
      const key = stat.playerId;
      if (!grouped[key]) {
        grouped[key] = {
          playerId: stat.playerId,
          name: stat.player?.gamerTag || stat.playerName || "Unknown Player",
          entries: [],
        };
      }
      grouped[key].entries.push(stat);
    });

    return Object.values(grouped).map((group) => {
      const kills = group.entries.reduce((sum, s) => sum + (s.statsJson?.kills || 0), 0);
      const deaths = group.entries.reduce((sum, s) => sum + (s.statsJson?.deaths || 0), 0);
      const assists = group.entries.reduce((sum, s) => sum + (s.statsJson?.assists || 0), 0);
      const avgRating = group.entries.length
        ? group.entries.reduce((sum, s) => sum + (s.rating || 0), 0) / group.entries.length
        : undefined;

      return {
        ...group,
        totalKills: kills,
        totalDeaths: deaths,
        totalAssists: assists,
        avgRating,
      };
    });
  }, [match?.playerStatsByRound]);

  const selectedPlayerRounds = useMemo(() => {
    if (!roundModalPlayer) return [];
    return (match?.playerStatsByRound || []).filter(
      (stat: any) => stat.playerId === roundModalPlayer.playerId
    );
  }, [match?.playerStatsByRound, roundModalPlayer]);

  const createGroupId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const addNewStat = () => {
    const groupId = createGroupId();
    setNewStats([
      ...newStats,
      {
        tempId: Date.now().toString(),
        playerId: "",
        mapGameId: selectedMapId || undefined,
        groupId,
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

  const addPlayerForAllRounds = (playerId: string) => {
    if (!match) return;
    const groupId = createGroupId();
    const maps = match.maps && match.maps.length > 0 ? match.maps : [{ id: undefined }];
    const entries = maps.map((map: any, idx: number) => ({
      tempId: `${groupId}-${idx}`,
      playerId,
      mapGameId: map.id,
      groupId,
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
    }));
    setNewStats([...newStats, ...entries]);
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

  const updateGroupPlayer = (groupId: string, playerId: string) => {
    setNewStats((prev) =>
      prev.map((stat) =>
        stat.groupId === groupId
          ? {
              ...stat,
              playerId,
            }
          : stat
      )
    );
  };

  const removeStatEntry = (tempId: string) => {
    setNewStats((prev) => prev.filter((stat) => stat.tempId !== tempId));
  };

  const removeStatGroup = (groupId: string) => {
    setNewStats((prev) => prev.filter((stat) => stat.groupId !== groupId));
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

    const statsToSubmit = newStats.filter((s) => s.playerId);

    try {
      // Transform data to match backend expectations
      const statsToSend = statsToSubmit.map(({ tempId, ...stat }) => ({
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
      console.log("📤 Submitting stats:", JSON.stringify(statsToSend, null, 2));
      const result = await bulkCreateStats.mutateAsync({ stats: statsToSend });
      console.log("✅ Stats saved successfully:", JSON.stringify(result, null, 2));
      toast({
        title: "Success",
        description: "Player statistics saved successfully",
      });
      setNewStats([]);
    } catch (error: any) {
      console.error("Error saving stats:", error);
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
    console.log("📝 Loading stat for editing:", JSON.stringify(stat, null, 2));
    console.log("  - stat.rating:", stat.rating);
    console.log("  - stat.isMvp:", stat.isMvp);
    console.log("  - stat.statsJson:", stat.statsJson);
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

    console.log("Updating stat with data:", {
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
      console.log("Update successful:", result);
      toast({
        title: "Success",
        description: "Player statistics updated successfully",
      });
      setEditingStat(null);
    } catch (error: any) {
      console.error("Update error:", error);
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
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/org/${slug}/gamelog/${matchId}`)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Match
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/org/${slug}/gamelog/${matchId}/maps`)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Round / Map
              </Button>
              {selectedMap && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    router.push(`/org/${slug}/gamelog/${matchId}/stats?map=${selectedMap.id}`)
                  }
                >
                  Editing: {selectedMap.title}
                </Button>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6" />
            Manage Player Statistics
          </h1>
          <p className="text-muted-foreground">
            {match.team?.name} vs {match.opponent} {match.score && `• Score: ${match.score}`}
          </p>
          <p className="text-sm text-muted-foreground">
            Step 1: add or edit rounds/maps. Step 2: add player stats per round. Totals update
            automatically.
          </p>
        </div>

        {/* Existing Stats */}
        {match.playerStats && match.playerStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Totals (All Rounds)</CardTitle>
              <CardDescription>
                Read-only summary of everything entered below. Edit by updating a specific round.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-center">Kills</TableHead>
                    <TableHead className="text-center">Deaths</TableHead>
                    <TableHead className="text-center">Assists</TableHead>
                    <TableHead className="text-center">K/D</TableHead>
                    <TableHead className="text-center">Damage</TableHead>
                    <TableHead className="text-center">Healing</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-center">MVP</TableHead>
                    <TableHead className="text-center">Rounds</TableHead>
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
                        {(stat.statsJson?.kills || stat.kills) &&
                        (stat.statsJson?.deaths || stat.deaths)
                          ? (
                              (stat.statsJson?.kills || stat.kills) /
                              (stat.statsJson?.deaths || stat.deaths)
                            ).toFixed(2)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.statsJson?.damage ?? stat.damage ?? "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.statsJson?.healing ?? stat.healing ?? "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.rating?.toFixed(2) ?? "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.isMvp && <Award className="h-4 w-4 text-yellow-500 mx-auto" />}
                      </TableCell>
                      <TableCell className="text-center">{stat.totalRounds || 1}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Round-level stats grouped by player */}
        {match.playerStatsByRound && match.playerStatsByRound.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Round Breakdown</CardTitle>
              <CardDescription>
                One row per player. Click to see their round-by-round stats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-center">Rounds</TableHead>
                    <TableHead className="text-center">Kills</TableHead>
                    <TableHead className="text-center">Deaths</TableHead>
                    <TableHead className="text-center">Assists</TableHead>
                    <TableHead className="text-center">Avg Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerRounds.map((player) => (
                    <TableRow key={player.playerId}>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell className="text-center">{player.entries.length}</TableCell>
                      <TableCell className="text-center">{player.totalKills}</TableCell>
                      <TableCell className="text-center">{player.totalDeaths}</TableCell>
                      <TableCell className="text-center">{player.totalAssists}</TableCell>
                      <TableCell className="text-center">
                        {player.avgRating ? player.avgRating.toFixed(2) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setRoundModalPlayer({ playerId: player.playerId, name: player.name })
                          }
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          View Rounds
                        </Button>
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
                    Update stats for{" "}
                    {(match.playerStatsByRound as any)?.find((s: any) => s.id === editingStat.id)
                      ?.player?.gamerTag || "player"}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Round / Map</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => router.push(`/org/${slug}/gamelog/${matchId}/maps`)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      New Round
                    </Button>
                  </div>
                  <Select
                    value={editingStat.mapGameId || "none"}
                    onValueChange={(value) =>
                      updateEditingStat("mapGameId", value === "none" ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Assign to default round</SelectItem>
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
                    onChange={(e) => updateEditingStat("role", e.target.value)}
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
                      updateEditingStat(
                        "rating",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    placeholder="e.g., 7.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>MVP</Label>
                  <Select
                    value={editingStat.isMvp ? "yes" : "no"}
                    onValueChange={(value) => updateEditingStat("isMvp", value === "yes")}
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
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStat} disabled={updatePlayerStat.isPending}>
                  {updatePlayerStat.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
                  Add players once, then fill their stats for each round.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select onValueChange={(value) => addPlayerForAllRounds(value)}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Add player to all rounds" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((player: any) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.gamerTag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addNewStat} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Single Entry
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {newStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No new statistics added yet</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Select onValueChange={(value) => addPlayerForAllRounds(value)} className="w-56">
                    <SelectTrigger>
                      <SelectValue placeholder="Add player to all rounds" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player: any) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.gamerTag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addNewStat} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Single Entry
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {groupedNewStats.map((group) => (
                  <Card key={group.groupId} className="border-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-sm">Player</CardTitle>
                          <Select
                            value={group.playerId || "none"}
                            onValueChange={(value) =>
                              updateGroupPlayer(group.groupId, value === "none" ? "" : value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select player" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Select a player</SelectItem>
                              {players.map((player: any) => (
                                <SelectItem key={player.id} value={player.id}>
                                  {player.gamerTag}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStatGroup(group.groupId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {group.entries.map((stat) => (
                        <Card key={stat.tempId} className="border">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">Round / Map</CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStatEntry(stat.tempId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Select
                              value={stat.mapGameId || "none"}
                              onValueChange={(value) =>
                                updateNewStat(
                                  stat.tempId,
                                  "mapGameId",
                                  value === "none" ? undefined : value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select round" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Default round</SelectItem>
                                {match.maps?.map((map) => (
                                  <SelectItem key={map.id} value={map.id}>
                                    {map.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <div className="space-y-2">
                              <Label>Role</Label>
                              <Input
                                value={stat.statsJson.role || ""}
                                onChange={(e) =>
                                  updateNewStat(stat.tempId, "statsJson.role", e.target.value)
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
                                    updateNewStat(stat.tempId, "isMvp", value === "true")
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
                    </CardContent>
                  </Card>
                ))}

                <div className="flex items-center gap-3">
                  <Button onClick={handleSaveStats} disabled={bulkCreateStats.isPending}>
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
                    onClick={() => setNewStats([])}
                    disabled={bulkCreateStats.isPending}
                  >
                    Clear Form
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Player Round Dialog */}
      <Dialog open={!!roundModalPlayer} onOpenChange={(open) => !open && setRoundModalPlayer(null)}>
        <DialogContent className="max-w-5xl sm:max-w-4xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Rounds for {roundModalPlayer?.name}</DialogTitle>
            <DialogDescription>
              Review per-round stats. Use "Edit" to jump into the stat form for that round.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-x-auto">
            {selectedPlayerRounds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No round stats available.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Round</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Kills</TableHead>
                    <TableHead className="text-center">Deaths</TableHead>
                    <TableHead className="text-center">Assists</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPlayerRounds.map((stat: any) => (
                    <TableRow key={stat.id}>
                      <TableCell className="whitespace-nowrap">
                        {stat.mapGame?.title || `Round ${stat.mapGame?.gameIdx || 1}`}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {stat.mapGame
                          ? `${stat.mapGame.ourScore ?? "-"} - ${stat.mapGame.theirScore ?? "-"}`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-center">{stat.statsJson?.kills ?? "-"}</TableCell>
                      <TableCell className="text-center">{stat.statsJson?.deaths ?? "-"}</TableCell>
                      <TableCell className="text-center">
                        {stat.statsJson?.assists ?? "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.rating?.toFixed(2) ?? "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRoundModalPlayer(null);
                              handleEditStat(stat);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRoundModalPlayer(null);
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
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Player Statistic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this player statistic? This action cannot be undone.
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
