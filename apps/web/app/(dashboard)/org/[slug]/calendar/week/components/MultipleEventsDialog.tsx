"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Event } from "@/hooks/events";
import { format } from "date-fns";
import { CalendarEventCard } from "./CalendarEventCard";

interface MultipleEventsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    events: Event[];
    timeSlot: string;
    productionLeads?: Array<{ id: string; name: string }>;
    onEventClick: (event: Event) => void;
}

export function MultipleEventsDialog({
    open,
    onOpenChange,
    events,
    timeSlot,
    productionLeads = [],
    onEventClick,
}: MultipleEventsDialogProps) {
    // Get date from first event
    const date = events.length > 0 ? new Date(events[0].startAt) : new Date();

    const handleEventClick = (event: Event) => {
        onOpenChange(false);
        onEventClick(event);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Multiple Events - {timeSlot}</DialogTitle>
                    <DialogDescription>
                        {format(date, "EEEE, MMMM d, yyyy")} - {events.length} event{events.length !== 1 ? 's' : ''} scheduled
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-4">
                    {events.map(event => (
                        <CalendarEventCard
                            key={event.id}
                            event={event}
                            onClick={() => handleEventClick(event)}
                            productionLeads={productionLeads}
                        />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
