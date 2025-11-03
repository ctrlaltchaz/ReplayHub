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
import { useEffect, useState } from "react";

interface Player {
    id: string;
    gamerTag: string;
    firstName?: string;
    lastName?: string;
}

interface SlotData {
    id?: string;
    playerId: string | null;
    role: string;
    isSub: boolean;
    notes?: string;
}

interface EditSlotDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    slot: SlotData | null;
    availablePlayers: Player[];
    teamId: string;
    onSave: (slot: SlotData) => void;
}

export function EditSlotDialog({
    open,
    onOpenChange,
    slot,
    availablePlayers,
    teamId,
    onSave,
}: EditSlotDialogProps) {
    const [playerId, setPlayerId] = useState<string>(slot?.playerId || "");
    const [role, setRole] = useState(slot?.role || "");
    const [notes, setNotes] = useState(slot?.notes || "");

    // Update state when slot changes
    useEffect(() => {
        if (slot) {
            setPlayerId(slot.playerId || "");
            setRole(slot.role || "");
            setNotes(slot.notes || "");
        }
    }, [slot, open]);

    const handleSave = () => {
        onSave({
            id: slot?.id,
            playerId: playerId === "" ? null : playerId,
            role,
            isSub: slot?.isSub || false,
            notes,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {slot?.isSub ? "Edit Substitute" : "Edit Current Player Position"}
                    </DialogTitle>
                    <DialogDescription>
                        Assign a player to this slot and specify their role.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="player">Player</Label>
                        <Select value={playerId} onValueChange={setPlayerId}>
                            <SelectTrigger id="player">
                                <SelectValue placeholder="Select a player" />
                            </SelectTrigger>
                            <SelectContent>
                                {availablePlayers.map((player) => (
                                    <SelectItem key={player.id} value={player.id}>
                                        {player.gamerTag}
                                        {player.firstName && player.lastName && (
                                            <span className="text-muted-foreground ml-2">
                                                ({player.firstName} {player.lastName})
                                            </span>
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input
                            id="role"
                            placeholder="e.g., Top Lane, Support, Entry Fragger"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Input
                            id="notes"
                            placeholder="Additional notes about this position"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
