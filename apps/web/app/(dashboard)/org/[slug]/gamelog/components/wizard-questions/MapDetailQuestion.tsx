"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Minus, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface MapDetailQuestionProps {
    roundNumber: number;
    gameName?: string; // For map suggestions
    availableMaps?: string[];
    value?: {
        mapName: string;
        ourScore: number;
        theirScore: number;
    };
    onChange: (value: { mapName: string; ourScore: number; theirScore: number }) => void;
}

export function MapDetailQuestion({
    roundNumber,
    gameName,
    availableMaps = [],
    value,
    onChange,
}: MapDetailQuestionProps) {
    const [mapName, setMapName] = useState(value?.mapName || "");
    const [ourScore, setOurScore] = useState(value?.ourScore?.toString() || "0");
    const [theirScore, setTheirScore] = useState(value?.theirScore?.toString() || "0");
    const [useCustomMap, setUseCustomMap] = useState(false);

    useEffect(() => {
        if (value) {
            setMapName(value.mapName);
            setOurScore(value.ourScore.toString());
            setTheirScore(value.theirScore.toString());
        }
    }, [value]);

    useEffect(() => {
        // Auto-update parent when any field changes
        if (mapName && ourScore !== "" && theirScore !== "") {
            onChange({
                mapName,
                ourScore: parseInt(ourScore) || 0,
                theirScore: parseInt(theirScore) || 0,
            });
        }
    }, [mapName, ourScore, theirScore]);

    const ourScoreNum = parseInt(ourScore) || 0;
    const theirScoreNum = parseInt(theirScore) || 0;
    const result = ourScoreNum > theirScoreNum ? "win" : ourScoreNum < theirScoreNum ? "loss" : "draw";

    const resultBadge = {
        win: { variant: "default" as const, label: "Win", className: "bg-green-600" },
        loss: { variant: "destructive" as const, label: "Loss", className: "" },
        draw: { variant: "secondary" as const, label: "Draw", className: "" },
    }[result];

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Map Name Selection */}
            <div className="space-y-3">
                <Label className="text-base font-medium">Map Name</Label>

                {availableMaps.length > 0 && !useCustomMap ? (
                    <div className="space-y-2">
                        <Select value={mapName} onValueChange={setMapName}>
                            <SelectTrigger className="h-12 text-lg">
                                <SelectValue placeholder="Select a map..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableMaps.map((map) => (
                                    <SelectItem key={map} value={map} className="text-base">
                                        {map}
                                    </SelectItem>
                                ))}
                                <SelectItem value="_custom_" className="text-base font-semibold">
                                    + Custom map name
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {mapName === "_custom_" && (
                            <Input
                                type="text"
                                placeholder="Enter custom map name..."
                                value={mapName === "_custom_" ? "" : mapName}
                                onChange={(e) => {
                                    setMapName(e.target.value);
                                    setUseCustomMap(true);
                                }}
                                className="h-12 text-lg"
                                autoFocus
                            />
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Input
                            type="text"
                            placeholder="Enter map name..."
                            value={mapName}
                            onChange={(e) => setMapName(e.target.value)}
                            className="h-12 text-lg"
                            autoFocus
                        />
                        {availableMaps.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setUseCustomMap(false);
                                    setMapName("");
                                }}
                            >
                                Choose from {gameName || "game"} map pool
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Score Input */}
            <div className="space-y-3">
                <Label className="text-base font-medium">Final Score</Label>

                <Card className="border-2">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center gap-6">
                            {/* Your Score */}
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="ourScore" className="text-sm text-muted-foreground">
                                    Your Team
                                </Label>
                                <Input
                                    id="ourScore"
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={ourScore}
                                    onChange={(e) => setOurScore(e.target.value)}
                                    className="h-16 text-3xl font-bold text-center"
                                />
                            </div>

                            {/* Divider */}
                            <div className="flex flex-col items-center justify-center py-8">
                                <Minus className="h-6 w-6 text-muted-foreground" />
                            </div>

                            {/* Opponent Score */}
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="theirScore" className="text-sm text-muted-foreground">
                                    Opponent
                                </Label>
                                <Input
                                    id="theirScore"
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={theirScore}
                                    onChange={(e) => setTheirScore(e.target.value)}
                                    className="h-16 text-3xl font-bold text-center"
                                />
                            </div>
                        </div>

                        {/* Result Badge */}
                        {(ourScoreNum > 0 || theirScoreNum > 0) && (
                            <div className="mt-6 flex items-center justify-center">
                                <Badge
                                    variant={resultBadge.variant}
                                    className={`text-lg px-4 py-2 ${resultBadge.className}`}
                                >
                                    <Trophy className="h-4 w-4 mr-2" />
                                    Round {roundNumber}: {resultBadge.label}
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Preview Summary */}
            {mapName && (ourScoreNum > 0 || theirScoreNum > 0) && (
                <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Round {roundNumber} Summary:</p>
                    <p className="font-semibold text-lg">
                        {mapName}: {ourScore} - {theirScore} ({resultBadge.label})
                    </p>
                </div>
            )}

            {/* Helpful hints */}
            <div className="text-xs text-muted-foreground space-y-1">
                <p>💡 Tip: Enter the final score after the map was completed</p>
            </div>
        </div>
    );
}
