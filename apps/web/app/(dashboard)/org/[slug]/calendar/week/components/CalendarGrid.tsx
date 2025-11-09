"use client";

import type { Event } from "@/hooks/events";
import { addDays, format, isSameDay } from "date-fns";
import { useState } from "react";
import { CalendarEventCard } from "./CalendarEventCard";
import { MultipleEventsDialog } from "./MultipleEventsDialog";

interface CalendarGridProps {
    startDate: Date;
    events: Event[];
    onEventClick: (event: Event) => void;
    productionLeads?: Array<{ id: string; name: string }>;
    isLoading?: boolean;
}

const timeSlots = Array.from({ length: 16 }, (_, i) => i + 8); // 08:00 to 23:00

export function CalendarGrid({ startDate, events, onEventClick, productionLeads = [], isLoading }: CalendarGridProps) {
    // State for multiple events dialog
    const [multipleEventsDialogOpen, setMultipleEventsDialogOpen] = useState(false);
    const [selectedTimeSlotEvents, setSelectedTimeSlotEvents] = useState<Event[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

    // Generate 7 days starting from startDate
    const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    // Helper function to convert UTC event time to local time
    const getLocalTime = (utcTimeString: string) => {
        // new Date() automatically converts UTC string to local Date object
        return new Date(utcTimeString);
    };

    // Group events by day
    const eventsByDay = days.map(day => ({
        date: day,
        events: events.filter(event => {
            const localTime = getLocalTime(event.startAt);
            return isSameDay(localTime, day);
        }).sort((a, b) =>
            getLocalTime(a.startAt).getTime() - getLocalTime(b.startAt).getTime()
        ),
    }));

    // Helper function to group events by time slot (hour:minute)
    const groupEventsByTime = (dayEvents: Event[]) => {
        const grouped = new Map<string, Event[]>();

        dayEvents.forEach(event => {
            const eventStart = getLocalTime(event.startAt);
            const timeKey = `${String(eventStart.getHours()).padStart(2, '0')}:${String(eventStart.getMinutes()).padStart(2, '0')}`;

            if (!grouped.has(timeKey)) {
                grouped.set(timeKey, []);
            }
            grouped.get(timeKey)!.push(event);
        });

        return grouped;
    };

    // Handle showing multiple events dialog
    const handleMultipleEventsClick = (events: Event[], timeSlot: string) => {
        setSelectedTimeSlotEvents(events);
        setSelectedTimeSlot(timeSlot);
        setMultipleEventsDialogOpen(true);
    };

    if (isLoading) {
        return <CalendarGridSkeleton />;
    }

    return (
        <div className="flex-1 overflow-auto">
            {/* Desktop Grid View */}
            <div className="hidden lg:block">
                <div className="grid grid-cols-8 border-b sticky top-0 bg-card z-10">
                    {/* Time column header */}
                    <div className="border-r p-2 text-center font-semibold text-sm">
                        Time
                    </div>
                    {/* Day headers */}
                    {days.map((day, idx) => (
                        <div
                            key={idx}
                            className="border-r p-2 text-center"
                        >
                            <div className="font-semibold text-sm">
                                {format(day, 'EEE')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {format(day, 'MMM d')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Time slots grid */}
                <div className="grid grid-cols-8">
                    {/* Time labels column */}
                    <div className="border-r">
                        {timeSlots.map(hour => (
                            <div
                                key={hour}
                                className="border-b h-20 p-2 text-xs text-muted-foreground text-right"
                            >
                                {String(hour).padStart(2, '0')}:00
                            </div>
                        ))}
                    </div>

                    {/* Event columns */}
                    {eventsByDay.map(({ date, events: dayEvents }, dayIdx) => (
                        <div key={dayIdx} className="border-r relative">
                            {/* Time slot backgrounds */}
                            {timeSlots.map(hour => (
                                <div
                                    key={hour}
                                    className="border-b h-20 hover:bg-accent/5"
                                />
                            ))}

                            {/* Events overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                                {(() => {
                                    const groupedEvents = groupEventsByTime(dayEvents);
                                    const renderedSlots = new Set<string>();

                                    return Array.from(groupedEvents.entries()).map(([timeKey, timeSlotEvents]) => {
                                        if (renderedSlots.has(timeKey)) return null;
                                        renderedSlots.add(timeKey);

                                        // Use first event for positioning
                                        const firstEvent = timeSlotEvents[0];
                                        const eventStart = getLocalTime(firstEvent.startAt);
                                        const eventEnd = getLocalTime(firstEvent.endAt);
                                        const startHour = eventStart.getHours();
                                        const startMinute = eventStart.getMinutes();
                                        const endHour = eventEnd.getHours();
                                        const endMinute = eventEnd.getMinutes();

                                        // Calculate position (each hour = 80px, first slot is 08:00)
                                        const topOffset = ((startHour - 8) + startMinute / 60) * 80;
                                        const duration = (endHour - startHour) + (endMinute - startMinute) / 60;
                                        const height = duration * 80;

                                        // If multiple events at same time, show placeholder
                                        if (timeSlotEvents.length > 1) {
                                            return (
                                                <div
                                                    key={timeKey}
                                                    className="absolute left-1 right-1 pointer-events-auto"
                                                    style={{
                                                        top: `${topOffset}px`,
                                                        height: `${Math.max(height, 40)}px`
                                                    }}
                                                >
                                                    <div
                                                        onClick={() => handleMultipleEventsClick(timeSlotEvents, timeKey)}
                                                        className="p-2 rounded-md border-l-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] bg-blue-500 border-blue-600 hover:bg-blue-600 h-full flex flex-col justify-center"
                                                    >
                                                        <div className="font-semibold text-sm text-white line-clamp-1">
                                                            Multiple events planned
                                                        </div>
                                                        <div className="text-xs text-white/90">
                                                            {timeSlotEvents.length} events at {timeKey}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Single event - render normally
                                        return (
                                            <div
                                                key={firstEvent.id}
                                                className="absolute left-1 right-1 pointer-events-auto"
                                                style={{
                                                    top: `${topOffset}px`,
                                                    height: `${Math.max(height, 40)}px`
                                                }}
                                            >
                                                <CalendarEventCard
                                                    event={firstEvent}
                                                    onClick={() => onEventClick(firstEvent)}
                                                    productionLeads={productionLeads}
                                                />
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile List View */}
            <div className="lg:hidden space-y-4 p-4">
                {eventsByDay.map(({ date, events: dayEvents }) => {
                    const groupedEvents = groupEventsByTime(dayEvents);

                    return (
                        <div key={date.toISOString()} className="space-y-2">
                            <div className="flex items-center gap-2 sticky top-0 bg-background py-2">
                                <div className="font-semibold">
                                    {format(date, 'EEEE')}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {format(date, 'MMMM d, yyyy')}
                                </div>
                            </div>

                            {dayEvents.length === 0 ? (
                                <div className="text-sm text-muted-foreground italic p-4 border rounded-lg">
                                    No events scheduled
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {Array.from(groupedEvents.entries()).map(([timeKey, timeSlotEvents]) => {
                                        if (timeSlotEvents.length > 1) {
                                            return (
                                                <div
                                                    key={timeKey}
                                                    onClick={() => handleMultipleEventsClick(timeSlotEvents, timeKey)}
                                                    className="p-3 rounded-md border-l-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md bg-blue-500 border-blue-600 hover:bg-blue-600"
                                                >
                                                    <div className="font-semibold text-sm text-white">
                                                        Multiple events planned
                                                    </div>
                                                    <div className="text-xs text-white/90 mt-1">
                                                        {timeSlotEvents.length} events at {timeKey}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <CalendarEventCard
                                                key={timeSlotEvents[0].id}
                                                event={timeSlotEvents[0]}
                                                onClick={() => onEventClick(timeSlotEvents[0])}
                                                productionLeads={productionLeads}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Multiple Events Dialog */}
            <MultipleEventsDialog
                open={multipleEventsDialogOpen}
                onOpenChange={setMultipleEventsDialogOpen}
                events={selectedTimeSlotEvents}
                timeSlot={selectedTimeSlot}
                productionLeads={productionLeads}
                onEventClick={onEventClick}
            />
        </div>
    );
}

function CalendarGridSkeleton() {
    return (
        <div className="flex-1 p-4">
            <div className="animate-pulse space-y-4">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded-lg" />
                ))}
            </div>
        </div>
    );
}
