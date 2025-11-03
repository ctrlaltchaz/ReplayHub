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
import { Badge } from "@/components/ui/badge";
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
import type { CreateMapGameDto, MatchResult } from "@/types/gamelog";
import { ArrowLeft, Clock, Loader2, Map, Plus, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useBulkCreateMapGames } from "../../hooks/useBulkCreateMapGames";
import { useDeleteMapGame } from "../../hooks/useDeleteMapGame";
import { useMatch } from "../../hooks/useMatch";

export default function ManageMapsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const matchId = params?.matchId as string;
    const { hasPermission } = useAuth();
    const { toast } = useToast();

    const { data: match, isLoading } = useMatch(slug, matchId);
    const bulkCreateMaps = useBulkCreateMapGames(slug, matchId);
    const deleteMapGame = useDeleteMapGame(slug);

    const [newMaps, setNewMaps] = useState<CreateMapGameDto[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [mapToDelete, setMapToDelete] = useState<string | null>(null);

    const canManage = hasPermission("gamelog.manage");

    const addNewMap = () => {
        const nextMapNumber = (match?.maps?.length || 0) + newMaps.length + 1;
        setNewMaps([
            ...newMaps,
            {
                mapNumber: nextMapNumber,
                mapName: "",
                side: "",
                teamScore: 0,
                opponentScore: 0,
                result: "win",
                duration: 0,
                notes: "",
            },
        ]);
    };

    const updateNewMap = (index: number, field: keyof CreateMapGameDto, value: any) => {
        const updated = [...newMaps];
        updated[index] = { ...updated[index], [field]: value };
        setNewMaps(updated);
    };

    const removeNewMap = (index: number) => {
        setNewMaps(newMaps.filter((_, i) => i !== index));
    };

    const handleSaveMaps = async () => {
        if (newMaps.length === 0) {
            toast({
                title: "No maps to save",
                description: "Please add at least one map game",
                variant: "destructive",
            });
            return;
        }

        // Validate
        for (const map of newMaps) {
            if (!map.mapName) {
                toast({
                    title: "Validation Error",
                    description: "All maps must have a name",
                    variant: "destructive",
                });
                return;
            }
        }

        try {
            await bulkCreateMaps.mutateAsync({ maps: newMaps });
            toast({
                title: "Success",
                description: "Map games saved successfully",
            });
            setNewMaps([]);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to save map games",
                variant: "destructive",
            });
        }
    };

    const handleDeleteMap = async () => {
        if (!mapToDelete) return;

        try {
            await deleteMapGame.mutateAsync(mapToDelete);
            toast({
                title: "Success",
                description: "Map game deleted",
            });
            setDeleteDialogOpen(false);
            setMapToDelete(null);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to delete map game",
                variant: "destructive",
            });
        }
    };

    const getResultBadge = (result: string) => {
        const colors = {
            win: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            loss: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
            draw: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        };
        return colors[result as keyof typeof colors] || colors.draw;
    };

    if (!canManage) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            You don't have permission to manage map games.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (isLoading) {
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
                        <Map className="h-6 w-6" />
                        Manage Map Games
                    </h1>
                    <p className="text-muted-foreground">
                        vs {match.opponent} {match.score && `• Score: ${match.score}`}
                    </p>
                </div>

                {/* Existing Maps */}
                {match.maps && match.maps.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Existing Maps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Map #</TableHead>
                                        <TableHead>Map Name</TableHead>
                                        <TableHead>Side</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Result</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {match.maps.map((mapGame) => (
                                        <TableRow key={mapGame.id}>
                                            <TableCell>{mapGame.mapNumber}</TableCell>
                                            <TableCell className="font-medium">
                                                {mapGame.mapName}
                                            </TableCell>
                                            <TableCell>{mapGame.side || "N/A"}</TableCell>
                                            <TableCell>
                                                {mapGame.teamScore} - {mapGame.opponentScore}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={getResultBadge(mapGame.result)}
                                                >
                                                    {mapGame.result}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {mapGame.duration ? (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {Math.floor(mapGame.duration / 60)}:
                                                        {String(mapGame.duration % 60).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </span>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setMapToDelete(mapGame.id);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Add New Maps */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Add New Maps</CardTitle>
                                <CardDescription>
                                    Log map-by-map results for this match
                                </CardDescription>
                            </div>
                            <Button onClick={addNewMap} size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Map
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {newMaps.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Map className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No new maps added yet</p>
                                <Button onClick={addNewMap} size="sm" className="mt-3">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Map
                                </Button>
                            </div>
                        ) : (
                            <>
                                {newMaps.map((map, index) => (
                                    <Card key={index} className="border-2">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm">
                                                    Map #{map.mapNumber}
                                                </CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeNewMap(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>
                                                        Map Name{" "}
                                                        <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        value={map.mapName}
                                                        onChange={(e) =>
                                                            updateNewMap(
                                                                index,
                                                                "mapName",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="e.g., Dust II, Bind"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Side</Label>
                                                    <Input
                                                        value={map.side}
                                                        onChange={(e) =>
                                                            updateNewMap(
                                                                index,
                                                                "side",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="e.g., Attack, CT"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-3">
                                                <div className="space-y-2">
                                                    <Label>Team Score</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={map.teamScore}
                                                        onChange={(e) =>
                                                            updateNewMap(
                                                                index,
                                                                "teamScore",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Opponent Score</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={map.opponentScore}
                                                        onChange={(e) =>
                                                            updateNewMap(
                                                                index,
                                                                "opponentScore",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Result</Label>
                                                    <Select
                                                        value={map.result}
                                                        onValueChange={(value) =>
                                                            updateNewMap(
                                                                index,
                                                                "result",
                                                                value as MatchResult
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="win">Win</SelectItem>
                                                            <SelectItem value="loss">
                                                                Loss
                                                            </SelectItem>
                                                            <SelectItem value="draw">
                                                                Draw
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Duration (seconds)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={map.duration}
                                                    onChange={(e) =>
                                                        updateNewMap(
                                                            index,
                                                            "duration",
                                                            parseInt(e.target.value) || 0
                                                        )
                                                    }
                                                    placeholder="e.g., 2400 for 40 minutes"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={handleSaveMaps}
                                        disabled={bulkCreateMaps.isPending}
                                    >
                                        {bulkCreateMaps.isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Maps
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
                        <AlertDialogTitle>Delete Map Game</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this map game? This action cannot be
                            undone. All player statistics for this map will also be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteMap}
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
