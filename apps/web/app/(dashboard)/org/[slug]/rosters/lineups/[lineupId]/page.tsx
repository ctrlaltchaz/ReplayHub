"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { pdf } from "@react-pdf/renderer";
import { ArrowLeft, CheckCircle2, Clock, Download, Edit2, Plus, Save, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePlayersList } from "../../hooks/usePlayersList";
import { useDeleteLineup } from "../hooks/useDeleteLineup";
import { useLineup } from "../hooks/useLineup";
import { useSetLineupSlots } from "../hooks/useSetLineupSlots";
import { CallSheetPDF } from "./components/CallSheetPDF";
import { EditSlotDialog } from "./components/EditSlotDialog";

export default function LineupDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const lineupId = params?.lineupId as string;
    const router = useRouter();
    const { toast } = useToast();

    const { data: lineup, isLoading } = useLineup(slug, lineupId);
    const { data: allPlayers = [] } = usePlayersList(slug);
    const setSlotsMutation = useSetLineupSlots(slug, lineupId);
    const deleteLineupMutation = useDeleteLineup(slug);

    const [slots, setSlots] = useState<any[]>([]);
    const [editingSlot, setEditingSlot] = useState<any>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Update local state when lineup loads
    useEffect(() => {
        if (lineup?.slots) {
            setSlots(lineup.slots);
        }
    }, [lineup?.slots]);

    // Get team players only - filter by teamId in the teams array
    const teamPlayers = allPlayers.filter(
        (p: any) => p.teams?.some((tm: any) => tm.teamId === lineup?.team?.id)
    );

    // Show all players if no team players found (helpful for new teams)
    const availablePlayers = teamPlayers.length > 0 ? teamPlayers : allPlayers;

    const handleAddSlot = (isSub: boolean) => {
        setEditingSlot({
            id: undefined,
            playerId: null,
            role: "",
            isSub,
            notes: "",
        });
        setShowEditDialog(true);
    };

    const handleEditSlot = (slot: any) => {
        setEditingSlot(slot);
        setShowEditDialog(true);
    };

    const handleSaveSlot = (updatedSlot: any) => {
        // Find the player object to include full details
        const player = updatedSlot.playerId
            ? availablePlayers.find((p: any) => p.id === updatedSlot.playerId)
            : null;

        const slotWithPlayer = {
            ...updatedSlot,
            player: player || null,
        };

        if (updatedSlot.id) {
            // Update existing slot
            setSlots(slots.map(s => s.id === updatedSlot.id ? slotWithPlayer : s));
        } else {
            // Add new slot
            setSlots([...slots, { ...slotWithPlayer, id: `temp-${Date.now()}` }]);
        }
    };

    const handleRemoveSlot = (slotId: string) => {
        if (!confirm("Remove this player from the lineup?")) return;
        setSlots(slots.filter(s => s.id !== slotId));
    };

    const handleSave = async () => {
        try {
            await setSlotsMutation.mutateAsync({
                slots: slots.map((slot, idx) => ({
                    playerId: slot.playerId === "unassigned" ? null : slot.playerId,
                    role: slot.role,
                    isSub: slot.isSub,
                    notes: slot.notes,
                    idx,
                })),
                autoAttachMissing: false,
            });
            toast({
                title: "Lineup saved",
                description: "Player positions have been updated.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save lineup",
                variant: "destructive",
            });
        }
    };

    const handleExportCallSheet = async () => {
        if (!lineup) return;

        try {
            const blob = await pdf(
                <CallSheetPDF
                    lineup={lineup as any}
                    organizationName={slug || "Organization"}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = lineup.title
                ? `${lineup.title.replace(/\s+/g, '_')}_CallSheet_${new Date().toISOString().split('T')[0]}.pdf`
                : `Lineup_${lineupId.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);

            toast({
                title: "Call sheet exported",
                description: "Call sheet has been downloaded successfully.",
            });
        } catch (error) {
            toast({
                title: "Export failed",
                description: error instanceof Error ? error.message : "Failed to export call sheet",
                variant: "destructive",
            });
        }
    };

    const handleDeleteLineup = async () => {
        try {
            await deleteLineupMutation.mutateAsync(lineupId);
            toast({
                title: "Lineup deleted",
                description: "The lineup has been deleted successfully.",
            });
            router.push(`/org/${slug}/rosters/lineups`);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete lineup",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                <div className="h-96 bg-muted animate-pulse rounded" />
            </div>
        );
    }

    if (!lineup) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Lineup not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const starters = slots.filter(s => !s.isSub);
    const subs = slots.filter(s => s.isSub);

    return (
        <div className="p-6 space-y-6">
            <EditSlotDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                slot={editingSlot}
                availablePlayers={availablePlayers}
                teamId={lineup?.team?.id || ""}
                onSave={handleSaveSlot}
            />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/org/${slug}/rosters/lineups`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Lineups
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {lineup.title || `Lineup for Event`}
                            </h1>
                            {lineup.published ? (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Published
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                    <Clock className="h-3 w-3" />
                                    Draft
                                </span>
                            )}
                        </div>
                        <p className="text-muted-foreground">
                            {lineup.team.name} • {lineup.team.game}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportCallSheet}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Call Sheet
                    </Button>
                    {!lineup.published && (
                        <>
                            <Button onClick={handleSave} disabled={setSlotsMutation.isPending}>
                                <Save className="h-4 w-4 mr-2" />
                                {setSlotsMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={deleteLineupMutation.isPending}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Lineup
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
                    <Card className="w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                        <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2">
                                <Trash2 className="h-5 w-5" />
                                Delete Lineup?
                            </CardTitle>
                            <CardDescription>
                                This will permanently delete this lineup and all player slots. This action cannot be undone.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-semibold">{lineup.title || 'Lineup'}</p>
                                <p className="text-sm text-muted-foreground">{lineup.team.name} • {lineup.team.game}</p>
                                <p className="text-sm text-muted-foreground mt-1">{slots.length} player slots</p>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteLineup}
                                    disabled={deleteLineupMutation.isPending}
                                >
                                    {deleteLineupMutation.isPending ? "Deleting..." : "Delete Lineup"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Current Players
                                </CardTitle>
                                <CardDescription>
                                    Main roster for this event
                                </CardDescription>
                            </div>
                            {!lineup.published && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddSlot(false)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Current Player
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {starters.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No current players assigned yet</p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="mt-2"
                                    onClick={() => handleAddSlot(false)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Player
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {starters.map((slot: any) => (
                                    <div
                                        key={slot.id}
                                        className="p-3 border rounded-lg flex items-center justify-between"
                                    >
                                        <div className="flex-1">
                                            <p className="font-semibold">
                                                {slot.player?.gamerTag || "Unassigned"}
                                            </p>
                                            {slot.role && (
                                                <p className="text-sm text-muted-foreground">{slot.role}</p>
                                            )}
                                            {slot.notes && (
                                                <p className="text-xs text-muted-foreground italic mt-1">{slot.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {slot.player && (
                                                <Link
                                                    href={`/org/${slug}/rosters/players/${slot.playerId}`}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    View Profile
                                                </Link>
                                            )}
                                            {!lineup.published && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEditSlot(slot)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleRemoveSlot(slot.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Substitutes
                                </CardTitle>
                                <CardDescription>
                                    Backup players for this event
                                </CardDescription>
                            </div>
                            {!lineup.published && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddSlot(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Sub
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {subs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No substitutes assigned yet</p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="mt-2"
                                    onClick={() => handleAddSlot(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Substitute
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {subs.map((slot: any) => (
                                    <div
                                        key={slot.id}
                                        className="p-3 border rounded-lg flex items-center justify-between"
                                    >
                                        <div className="flex-1">
                                            <p className="font-semibold">
                                                {slot.player?.gamerTag || "Unassigned"}
                                            </p>
                                            {slot.role && (
                                                <p className="text-sm text-muted-foreground">{slot.role}</p>
                                            )}
                                            {slot.notes && (
                                                <p className="text-xs text-muted-foreground italic mt-1">{slot.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {slot.player && (
                                                <Link
                                                    href={`/org/${slug}/rosters/players/${slot.playerId}`}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    View Profile
                                                </Link>
                                            )}
                                            {!lineup.published && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEditSlot(slot)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleRemoveSlot(slot.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
