"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Edit, Radio, Trash2, User } from "lucide-react";
import type { Event } from "../../hooks/events";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { GameLogo } from "./GameLogo";

interface EventsTableProps {
    events: Event[];
    isLoading?: boolean;
    onRowClick?: (_event: Event) => void;
    onEdit?: (_event: Event) => void;
    onDelete?: (_event: Event) => void;
    canManageEvents?: boolean;
    productionLeads?: Array<{ id: string; name: string }>;
}

const statusColors = {
    scheduled: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    cancelled: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400",
    completed: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400",
} as const;

const eventTypeColors = {
    Broadcast: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    Tournament: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    Showmatch: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
    Rehearsal: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
} as const;

export function EventsTable({
    events,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
    canManageEvents = false,
    productionLeads = []
}: EventsTableProps) {
    const formatDateTime = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            return {
                date: format(date, "MMM dd"),
                time: format(date, "HH:mm"),
            };
        } catch {
            return { date: "Invalid", time: "Date" };
        }
    };

    const getProductionLeadName = (id?: string) => {
        if (!id) return null;
        const lead = productionLeads.find(l => l.id === id);
        return lead?.name || "Unknown";
    };

    if (isLoading) {
        return <EventsTableSkeleton />;
    }

    if (events.length === 0) {
        return <EventsEmptyState />;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[250px]">Title</TableHead>
                        <TableHead className="w-[120px]">Game</TableHead>
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead className="w-[140px]">Opponent</TableHead>
                        <TableHead className="w-[140px]">Production Lead</TableHead>
                        <TableHead className="w-[140px]">Start Time</TableHead>
                        <TableHead className="w-[100px]">Duration</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="w-[140px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {events.map((event) => {
                        const start = formatDateTime(event.startAt);

                        return (
                            <TableRow
                                key={event.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => onRowClick?.(event)}
                            >
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium line-clamp-1">{event.title}</div>
                                        {event.broadcastChannel && (
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <Radio className="h-3 w-3 mr-1" />
                                                {event.broadcastChannel}
                                            </div>
                                        )}
                                        {event.runsheetTitle && (
                                            <div className="text-xs text-muted-foreground">
                                                Linked to runsheet {event.runsheetTitle}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <GameLogo gameName={event.gameTitle} size="sm" showName={true} />
                                </TableCell>
                                <TableCell>
                                    {event.eventType && (
                                        <Badge
                                            variant="secondary"
                                            className={eventTypeColors[event.eventType as keyof typeof eventTypeColors] || eventTypeColors.Other}
                                        >
                                            {event.eventType}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {event.opponent ? (
                                        <div className="flex items-center text-sm">
                                            <span className="line-clamp-1">{event.opponent}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">—</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {event.productionLead ? (
                                        <div className="flex items-center text-sm">
                                            <User className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="line-clamp-1">{getProductionLeadName(event.productionLead)}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm"></span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center text-sm">
                                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                        <div>
                                            <div>{start.date}</div>
                                            <div className="text-xs text-muted-foreground">{start.time}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {event.duration ? (
                                        <div className="flex items-center text-sm">
                                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                            {event.duration}m
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm"></span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={statusColors[event.status as keyof typeof statusColors]}
                                    >
                                        {event.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRowClick?.(event);
                                            }}
                                            title="View details"
                                        >
                                            View
                                        </Button>
                                        {canManageEvents && onEdit && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(event);
                                                }}
                                                title="Edit event"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canManageEvents && onDelete && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(event);
                                                }}
                                                title="Delete event"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

function EventsTableSkeleton() {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[250px]">Title</TableHead>
                        <TableHead className="w-[120px]">Game</TableHead>
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead className="w-[140px]">Opponent</TableHead>
                        <TableHead className="w-[140px]">Production Lead</TableHead>
                        <TableHead className="w-[140px]">Start Time</TableHead>
                        <TableHead className="w-[100px]">Duration</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="w-[140px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <div className="space-y-2">
                                    <div className="h-4 bg-muted animate-pulse rounded" />
                                    <div className="h-3 bg-muted animate-pulse rounded w-20" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="h-4 bg-muted animate-pulse rounded w-16" />
                            </TableCell>
                            <TableCell>
                                <div className="h-5 bg-muted animate-pulse rounded w-20" />
                            </TableCell>
                            <TableCell>
                                <div className="h-4 bg-muted animate-pulse rounded w-24" />
                            </TableCell>
                            <TableCell>
                                <div className="h-4 bg-muted animate-pulse rounded w-24" />
                            </TableCell>
                            <TableCell>
                                <div className="h-4 bg-muted animate-pulse rounded w-16" />
                            </TableCell>
                            <TableCell>
                                <div className="h-4 bg-muted animate-pulse rounded w-16" />
                            </TableCell>
                            <TableCell>
                                <div className="h-4 bg-muted animate-pulse rounded w-12" />
                            </TableCell>
                            <TableCell>
                                <div className="h-5 bg-muted animate-pulse rounded w-20" />
                            </TableCell>
                            <TableCell>
                                <div className="h-8 bg-muted animate-pulse rounded w-24" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function EventsEmptyState() {
    return (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
                Get started by creating your first event or adjust your filters
            </p>
        </div>
    );
}