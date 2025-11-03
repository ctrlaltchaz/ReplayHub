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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import type { CreateMatchDto } from "@/types/gamelog";
import { ArrowLeft, Loader2, Save, Trophy } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useTeamsList } from "../../rosters/hooks/useTeamsList";
import { useCreateMatch } from "../hooks/useCreateMatch";

const GAMES = [
    { value: "Valorant", label: "Valorant" },
    { value: "League of Legends", label: "League of Legends" },
    { value: "Counter-Strike 2", label: "Counter-Strike 2" },
    { value: "Dota 2", label: "Dota 2" },
    { value: "Overwatch", label: "Overwatch" },
    { value: "Rocket League", label: "Rocket League" },
    { value: "Apex Legends", label: "Apex Legends" },
];

export default function CreateMatchPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const { hasPermission } = useAuth();
    const { toast } = useToast();

    const { data: teamsData } = useTeamsList(slug);
    const teams = teamsData || [];

    console.log('Teams data:', teams);

    const createMatch = useCreateMatch(slug);

    const [formData, setFormData] = useState<CreateMatchDto>({
        teamId: "",
        opponent: "",
        tournament: "",
        stage: "",
        bestOf: 1,
        startedAt: new Date().toISOString().split("T")[0],
        endedAt: "",
        vodUrl: "",
        notes: "",
    });

    // Additional fields for updating after creation
    const [teamScore, setTeamScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [result, setResult] = useState<"win" | "loss" | "draw">("win");

    const canManage = hasPermission("gamelog.manage");

    // Get selected team's game
    const selectedTeam = teams.find((t: any) => t.id === formData.teamId);
    const selectedGame = selectedTeam?.game || "";

    const handleChange = (field: keyof CreateMatchDto, value: any) => {
        console.log(`handleChange called - field: ${field}, value:`, value, typeof value);
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Current formData state:', formData);

        if (!formData.opponent) {
            toast({
                title: "Validation Error",
                description: "Opponent name is required",
                variant: "destructive",
            });
            return;
        }

        if (!formData.teamId || formData.teamId === "none") {
            toast({
                title: "Validation Error",
                description: "Team is required",
                variant: "destructive",
            });
            return;
        }

        try {
            // Clean up the data - remove empty optional fields
            const cleanedData: any = {
                opponent: formData.opponent,
            };

            // Only add fields if they have valid values
            if (formData.teamId && formData.teamId !== "none") {
                cleanedData.teamId = formData.teamId;
            }
            if (formData.tournament) cleanedData.tournament = formData.tournament;
            if (formData.stage) cleanedData.stage = formData.stage;
            if (formData.bestOf) cleanedData.bestOf = formData.bestOf;
            if (formData.startedAt) cleanedData.startedAt = formData.startedAt;
            if (formData.endedAt) cleanedData.endedAt = formData.endedAt;
            if (formData.vodUrl) cleanedData.vodUrl = formData.vodUrl;
            if (formData.notes) cleanedData.notes = formData.notes;

            console.log('Sending match data:', cleanedData);

            // Create the match first
            const response = await createMatch.mutateAsync(cleanedData);
            console.log('Match created with ID:', response.id);

            // Then update with score and result if provided
            if (teamScore > 0 || opponentScore > 0) {
                const updateData = {
                    score: `${teamScore}-${opponentScore}`,
                    result: result,
                };

                console.log('Updating match with score/result:', updateData);

                const updateResponse = await fetch(
                    `http://localhost:3001/api/org/${slug}/gamelog/matches/${response.id}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify(updateData),
                    }
                );

                if (!updateResponse.ok) {
                    console.error('Failed to update match with score');
                }
            }

            toast({
                title: "Success",
                description: "Match created successfully",
            });
            // Navigate to the match detail page
            router.push(`/org/${slug}/gamelog/${response.id}`);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to create match",
                variant: "destructive",
            });
        }
    };

    if (!canManage) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            You don't have permission to create matches.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/org/${slug}/gamelog`)}
                        className="mb-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Game Log
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Trophy className="h-6 w-6" />
                        Log New Match
                    </h1>
                    <p className="text-muted-foreground">
                        Record match details and results
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Match Information</CardTitle>
                            <CardDescription>
                                Enter the details of the match you want to log
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Team Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="teamId">
                                    Team <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.teamId || "none"}
                                    onValueChange={(value) => {
                                        console.log("SELECT onValueChange - raw value:", value);
                                        const processedValue = value === "none" ? "" : value;
                                        console.log("SELECT onValueChange - processed value:", processedValue);
                                        handleChange("teamId", processedValue);
                                    }}
                                >
                                    <SelectTrigger id="teamId">
                                        <SelectValue placeholder="Select a team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Select a team</SelectItem>
                                        {teams.map((team: any) => (
                                            <SelectItem key={team.id} value={team.id}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Game Display (from selected team) */}
                            {selectedGame && (
                                <div className="space-y-2">
                                    <Label htmlFor="game">Game</Label>
                                    <Input
                                        id="game"
                                        value={selectedGame}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Game is determined by the selected team
                                    </p>
                                </div>
                            )}

                            {/* Opponent Name */}
                            <div className="space-y-2">
                                <Label htmlFor="opponent">
                                    Opponent Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="opponent"
                                    value={formData.opponent}
                                    onChange={(e) =>
                                        handleChange("opponent", e.target.value)
                                    }
                                    placeholder="Enter opponent name"
                                    required
                                />
                            </div>

                            {/* Tournament */}
                            <div className="space-y-2">
                                <Label htmlFor="tournament">Tournament</Label>
                                <Input
                                    id="tournament"
                                    value={formData.tournament}
                                    onChange={(e) => handleChange("tournament", e.target.value)}
                                    placeholder="Enter tournament name"
                                />
                            </div>

                            {/* Stage */}
                            <div className="space-y-2">
                                <Label htmlFor="stage">Stage</Label>
                                <Input
                                    id="stage"
                                    value={formData.stage}
                                    onChange={(e) => handleChange("stage", e.target.value)}
                                    placeholder="e.g., Playoffs, Group Stage"
                                />
                            </div>

                            {/* Best Of */}
                            <div className="space-y-2">
                                <Label htmlFor="bestOf">Best Of</Label>
                                <Input
                                    id="bestOf"
                                    type="number"
                                    min="1"
                                    max="9"
                                    value={formData.bestOf}
                                    onChange={(e) => handleChange("bestOf", parseInt(e.target.value) || 1)}
                                    placeholder="e.g., 3 for Best of 3"
                                />
                            </div>

                            {/* Match Dates */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="startedAt">
                                        Start Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="startedAt"
                                        type="date"
                                        value={formData.startedAt}
                                        onChange={(e) => handleChange("startedAt", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endedAt">End Date</Label>
                                    <Input
                                        id="endedAt"
                                        type="date"
                                        value={formData.endedAt}
                                        onChange={(e) => handleChange("endedAt", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* VOD URL */}
                            <div className="space-y-2">
                                <Label htmlFor="vodUrl">VOD URL</Label>
                                <Input
                                    id="vodUrl"
                                    type="url"
                                    value={formData.vodUrl}
                                    onChange={(e) => handleChange("vodUrl", e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>

                            {/* Score Section */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="teamScore">Team Score</Label>
                                    <Input
                                        id="teamScore"
                                        type="number"
                                        min="0"
                                        value={teamScore}
                                        onChange={(e) => setTeamScore(parseInt(e.target.value) || 0)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="opponentScore">Opponent Score</Label>
                                    <Input
                                        id="opponentScore"
                                        type="number"
                                        min="0"
                                        value={opponentScore}
                                        onChange={(e) => setOpponentScore(parseInt(e.target.value) || 0)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="result">Result</Label>
                                    <Select
                                        value={result}
                                        onValueChange={(value: any) => setResult(value)}
                                    >
                                        <SelectTrigger id="result">
                                            <SelectValue placeholder="Select result" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="win">Win</SelectItem>
                                            <SelectItem value="loss">Loss</SelectItem>
                                            <SelectItem value="draw">Draw</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleChange("notes", e.target.value)}
                                    placeholder="Add any additional notes or comments"
                                    rows={4}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={createMatch.isPending}
                                >
                                    {createMatch.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Create Match
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(`/org/${slug}/gamelog`)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
