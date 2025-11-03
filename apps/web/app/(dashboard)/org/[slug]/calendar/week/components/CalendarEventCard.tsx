"use client";

import { GameLogo } from "@/components/events/GameLogo";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/hooks/events";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Radio, User } from "lucide-react";

interface CalendarEventCardProps {
    event: Event;
    onClick?: () => void;
    productionLeads?: Array<{ id: string; name: string }>;
}

const eventTypeColors = {
    Broadcast: "bg-purple-500 border-purple-600 hover:bg-purple-600",
    Tournament: "bg-orange-500 border-orange-600 hover:bg-orange-600",
    Showmatch: "bg-pink-500 border-pink-600 hover:bg-pink-600",
    Rehearsal: "bg-yellow-500 border-yellow-600 hover:bg-yellow-600",
    Other: "bg-gray-500 border-gray-600 hover:bg-gray-600",
} as const;

export function CalendarEventCard({ event, onClick, productionLeads = [] }: CalendarEventCardProps) {
    // Convert UTC times to local timezone
    // new Date() automatically converts UTC string to local Date object
    const localStartTime = new Date(event.startAt);
    const localEndTime = new Date(event.endAt);

    const startTime = format(localStartTime, "HH:mm");
    const endTime = format(localEndTime, "HH:mm");

    const getProductionLeadName = (id?: string) => {
        if (!id) return null;
        const lead = productionLeads.find(l => l.id === id);
        return lead?.name || null;
    };

    const productionLeadName = getProductionLeadName(event.productionLead);
    const eventTypeColor = eventTypeColors[event.eventType as keyof typeof eventTypeColors] || eventTypeColors.Other;

    // Parse broadcast channels
    const channels = event.broadcastChannel?.split(',').map(c => c.trim()).filter(Boolean) || [];

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-2 rounded-md border-l-4 cursor-pointer transition-all duration-200 shadow-sm",
                "hover:shadow-md hover:scale-[1.02]",
                "bg-card text-card-foreground",
                eventTypeColor
            )}
            title={`${event.title} (${startTime} - ${endTime})`}
        >
            {/* Event Title */}
            <div className="font-semibold text-sm text-white line-clamp-1 mb-1">
                {event.title}
            </div>

            {/* Time Range */}
            <div className="text-xs text-white/90 mb-2">
                {startTime} - {endTime}
            </div>

            {/* Game Logo (if available) */}
            {event.gameTitle && (
                <div className="mb-2">
                    <GameLogo gameName={event.gameTitle} size="sm" showName={false} />
                </div>
            )}

            {/* Production Lead */}
            {productionLeadName && (
                <div className="flex items-center gap-1 text-xs text-white/80 mb-1">
                    <User className="h-3 w-3" />
                    <span className="line-clamp-1">{productionLeadName}</span>
                </div>
            )}

            {/* Broadcast Platforms */}
            {channels.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                    <Radio className="h-3 w-3 text-white/80" />
                    {channels.slice(0, 2).map((channel, idx) => (
                        <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[10px] px-1 py-0 h-4 bg-white/20 text-white border-white/30"
                        >
                            {channel}
                        </Badge>
                    ))}
                    {channels.length > 2 && (
                        <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0 h-4 bg-white/20 text-white border-white/30"
                        >
                            +{channels.length - 2}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
