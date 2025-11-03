"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

interface CalendarToolbarProps {
    currentStartDate: Date;
    onWeekChange: (newStartDate: Date) => void;
    onFiltersChange: (filters: {
        eventType?: string;
        gameTitle?: string;
        productionLead?: string;
    }) => void;
    filters: {
        eventType?: string;
        gameTitle?: string;
        productionLead?: string;
    };
    productionLeads?: Array<{ id: string; name: string }>;
    canCreateEvents?: boolean;
    slug: string;
}

const EVENT_TYPES = ['Broadcast', 'Tournament', 'Showmatch', 'Rehearsal', 'Other'];

export function CalendarToolbar({
    currentStartDate,
    onWeekChange,
    onFiltersChange,
    filters,
    productionLeads = [],
    canCreateEvents = false,
    slug,
}: CalendarToolbarProps) {
    const handlePreviousWeek = () => {
        onWeekChange(subWeeks(currentStartDate, 1));
    };

    const handleNextWeek = () => {
        onWeekChange(addWeeks(currentStartDate, 1));
    };

    const handleToday = () => {
        const today = new Date();
        const mondayOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
        onWeekChange(mondayOfThisWeek);
    };

    const weekEnd = addDays(currentStartDate, 6);
    const dateRangeText = `${format(currentStartDate, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

    return (
        <div className="border-b bg-card p-4 space-y-4">
            {/* Top row: Navigation and date range */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousWeek}
                        title="Previous week"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleToday}
                        className="gap-2"
                    >
                        <Calendar className="h-4 w-4" />
                        Today
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextWeek}
                        title="Next week"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <div className="ml-4 font-semibold text-lg">
                        {dateRangeText}
                    </div>
                </div>

                {canCreateEvents && (
                    <Link href={`/org/${slug}/events`}>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Event
                        </Button>
                    </Link>
                )}
            </div>

            {/* Bottom row: Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">
                    Filters:
                </span>

                {/* Event Type Filter */}
                <Select
                    value={filters.eventType || 'all'}
                    onValueChange={(value) =>
                        onFiltersChange({
                            ...filters,
                            eventType: value === 'all' ? undefined : value,
                        })
                    }
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {EVENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Production Lead Filter */}
                {productionLeads.length > 0 && (
                    <Select
                        value={filters.productionLead || 'all'}
                        onValueChange={(value) =>
                            onFiltersChange({
                                ...filters,
                                productionLead: value === 'all' ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Production Lead" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Producers</SelectItem>
                            {productionLeads.map((lead) => (
                                <SelectItem key={lead.id} value={lead.id}>
                                    {lead.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {/* Clear Filters */}
                {(filters.eventType || filters.productionLead) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFiltersChange({})}
                    >
                        Clear Filters
                    </Button>
                )}
            </div>
        </div>
    );
}
