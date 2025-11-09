"use client";

import type { EventType } from "@/hooks/events/types";
import { Calendar, Filter, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

interface EventsToolbarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    eventType?: EventType;
    onEventTypeChange: (value: EventType | undefined) => void;
    gameTitle?: string;
    onGameTitleChange: (value: string | undefined) => void;
    productionLead?: string;
    onProductionLeadChange: (value: string | undefined) => void;
    teamId?: string;
    onTeamChange: (value: string | undefined) => void;
    showCompleted: boolean;
    onShowCompletedChange: (value: boolean) => void;
    dateRange: {
        from?: string;
        to?: string;
    };
    onDateRangeChange: (range: { from?: string; to?: string }) => void;
    onCreateEvent: () => void;
    canCreateEvents?: boolean;
    productionLeads?: Array<{ id: string; name: string }>;
    teams?: Array<{ id: string; name: string; game: string }>;
}

const EVENT_TYPES: Array<{ value: EventType; label: string }> = [
    { value: "Broadcast", label: "Broadcast" },
    { value: "Tournament", label: "Tournament" },
    { value: "Showmatch", label: "Showmatch" },
    { value: "Rehearsal", label: "Rehearsal" },
    { value: "Other", label: "Other" },
];

const COMMON_GAMES = [
    "Valorant",
    "Overwatch 2",
    "Rocket League",
    "League of Legends",
    "Counter-Strike 2",
    "Apex Legends",
    "Fortnite",
];

export function EventsToolbar({
    searchValue,
    onSearchChange,
    eventType,
    onEventTypeChange,
    gameTitle,
    onGameTitleChange,
    productionLead,
    onProductionLeadChange,
    teamId,
    onTeamChange,
    showCompleted,
    onShowCompletedChange,
    dateRange,
    onDateRangeChange,
    onCreateEvent,
    canCreateEvents = true,
    productionLeads = [],
    teams = [],
}: EventsToolbarProps) {
    const [searchTerm, setSearchTerm] = useState(searchValue);

    // Sync internal state with prop
    useEffect(() => {
        setSearchTerm(searchValue);
    }, [searchValue]);

    // Debounce search input
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearchChange(searchTerm);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, onSearchChange]);

    // Get current week dates for default range
    const getCurrentWeekRange = () => {
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Get Monday

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6); // Get Sunday

        return {
            from: monday.toISOString().split("T")[0],
            to: sunday.toISOString().split("T")[0],
        };
    };

    const handleThisWeek = () => {
        const weekRange = getCurrentWeekRange();
        onDateRangeChange(weekRange);
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        onSearchChange("");
        onEventTypeChange(undefined);
        onGameTitleChange(undefined);
        onProductionLeadChange(undefined);
        onTeamChange(undefined);
        onDateRangeChange({ from: undefined, to: undefined });
    };

    const hasActiveFilters =
        searchValue ||
        eventType ||
        gameTitle ||
        productionLead ||
        teamId ||
        dateRange.from ||
        dateRange.to;

    return (
        <div className="space-y-4">
            {/* Primary Actions Row */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search events by title, game, or notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        aria-label="Search events"
                    />
                </div>

                {canCreateEvents && (
                    <Button onClick={onCreateEvent} size="default">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                    </Button>
                )}
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">Filters:</span>
                </div>

                {/* Event Type Filter */}
                <Select
                    value={eventType || "_all"}
                    onValueChange={(value) =>
                        onEventTypeChange(value === "_all" ? undefined : (value as EventType))
                    }
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">All Types</SelectItem>
                        {EVENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Game Title Filter */}
                <Select
                    value={gameTitle || "_all"}
                    onValueChange={(value) =>
                        onGameTitleChange(value === "_all" ? undefined : value)
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Game Title" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">All Games</SelectItem>
                        {COMMON_GAMES.map((game) => (
                            <SelectItem key={game} value={game}>
                                {game}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Production Lead Filter */}
                {productionLeads.length > 0 && (
                    <Select
                        value={productionLead || "_all"}
                        onValueChange={(value) =>
                            onProductionLeadChange(value === "_all" ? undefined : value)
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Production Lead" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_all">All Producers</SelectItem>
                            {productionLeads.map((lead) => (
                                <SelectItem key={lead.id} value={lead.id}>
                                    {lead.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {/* Team Filter */}
                {teams.length > 0 && (
                    <Select
                        value={teamId || "_all"}
                        onValueChange={(value) =>
                            onTeamChange(value === "_all" ? undefined : value)
                        }
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Team" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_all">All Teams</SelectItem>
                            {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                    {team.name} ({team.game})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleThisWeek}
                    className="shrink-0"
                >
                    <Calendar className="h-4 w-4 mr-2" />
                    This Week
                </Button>

                {/* Show Completed Events Toggle */}
                <div className="flex items-center gap-2 px-3 py-1.5 border rounded-md bg-background shrink-0">
                    <Switch
                        id="show-completed"
                        checked={showCompleted}
                        onCheckedChange={onShowCompletedChange}
                    />
                    <Label htmlFor="show-completed" className="text-sm cursor-pointer">
                        Show Completed
                    </Label>
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="shrink-0"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>
                )}
            </div>
        </div>
    );
}