"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Star, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { StatField } from "../../lib/game-stat-fields";
import { calculateKDA } from "../../lib/game-stat-fields";

interface PlayerStatsQuestionProps {
    roundNumber: number;
    roundName: string;
    playerName: string;
    playerAvatar?: string;
    statFields: StatField[];
    value?: {
        role?: string;
        statsJson: Record<string, any>;
        rating?: number;
        isMvp?: boolean;
    };
    onChange: (value: {
        role?: string;
        statsJson: Record<string, any>;
        rating?: number;
        isMvp?: boolean;
    }) => void;
}

export function PlayerStatsQuestion({
    roundNumber,
    roundName,
    playerName,
    playerAvatar,
    statFields,
    value,
    onChange,
}: PlayerStatsQuestionProps) {
    const [statsJson, setStatsJson] = useState<Record<string, any>>(value?.statsJson || {});
    const [isMvp, setIsMvp] = useState(value?.isMvp || false);

    useEffect(() => {
        if (value) {
            setStatsJson(value.statsJson);
            setIsMvp(value.isMvp || false);
        }
    }, [value]);

    useEffect(() => {
        // Auto-update parent whenever stats change
        onChange({
            role: statsJson.role,
            statsJson,
            rating: calculateAutoRating(),
            isMvp,
        });
    }, [statsJson, isMvp]);

    const handleStatChange = (key: string, val: any) => {
        setStatsJson((prev) => ({
            ...prev,
            [key]: val,
        }));
    };

    // Auto-calculate rating based on KDA (if applicable)
    const calculateAutoRating = (): number | undefined => {
        const kills = parseInt(statsJson.kills) || 0;
        const deaths = parseInt(statsJson.deaths) || 0;
        const assists = parseInt(statsJson.assists) || 0;

        if (kills === 0 && deaths === 0 && assists === 0) {
            return undefined;
        }

        // Simple rating formula: scale KDA to 0-10
        const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths;
        const rating = Math.min(10, Math.max(0, kda * 2)); // Scale and cap at 10
        return Math.round(rating * 10) / 10; // Round to 1 decimal
    };

    const kda = statsJson.kills !== undefined && statsJson.deaths !== undefined && statsJson.assists !== undefined
        ? calculateKDA(
            parseInt(statsJson.kills) || 0,
            parseInt(statsJson.deaths) || 0,
            parseInt(statsJson.assists) || 0
        )
        : null;

    const rating = calculateAutoRating();

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Player Header */}
            <Card className="border-2 border-primary/20">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {playerAvatar ? (
                                <img
                                    src={playerAvatar}
                                    alt={playerName}
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-primary">
                                        {playerName[0]?.toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div>
                                <CardTitle className="text-2xl">{playerName}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Round {roundNumber} - {roundName}
                                </p>
                            </div>
                        </div>

                        {/* MVP Toggle */}
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="mvp"
                                checked={isMvp}
                                onCheckedChange={(checked) => setIsMvp(checked as boolean)}
                            />
                            <Label
                                htmlFor="mvp"
                                className="text-sm font-medium cursor-pointer flex items-center gap-2"
                            >
                                <Star className={`h-4 w-4 ${isMvp ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                                MVP
                            </Label>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Stats Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key} className="text-sm font-medium">
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>

                        {field.type === 'number' && (
                            <Input
                                id={field.key}
                                type="number"
                                min={field.min}
                                max={field.max}
                                value={statsJson[field.key] || ""}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                    handleStatChange(field.key, value);
                                }}
                                placeholder={field.placeholder || "0"}
                                className="h-12 text-lg"
                            />
                        )}

                        {field.type === 'text' && (
                            <Input
                                id={field.key}
                                type="text"
                                value={statsJson[field.key] || ""}
                                onChange={(e) => handleStatChange(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="h-12 text-lg"
                            />
                        )}

                        {field.type === 'select' && field.options && (
                            <Select
                                value={statsJson[field.key] || ""}
                                onValueChange={(val) => handleStatChange(field.key, val)}
                            >
                                <SelectTrigger className="h-12 text-lg">
                                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {field.options.map((option) => (
                                        <SelectItem key={option} value={option} className="text-base">
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                ))}
            </div>

            {/* Live Stats Summary */}
            {kda !== null && (
                <Card className="bg-muted/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Performance Summary</p>
                                <div className="flex items-center gap-4">
                                    <Badge variant="secondary" className="text-base px-3 py-1">
                                        KDA: {kda}
                                    </Badge>
                                    {rating !== undefined && (
                                        <Badge variant="outline" className="text-base px-3 py-1 flex items-center gap-1">
                                            <TrendingUp className="h-4 w-4" />
                                            Rating: {rating.toFixed(1)}/10
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Helpful hints */}
            <div className="text-xs text-muted-foreground space-y-1">
                <p>💡 Tip: Required fields are marked with *</p>
                <p>⭐ Check MVP if this player was the standout performer</p>
            </div>
        </div>
    );
}
