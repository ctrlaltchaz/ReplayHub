"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useUpdatePlayerSettings } from "@/hooks/profile/useUpdatePlayerSettings";
import { getServerUrl } from "@/lib/api/config";
import type { Player } from "@/types/roster";
import { ExternalLink, Eye, EyeOff, Gamepad2, Pencil, RefreshCw, Save, User, X } from "lucide-react";
import { useState } from "react";

interface PlayerProfileCardProps {
    player: Player;
    slug: string;
    onUpdate: () => void;
}

export function PlayerProfileCard({ player, slug, onUpdate }: PlayerProfileCardProps) {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [formData, setFormData] = useState({
        gamerTag: player.gamerTag || "",
        realName: player.realName || "",
        role: player.role || "",
        rank: player.rank || "",
        bio: player.bio || "",
        socials: player.socialsJson || {},
    });

    const updateSettings = useUpdatePlayerSettings(slug, player.id);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`http://localhost:3001/api/org/${slug}/players/${player.id}/my-profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            toast({
                title: "Profile updated",
                description: "Your player profile has been updated successfully.",
            });

            setIsEditing(false);
            onUpdate();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            gamerTag: player.gamerTag || "",
            realName: player.realName || "",
            role: player.role || "",
            rank: player.rank || "",
            bio: player.bio || "",
            socials: player.socialsJson || {},
        });
        setIsEditing(false);
    };

    const handleSyncWithUserProfile = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch(`http://localhost:3001/api/org/${slug}/players/${player.id}/sync-user-data`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to sync with user profile");
            }

            toast({
                title: "Profile synced",
                description: "Your player profile has been synced with your user profile.",
            });

            onUpdate();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to sync profile",
                variant: "destructive",
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleStatsVisibilityToggle = async (checked: boolean) => {
        try {
            await updateSettings.mutateAsync({ statsVisible: checked });
            toast({
                title: "Privacy settings updated",
                description: `Your game statistics are now ${checked ? 'visible' : 'hidden'} to other players.`,
            });
            // Refresh the page to update the stats visibility
            window.location.reload();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update privacy settings",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    Player Profile
                </CardTitle>
                <CardDescription>
                    Your competitive player information
                </CardDescription>
                <div className="flex gap-2 pt-4">
                    {!isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `/org/${slug}/roster/players/${player.id}`}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Full Profile
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleSyncWithUserProfile} disabled={isSyncing}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                                Sync
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                        </>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Avatar and Gamer Tag */}
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                        {player.avatar ? (
                            <img
                                src={`${getServerUrl()}${player.avatar}`}
                                alt={player.gamerTag}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User className="h-10 w-10 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1">
                        {isEditing ? (
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
                        ) : (
                            <div>
                                <h3 className="text-2xl font-bold">{player.gamerTag}</h3>
                                {player.realName && (
                                    <p className="text-muted-foreground">{player.realName}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Teams */}
                {player.teams && player.teams.length > 0 && (
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Teams</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {player.teams.map((tm) => (
                                <div
                                    key={tm.id}
                                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                                >
                                    {tm.team?.name}
                                    {tm.isStarter && " (Starter)"}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Real Name */}
                {isEditing && (
                    <div className="space-y-2">
                        <Label htmlFor="realName">Real Name</Label>
                        <Input
                            id="realName"
                            value={formData.realName}
                            onChange={(e) =>
                                setFormData({ ...formData, realName: e.target.value })
                            }
                        />
                    </div>
                )}

                {/* Role & Rank */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        {isEditing ? (
                            <Input
                                id="role"
                                placeholder="e.g. DPS, Support, Tank"
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({ ...formData, role: e.target.value })
                                }
                            />
                        ) : (
                            <p className="text-sm">{player.role || "Not set"}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rank">Rank</Label>
                        {isEditing ? (
                            <Input
                                id="rank"
                                placeholder="e.g. Diamond, Radiant"
                                value={formData.rank}
                                onChange={(e) =>
                                    setFormData({ ...formData, rank: e.target.value })
                                }
                            />
                        ) : (
                            <p className="text-sm">{player.rank || "Not set"}</p>
                        )}
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                        <Textarea
                            id="bio"
                            placeholder="Tell us about yourself..."
                            value={formData.bio}
                            onChange={(e) =>
                                setFormData({ ...formData, bio: e.target.value })
                            }
                            rows={3}
                        />
                    ) : (
                        <p className="text-sm">{player.bio || "No bio yet"}</p>
                    )}
                </div>

                {/* Stats Visibility Toggle */}
                {!isEditing && (
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    {player.statsVisible ? (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <Label htmlFor="stats-visibility" className="text-base cursor-pointer">
                                        Game Statistics Visibility
                                    </Label>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {player.statsVisible
                                        ? "Your game statistics are visible to other players"
                                        : "Your game statistics are hidden from other players"}
                                </p>
                            </div>
                            <Switch
                                id="stats-visibility"
                                checked={player.statsVisible ?? true}
                                onCheckedChange={handleStatsVisibilityToggle}
                                disabled={updateSettings.isPending}
                            />
                        </div>
                    </div>
                )}

                {/* Social Links */}
                <div className="space-y-2">
                    <Label>Social Links</Label>
                    {isEditing ? (
                        <div className="space-y-2">
                            <Input
                                placeholder="Twitch URL"
                                value={(formData.socials as any)?.twitch || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        socials: { ...formData.socials, twitch: e.target.value },
                                    })
                                }
                            />
                            <Input
                                placeholder="Twitter/X URL"
                                value={(formData.socials as any)?.twitter || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        socials: { ...formData.socials, twitter: e.target.value },
                                    })
                                }
                            />
                            <Input
                                placeholder="Discord Username"
                                value={(formData.socials as any)?.discord || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        socials: { ...formData.socials, discord: e.target.value },
                                    })
                                }
                            />
                        </div>
                    ) : player.socialsJson && Object.keys(player.socialsJson).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(player.socialsJson).map(([platform, url]) => (
                                <a
                                    key={platform}
                                    href={url as string}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                >
                                    {platform}
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No social links added</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function PlayerProfileCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
    );
}
