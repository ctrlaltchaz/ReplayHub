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
import type { Team, UpdateTeamDto } from "@/types/roster";
import Image from "next/image";
import { useEffect, useState } from "react";

const GAMES = [
    { value: "Valorant", label: "Valorant", logo: "/logos/valorant.svg" },
    { value: "League of Legends", label: "League of Legends", logo: "/logos/lol.svg" },
    { value: "Counter-Strike 2", label: "Counter-Strike 2", logo: "/logos/cs2.svg" },
    { value: "Dota 2", label: "Dota 2", logo: "/logos/dota2.svg" },
    { value: "Overwatch", label: "Overwatch", logo: "/logos/overwatch.svg" },
    { value: "Rocket League", label: "Rocket League", logo: "/logos/rocketleague.svg" },
    { value: "Apex Legends", label: "Apex Legends", logo: "/logos/apex.svg" },
];

interface TeamEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: UpdateTeamDto) => void;
    isLoading?: boolean;
    team?: Team;
    players?: Array<{ id: string; gamerTag: string; realName?: string }>;
}

export function TeamEditDialog({
    open,
    onOpenChange,
    onSubmit,
    isLoading = false,
    team,
    players = [],
}: TeamEditDialogProps) {
    const [formData, setFormData] = useState<UpdateTeamDto>({
        name: "",
        game: "",
        season: "",
        status: "active",
        captainId: "",
    });

    useEffect(() => {
        if (team) {
            setFormData({
                name: team.name,
                game: team.game,
                season: team.season || "",
                status: team.status,
                captainId: team.captainId || "",
            });
        }
    }, [team]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Team</DialogTitle>
                        <DialogDescription>
                            Update team information
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Team Name *</Label>
                            <Input
                                id="name"
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
                                <SelectTrigger>
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
                                                />
                                                {game.label}
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
                                value={formData.season || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, season: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value as 'active' | 'archived' })
                                }
                            >
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
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
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
