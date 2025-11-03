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
import type { UpdateMatchDto } from "@/types/gamelog";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTeamsList } from "../../../rosters/hooks/useTeamsList";
import { useMatch } from "../../hooks/useMatch";
import { useUpdateMatch } from "../../hooks/useUpdateMatch";

export default function EditMatchPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const matchId = params?.matchId as string;
    const { hasPermission } = useAuth();
    const { toast } = useToast();

    const { data: match, isLoading: matchLoading } = useMatch(slug, matchId);
    const { data: teamsData } = useTeamsList(slug);
    const teams = teamsData || [];

    const updateMatch = useUpdateMatch(slug, matchId);

    const [formData, setFormData] = useState<UpdateMatchDto>({
        teamId: "",
        opponent: "",
        tournament: "",
        stage: "",
        bestOf: 1,
        startedAt: "",
        endedAt: "",
        vodUrl: "",
        notes: "",
        result: undefined,
        score: "",
    });

    // Load match data into form when available
    useEffect(() => {
        if (match) {
            setFormData({
                teamId: match.teamId,
                opponent: match.opponent,
                tournament: match.tournament || "",
                stage: match.stage || "",
                bestOf: match.bestOf,
                startedAt: match.startedAt ? match.startedAt.split("T")[0] : "",
                endedAt: match.endedAt ? match.endedAt.split("T")[0] : "",
                vodUrl: match.vodUrl || "",
                notes: match.notes || "",
                result: match.result,
                score: match.score || "",
            });
        }
    }, [match]);

    const canManage = hasPermission("gamelog.manage");

    const handleChange = (field: keyof UpdateMatchDto, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.opponent) {
            toast({
                title: "Validation Error",
                description: "Opponent name is required",
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
            if (formData.result) cleanedData.result = formData.result;
            if (formData.score) cleanedData.score = formData.score;

            await updateMatch.mutateAsync(cleanedData);

            toast({
                title: "Success",
                description: "Match updated successfully",
            });
            router.push(`/org/${slug}/gamelog/${matchId}`);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to update match",
                variant: "destructive",
            });
        }
    };

    if (matchLoading) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!canManage) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            You don't have permission to edit matches.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Match Not Found</CardTitle>
                        <CardDescription>
                            The match you're looking for doesn't exist.
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
                <div className="flex items-center justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/org/${slug}/gamelog/${matchId}`)}
                            className="mb-2"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Match
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Match</h1>
                        <p className="text-muted-foreground">
                            Update match details and information
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Match Information</CardTitle>
                            <CardDescription>
                                Update the details of the match
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
                                        const processedValue = value === "none" ? "" : value;
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
                                    <Label htmlFor="startedAt">Start Date</Label>
                                    <Input
                                        id="startedAt"
                                        type="date"
                                        value={formData.startedAt}
                                        onChange={(e) => handleChange("startedAt", e.target.value)}
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

                            {/* Result and Score */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="result">Result</Label>
                                    <Select
                                        value={formData.result || "none"}
                                        onValueChange={(value) =>
                                            handleChange("result", value === "none" ? undefined : value)
                                        }
                                    >
                                        <SelectTrigger id="result">
                                            <SelectValue placeholder="Select result" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Not set</SelectItem>
                                            <SelectItem value="win">Win</SelectItem>
                                            <SelectItem value="loss">Loss</SelectItem>
                                            <SelectItem value="draw">Draw</SelectItem>
                                            <SelectItem value="forfeit">Forfeit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="score">Score</Label>
                                    <Input
                                        id="score"
                                        value={formData.score}
                                        onChange={(e) => handleChange("score", e.target.value)}
                                        placeholder="e.g., 2-1"
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
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleChange("notes", e.target.value)}
                                    placeholder="Add any additional notes about this match"
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(`/org/${slug}/gamelog/${matchId}`)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateMatch.isPending}>
                            {updateMatch.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Update Match
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
