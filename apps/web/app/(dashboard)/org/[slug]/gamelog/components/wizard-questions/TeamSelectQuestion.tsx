"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";
import Image from "next/image";
import { useTeamsList } from "../../../rosters/hooks/useTeamsList";

interface TeamSelectQuestionProps {
    organizationSlug: string;
    value?: string;
    onChange: (teamId: string) => void;
}

const GAMES = [
    { value: "Valorant", label: "Valorant", logo: "/logos/valorant.svg" },
    { value: "League of Legends", label: "League of Legends", logo: "/logos/lol.svg" },
    { value: "Counter-Strike 2", label: "Counter-Strike 2", logo: "/logos/cs2.svg" },
    { value: "Dota 2", label: "Dota 2", logo: "/logos/dota2.svg" },
    { value: "Overwatch", label: "Overwatch", logo: "/logos/overwatch.svg" },
    { value: "Rocket League", label: "Rocket League", logo: "/logos/rocketleague.svg" },
    { value: "Apex Legends", label: "Apex Legends", logo: "/logos/apex.svg" },
];

export function TeamSelectQuestion({ organizationSlug, value, onChange }: TeamSelectQuestionProps) {
    const { data: teams, isLoading } = useTeamsList(organizationSlug);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!teams || teams.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Teams Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        You need to create a team before logging matches.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Go to Rosters → Teams to create your first team.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-h-[500px] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => {
                    const gameLogo = GAMES.find((g) => g.value === team.game)?.logo;
                    const isSelected = value === team.id;

                    return (
                        <Card
                            key={team.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${isSelected
                                    ? "border-primary border-2 shadow-md"
                                    : "border-border hover:border-primary/50"
                                }`}
                            onClick={() => onChange(team.id)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    {/* Team Logo/Icon */}
                                    <div className="flex-shrink-0">
                                        {gameLogo ? (
                                            <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                                <Image
                                                    src={gameLogo}
                                                    alt={team.game || team.name}
                                                    width={48}
                                                    height={48}
                                                    className="object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-primary">
                                                    {team.name?.[0]?.toUpperCase() || "T"}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Team Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg mb-1 truncate">{team.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {team.game || "Unknown game"}
                                        </p>
                                        {team.season && (
                                            <p className="text-xs text-muted-foreground">
                                                Season: {team.season}
                                            </p>
                                        )}
                                    </div>

                                    {/* Selection Indicator */}
                                    {isSelected && (
                                        <div className="flex-shrink-0">
                                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                                <svg
                                                    className="h-4 w-4 text-primary-foreground"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path d="M5 13l4 4L19 7"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
