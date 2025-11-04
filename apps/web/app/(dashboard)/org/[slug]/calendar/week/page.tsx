"use client";

import { EventDetailsDrawer } from "@/components/events/EventDetailsDrawer";
import { useAuth } from "@/context/AuthContext";
import { Event } from "@/hooks/events";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { hasPermission, PERMISSIONS } from "@/lib/permissions/utils";
import { startOfWeek } from "date-fns";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CalendarGrid } from "./components/CalendarGrid";
import { CalendarToolbar } from "./components/CalendarToolbar";
import { useCalendarEvents } from "./hooks/useCalendarEvents";

export default function CalendarWeekPage() {
    usePageTitle('Calendar');

    const params = useParams();
    const slug = params?.slug as string;
    const { permissions } = useAuth();

    // Check if user can create events
    const canManageEvents = hasPermission(permissions, PERMISSIONS.EVENTS_CREATE);

    // Week navigation state - start from Monday of current week
    const [currentStartDate, setCurrentStartDate] = useState(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );

    // Filter state
    const [filters, setFilters] = useState<{
        eventType?: string;
        gameTitle?: string;
        productionLead?: string;
    }>({});

    // Fetch calendar events
    const { data: events = [], isLoading, error } = useCalendarEvents(slug, {
        startDate: currentStartDate,
        days: 7,
        eventType: filters.eventType,
        gameTitle: filters.gameTitle,
        productionLead: filters.productionLead,
    });

    // Extract unique production leads from events for filter dropdown
    const uniqueLeadsMap = new Map<string, string>();
    events.forEach((event) => {
        if (event.productionLead) {
            uniqueLeadsMap.set(event.productionLead, event.productionLead);
        }
    });
    const productionLeads = Array.from(uniqueLeadsMap, ([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));

    // Selected event for drawer
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    // Handle week navigation
    const handleWeekChange = (newStartDate: Date) => {
        setCurrentStartDate(newStartDate);
    };

    // Handle filter changes
    const handleFiltersChange = (newFilters: {
        eventType?: string;
        gameTitle?: string;
        productionLead?: string;
    }) => {
        setFilters(newFilters);
    };

    // Handle event card click
    const handleEventClick = (event: Event) => {
        setSelectedEventId(event.id);
    };

    return (
        <div className="flex flex-col h-full">
            <CalendarToolbar
                currentStartDate={currentStartDate}
                onWeekChange={handleWeekChange}
                onFiltersChange={handleFiltersChange}
                filters={filters}
                productionLeads={productionLeads}
                canCreateEvents={canManageEvents}
                slug={slug}
            />

            <div className="flex-1 overflow-auto">
                {error ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-2">
                            <p className="text-destructive font-medium">
                                Failed to load calendar events
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {error instanceof Error
                                    ? error.message
                                    : "An unexpected error occurred"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <CalendarGrid
                        events={events}
                        startDate={currentStartDate}
                        isLoading={isLoading}
                        onEventClick={handleEventClick}
                    />
                )}
            </div>

            {/* Event Details Drawer */}
            <EventDetailsDrawer
                slug={slug}
                eventId={selectedEventId || undefined}
                open={!!selectedEventId}
                onOpenChange={(open) => {
                    if (!open) setSelectedEventId(null);
                }}
                canEdit={canManageEvents}
            />
        </div>
    );
}
