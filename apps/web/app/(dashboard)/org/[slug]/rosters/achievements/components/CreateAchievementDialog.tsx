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
import { Textarea } from "@/components/ui/textarea";
import type { CreateAchievementDto, Player, Team } from "@/types/roster";
import { useState } from "react";

interface CreateAchievementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateAchievementDto) => Promise<void>;
    teams: Team[];
    players: Player[];
    isLoading: boolean;
}

export function CreateAchievementDialog({
    open,
    onOpenChange,
    onSubmit,
    teams,
    players,
    isLoading,
}: CreateAchievementDialogProps) {
    const [formData, setFormData] = useState<CreateAchievementDto>({
        title: "",
        date: new Date().toISOString().split('T')[0],
        details: "",
    });
    const [achievementType, setAchievementType] = useState<"team" | "player">("team");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
        setFormData({
            title: "",
            date: new Date().toISOString().split('T')[0],
            details: "",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Achievement</DialogTitle>
                    <DialogDescription>
                        Record a team or player achievement
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Achievement For</Label>
                            <Select
                                value={achievementType}
                                onValueChange={(value) => {
                                    setAchievementType(value as "team" | "player");
                                    setFormData({ ...formData, teamId: undefined, playerId: undefined });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="team">Team</SelectItem>
                                    <SelectItem value="player">Player</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {achievementType === "team" ? (
                            <div className="space-y-2">
                                <Label htmlFor="teamId">Team</Label>
                                <Select
                                    value={formData.teamId || ""}
                                    onValueChange={(value) => setFormData({ ...formData, teamId: value })}
                                >
                                    <SelectTrigger id="teamId">
                                        <SelectValue placeholder="Select team" />
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
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="playerId">Player</Label>
                                <Select
                                    value={formData.playerId || ""}
                                    onValueChange={(value) => setFormData({ ...formData, playerId: value })}
                                >
                                    <SelectTrigger id="playerId">
                                        <SelectValue placeholder="Select player" />
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

                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Tournament Win, MVP Award"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Date *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eventRef">Event Reference</Label>
                            <Input
                                id="eventRef"
                                value={formData.eventRef || ""}
                                onChange={(e) => setFormData({ ...formData, eventRef: e.target.value })}
                                placeholder="Event name or ID"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="details">Details</Label>
                            <Textarea
                                id="details"
                                value={formData.details || ""}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                placeholder="Additional details about the achievement..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Achievement"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
