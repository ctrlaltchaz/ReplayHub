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
import type { CreatePlayerDto } from "@/types/roster";
import { useState } from "react";

interface PlayerCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreatePlayerDto) => void;
    isLoading?: boolean;
    teams?: Array<{ id: string; name: string }>;
}

export function PlayerCreateDialog({
    open,
    onOpenChange,
    onSubmit,
    isLoading = false,
    teams = [],
}: PlayerCreateDialogProps) {
    const [formData, setFormData] = useState<CreatePlayerDto>({
        gamerTag: "",
        role: "",
        rank: "",
        bio: "",
        teamId: "",
        socials: {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleReset = () => {
        setFormData({
            gamerTag: "",
            role: "",
            rank: "",
            bio: "",
            teamId: "",
            socials: {},
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Player</DialogTitle>
                        <DialogDescription>
                            Add a new player to your roster. You can assign them to a team later.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="gamerTag">Gamer Tag / IGN *</Label>
                            <Input
                                id="gamerTag"
                                placeholder="e.g. ProPlayer123"
                                value={formData.gamerTag}
                                onChange={(e) =>
                                    setFormData({ ...formData, gamerTag: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="realName">Real Name</Label>
                            <Input
                                id="realName"
                                placeholder="e.g. John Smith"
                                value={formData.realName || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, realName: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                placeholder="e.g. DPS, Support, Tank, Mid, Jungle"
                                value={formData.role || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, role: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rank">Rank</Label>
                            <Input
                                id="rank"
                                placeholder="e.g. Diamond, Radiant, Master"
                                value={formData.rank || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, rank: e.target.value })
                                }
                            />
                        </div>

                        {teams.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="teamId">Team (Optional)</Label>
                                <Select
                                    value={formData.teamId || "none"}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, teamId: value === "none" ? "" : value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No team</SelectItem>
                                        {teams.map((team) => (
                                            <SelectItem key={team.id} value={team.id}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                placeholder="Short player description..."
                                value={formData.bio || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, bio: e.target.value })
                                }
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Social Links (Optional)</Label>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Twitch URL"
                                    value={formData.socials?.twitch || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            socials: { ...formData.socials, twitch: e.target.value },
                                        })
                                    }
                                />
                                <Input
                                    placeholder="Twitter/X URL"
                                    value={formData.socials?.twitter || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            socials: { ...formData.socials, twitter: e.target.value },
                                        })
                                    }
                                />
                                <Input
                                    placeholder="Discord Username"
                                    value={formData.socials?.discord || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            socials: { ...formData.socials, discord: e.target.value },
                                        })
                                    }
                                />
                            </div>
                        </div>
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
                            {isLoading ? "Adding..." : "Add Player"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
