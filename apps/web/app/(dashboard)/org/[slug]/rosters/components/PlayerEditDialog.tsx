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
import type { Player, UpdatePlayerDto } from "@/types/roster";
import { useEffect, useState } from "react";

interface PlayerEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: UpdatePlayerDto) => void;
    isLoading?: boolean;
    player?: Player;
    teams?: Array<{ id: string; name: string }>;
}

export function PlayerEditDialog({
    open,
    onOpenChange,
    onSubmit,
    isLoading = false,
    player,
    teams = [],
}: PlayerEditDialogProps) {
    const [formData, setFormData] = useState<UpdatePlayerDto>({
        gamerTag: "",
        realName: "",
        role: "",
        rank: "",
        bio: "",
        socials: {},
        isActive: true,
        teamId: "",
    });

    useEffect(() => {
        if (player) {
            setFormData({
                gamerTag: player.gamerTag,
                realName: player.realName || "",
                role: player.role || "",
                rank: player.rank || "",
                bio: player.bio || "",
                socials: player.socialsJson || {},
                isActive: player.isActive,
                teamId: player.teams?.[0]?.teamId || "",
            });
        }
    }, [player]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Player</DialogTitle>
                        <DialogDescription>
                            Update player information
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="gamerTag">Gamer Tag / IGN *</Label>
                            <Input
                                id="gamerTag"
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
                            <Label htmlFor="team">Team</Label>
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
                                    <SelectItem value="none">No Team</SelectItem>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={team.id}>
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
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
                                value={formData.rank || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, rank: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, bio: e.target.value })
                                }
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Social Links</Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="isActive">Status</Label>
                            <select
                                id="isActive"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.isActive ? "true" : "false"}
                                onChange={(e) =>
                                    setFormData({ ...formData, isActive: e.target.value === "true" })
                                }
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
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
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
