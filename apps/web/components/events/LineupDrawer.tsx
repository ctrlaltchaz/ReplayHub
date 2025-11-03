"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useApiMutation, useApiQuery } from "@/lib/api/query";
import type { Player, Team } from "@/types/roster";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Users, X } from "lucide-react";
import { useState } from "react";

interface LineupDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventId: string;
    eventTitle: string;
    teamId?: string;
    currentLineupId?: string;
    slug: string;
}

interface Lineup {
    id: string;
    title: string;
    eventId: string;
    teamId?: string;
    slots: LineupSlot[];
}

interface LineupSlot {
    id: string;
    playerId: string;
    playerName: string;
    role?: string;
    isStarter: boolean;
}

export function LineupDrawer({
    open,
    onOpenChange,
    eventId,
    eventTitle,
    teamId,
    currentLineupId,
    slug,
}: LineupDrawerProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(teamId);
    const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());

    // Fetch teams
    const { data: teams, isLoading: teamsLoading } = useApiQuery<Team[]>(
        `/org/${slug}/teams`,
        {
            enabled: open,
            apiOptions: { credentials: 'include', slug },
        }
    );

    // Fetch players for selected team
    const playersPath = selectedTeamId ? `/org/${slug}/players?teamId=${selectedTeamId}` : '';
    const { data: players, isLoading: playersLoading } = useApiQuery<Player[]>(
        playersPath,
        {
            enabled: open && !!selectedTeamId && !!playersPath,
            apiOptions: { credentials: 'include', slug },
        }
    );

    // Fetch existing lineup if any
    const lineupPath = currentLineupId ? `/org/${slug}/events/${eventId}/lineup` : '';
    const { data: existingLineup, isLoading: lineupLoading } = useApiQuery<Lineup>(
        lineupPath,
        {
            enabled: open && !!currentLineupId && !!lineupPath,
            apiOptions: { credentials: 'include', slug },
        }
    );

    // Create/update lineup mutation
    const { mutate: saveLineup, isPending: isSaving } = useApiMutation(
        `/org/${slug}/events/${eventId}/lineup`,
        {
            method: currentLineupId ? 'PUT' : 'POST',
            apiOptions: { credentials: 'include', slug },
            onSuccess: () => {
                toast({
                    title: "Lineup saved",
                    description: "Event lineup has been updated successfully.",
                });
                queryClient.invalidateQueries({ queryKey: [`/org/${slug}/events/${eventId}`] });
                queryClient.invalidateQueries({ queryKey: [`/org/${slug}/events`] });
                onOpenChange(false);
            },
            onError: (error) => {
                toast({
                    title: "Failed to save lineup",
                    description: error instanceof Error ? error.message : "An error occurred",
                    variant: "destructive",
                });
            },
        }
    );

    const handleTogglePlayer = (playerId: string) => {
        const newSelection = new Set(selectedPlayers);
        if (newSelection.has(playerId)) {
            newSelection.delete(playerId);
        } else {
            newSelection.add(playerId);
        }
        setSelectedPlayers(newSelection);
    };

    const handleSave = () => {
        if (!selectedTeamId || selectedPlayers.size === 0) {
            toast({
                title: "Invalid selection",
                description: "Please select a team and at least one player.",
                variant: "destructive",
            });
            return;
        }

        const slots = Array.from(selectedPlayers).map(playerId => ({
            playerId,
            isStarter: true, // Default all to starters for now
        }));

        saveLineup({
            title: `${eventTitle} Lineup`,
            teamId: selectedTeamId,
            slots,
        });
    };

    // Pre-populate with existing lineup
    useState(() => {
        if (existingLineup && existingLineup.slots) {
            setSelectedPlayers(new Set(existingLineup.slots.map(s => s.playerId)));
            if (existingLineup.teamId) {
                setSelectedTeamId(existingLineup.teamId);
            }
        }
    });

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Assign Lineup
                    </SheetTitle>
                    <SheetDescription>
                        Select a team and players for <strong>{eventTitle}</strong>
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Team Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Select Team</label>
                        {teamsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : teams && teams.length > 0 ? (
                            <div className="grid gap-2">
                                {teams.map((team) => (
                                    <button
                                        key={team.id}
                                        onClick={() => setSelectedTeamId(team.id)}
                                        className={`
                                            p-3 rounded-lg border text-left transition-colors
                                            ${selectedTeamId === team.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{team.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {team.game} {team.season && `• ${team.season}`}
                                                </p>
                                            </div>
                                            {selectedTeamId === team.id && (
                                                <Check className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground py-4">
                                No teams found. Create a team first.
                            </p>
                        )}
                    </div>

                    <Separator />

                    {/* Player Selection */}
                    {selectedTeamId && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Select Players</label>
                                <Badge variant="secondary">
                                    {selectedPlayers.size} selected
                                </Badge>
                            </div>

                            {playersLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : players && players.length > 0 ? (
                                <div className="grid gap-2">
                                    {players.map((player) => {
                                        const isSelected = selectedPlayers.has(player.id);
                                        return (
                                            <button
                                                key={player.id}
                                                onClick={() => handleTogglePlayer(player.id)}
                                                className={`
                                                    p-3 rounded-lg border text-left transition-colors
                                                    ${isSelected
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{player.gamerTag}</p>
                                                        {player.role && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {player.role}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {isSelected ? (
                                                        <Check className="h-5 w-5 text-primary" />
                                                    ) : (
                                                        <div className="h-5 w-5 rounded border border-border" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground py-4">
                                    No players found for this team.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                            disabled={isSaving}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="flex-1"
                            disabled={isSaving || !selectedTeamId || selectedPlayers.size === 0}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Save Lineup
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
