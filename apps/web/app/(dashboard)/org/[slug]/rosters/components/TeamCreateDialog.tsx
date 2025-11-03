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
import type { CreateTeamDto } from "@/types/roster";
import Image from "next/image";
import { useState } from "react";

const GAMES = [
    { value: "Valorant", label: "Valorant", logo: "/logos/valorant.svg" },
    { value: "League of Legends", label: "League of Legends", logo: "/logos/lol.svg" },
    { value: "Counter-Strike 2", label: "Counter-Strike 2", logo: "/logos/cs2.svg" },
    { value: "Dota 2", label: "Dota 2", logo: "/logos/dota2.svg" },
    { value: "Overwatch", label: "Overwatch", logo: "/logos/overwatch.svg" },
    { value: "Rocket League", label: "Rocket League", logo: "/logos/rocketleague.svg" },
    { value: "Apex Legends", label: "Apex Legends", logo: "/logos/apex.svg" },
];

interface TeamCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateTeamDto) => void;
    isLoading?: boolean;
    players?: Array<{ id: string; gamerTag: string; realName?: string }>;
}

export function TeamCreateDialog({
    open,
    onOpenChange,
    onSubmit,
    isLoading = false,
    players = [],
}: TeamCreateDialogProps) {
    const [formData, setFormData] = useState<CreateTeamDto>({
        name: "",
        game: "",
        season: "",
        coachId: "",
        captainId: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleReset = () => {
        setFormData({
            name: "",
            game: "",
            season: "",
            coachId: "",
            captainId: "",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                        <DialogDescription>
                            Add a new team to your roster. You can add players to the team after creation.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Team Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Team Replay"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="game">Game *</Label>
                            <Select
                                value={formData.game}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, game: value })
                                }
                                required
                            >
                                <SelectTrigger id="game">
                                    <SelectValue placeholder="Select a game" />
                                </SelectTrigger>
                                <SelectContent>
                                    {GAMES.map((game) => (
                                        <SelectItem key={game.value} value={game.value}>
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    src={game.logo}
                                                    alt={game.label}
                                                    width={20}
                                                    height={20}
                                                    className="object-contain"
                                                />
                                                <span>{game.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="season">Season</Label>
                            <Input
                                id="season"
                                placeholder="e.g. 2025 Spring"
                                value={formData.season || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, season: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="coachId">Coach ID</Label>
                            <Input
                                id="coachId"
                                placeholder="Optional coach player ID"
                                value={formData.coachId || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, coachId: e.target.value })
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty if no coach assigned yet
                            </p>
                        </div>

                        {players.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="captainId">Team Captain (Optional)</Label>
                                <Select
                                    value={formData.captainId || "none"}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, captainId: value === "none" ? "" : value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a captain" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Captain</SelectItem>
                                        {players.map((player) => (
                                            <SelectItem key={player.id} value={player.id}>
                                                {player.gamerTag}
                                                {player.realName && ` (${player.realName})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                handleReset();
                                onOpenChange(false);
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Team"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
