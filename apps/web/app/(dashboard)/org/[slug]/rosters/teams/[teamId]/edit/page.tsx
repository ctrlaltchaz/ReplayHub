"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUpdateTeam } from "../../../hooks/useUpdateTeam";
import { useTeam } from "../hooks/useTeam";

const GAMES = [
    { value: "Valorant", label: "Valorant", logo: "/logos/valorant.svg" },
    { value: "League of Legends", label: "League of Legends", logo: "/logos/lol.svg" },
    { value: "Counter-Strike 2", label: "Counter-Strike 2", logo: "/logos/cs2.svg" },
    { value: "Dota 2", label: "Dota 2", logo: "/logos/dota2.svg" },
    { value: "Overwatch", label: "Overwatch", logo: "/logos/overwatch.svg" },
    { value: "Rocket League", label: "Rocket League", logo: "/logos/rocketleague.svg" },
    { value: "Apex Legends", label: "Apex Legends", logo: "/logos/apex.svg" },
];

export default function TeamEditPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const teamId = params?.teamId as string;
    const { toast } = useToast();

    const { data: team, isLoading } = useTeam(slug, teamId);
    const updateTeamMutation = useUpdateTeam(slug, teamId);

    const [formData, setFormData] = useState({
        name: "",
        game: "",
        season: "",
        status: "active" as "active" | "archived",
    });

    useEffect(() => {
        if (team) {
            setFormData({
                name: team.name,
                game: team.game,
                season: team.season || "",
                status: team.status,
            });
        }
    }, [team]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateTeamMutation.mutateAsync(formData);
            toast({
                title: "Team updated",
                description: "Team information has been updated successfully.",
            });
            router.push(`/org/${slug}/rosters/teams/${teamId}`);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update team",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">Team not found</h2>
                    <p className="text-muted-foreground mb-4">
                        The team you're looking for doesn't exist.
                    </p>
                    <Button asChild>
                        <Link href={`/org/${slug}/rosters`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Rosters
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const selectedGame = GAMES.find((g) => g.value === formData.game);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/org/${slug}/rosters/teams/${teamId}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Team</h1>
                    <p className="text-muted-foreground">Update team information</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Team Details</CardTitle>
                    <CardDescription>
                        Modify the team's name, game, and other details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Team Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter team name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="game">Game</Label>
                            <Select
                                value={formData.game}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, game: value })
                                }
                            >
                                <SelectTrigger id="game">
                                    <SelectValue placeholder="Select a game">
                                        {selectedGame && (
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    src={selectedGame.logo}
                                                    alt={selectedGame.label}
                                                    width={20}
                                                    height={20}
                                                />
                                                <span>{selectedGame.label}</span>
                                            </div>
                                        )}
                                    </SelectValue>
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
                                                <span>{game.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="season">Season (optional)</Label>
                            <Input
                                id="season"
                                placeholder="e.g., 2025 Spring, Season 3"
                                value={formData.season}
                                onChange={(e) =>
                                    setFormData({ ...formData, season: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: "active" | "archived") =>
                                    setFormData({ ...formData, status: value })
                                }
                            >
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/org/${slug}/rosters/teams/${teamId}`)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateTeamMutation.isPending}>
                                <Save className="h-4 w-4 mr-2" />
                                {updateTeamMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
