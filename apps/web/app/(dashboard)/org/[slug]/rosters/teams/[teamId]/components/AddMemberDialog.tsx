"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { usePlayersList } from "../../../hooks/usePlayersList";

interface AddMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { playerId: string; isStarter?: boolean; position?: string }) => void;
    isLoading: boolean;
    teamId: string;
    slug: string;
    existingMemberIds: string[];
}

export function AddMemberDialog({
    open,
    onOpenChange,
    onSubmit,
    isLoading,
    teamId,
    slug,
    existingMemberIds,
}: AddMemberDialogProps) {
    const [playerId, setPlayerId] = useState("");
    const [position, setPosition] = useState("");
    const [isStarter, setIsStarter] = useState(true);

    const { data: allPlayers = [] } = usePlayersList(slug, {});

    // Filter out players already on the team
    const availablePlayers = allPlayers.filter(
        (player: any) => !existingMemberIds.includes(player.id)
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!playerId) return;

        onSubmit({
            playerId,
            position: position || undefined,
            isStarter,
        });

        // Reset form
        setPlayerId("");
        setPosition("");
        setIsStarter(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>
                            Select a player to add to this team.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="player">Player *</Label>
                            <Select value={playerId} onValueChange={setPlayerId} required>
                                <SelectTrigger id="player">
                                    <SelectValue placeholder="Select a player" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availablePlayers.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground">
                                            No available players
                                        </div>
                                    ) : (
                                        availablePlayers.map((player: any) => (
                                            <SelectItem key={player.id} value={player.id}>
                                                {player.gamerTag}
                                                {player.role && ` • ${player.role}`}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                placeholder="e.g., Mid Laner, Tank, Support"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="starter">Current Player</Label>
                            <Switch
                                id="starter"
                                checked={isStarter}
                                onCheckedChange={setIsStarter}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !playerId}>
                            {isLoading ? "Adding..." : "Add Member"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
