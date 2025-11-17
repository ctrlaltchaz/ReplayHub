"use client";

import { format, parseISO } from "date-fns";
import { Award, Calendar, Clock, Crown, ExternalLink, FileText, Flag, MapPin, Medal, Package, Radio, Trophy, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEvent } from "../../hooks/events";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { GameLogo } from "./GameLogo";
import { LineupDrawer } from "./LineupDrawer";

interface EventDetailsDrawerProps {
    slug: string;
    eventId?: string;
    open?: boolean;
    onOpenChange: (open: boolean) => void;
    productionLeads?: Array<{ id: string; name: string }>;
    onEdit?: () => void;
    canEdit?: boolean;
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

export function EventDetailsDrawer({
    slug,
    eventId,
    open = false,
    onOpenChange,
    productionLeads = [],
    onEdit,
    canEdit = false
}: EventDetailsDrawerProps) {
    const { data: event, isLoading, error } = useEvent(slug, eventId || '');
    const [lineupDrawerOpen, setLineupDrawerOpen] = useState(false);
    const router = useRouter();

    const formatDateTime = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            return {
                date: format(date, 'EEEE, MMMM do, yyyy'),
                time: format(date, 'h:mm a'),
                duration: date
            };
        } catch {
            return { date: 'Invalid Date', time: '', duration: null };
        }
    };

    const calculateDuration = (start: string, end: string) => {
        try {
            const startDate = parseISO(start);
            const endDate = parseISO(end);
            const diffMs = endDate.getTime() - startDate.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours < 1) {
                return `${Math.round(diffMs / (1000 * 60))} minutes`;
            }
            return `${diffHours.toFixed(1)} hours`;
        } catch {
            return 'Unknown duration';
        }
    };

    const handleViewCalendar = () => {
        // Navigate to calendar view for this week
        const startDate = event?.startAt ? new Date(event.startAt) : new Date();
        const monday = new Date(startDate);
        monday.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7)); // Get Monday

        const weekStart = monday.toISOString().split('T')[0];
        window.open(`/org/${slug}/calendar/week?start=${weekStart}`, '_blank');
    };

    const getProductionLeadName = (id?: string) => {
        if (!id) return null;
        const lead = productionLeads.find(l => l.id === id);
        return lead?.name || "Unknown";
    };

    if (isLoading) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="sm:max-w-[500px]">
                    <SheetHeader>
                        <SheetTitle>Loading Event...</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 mt-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    if (error || !event) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="sm:max-w-[500px]">
                    <SheetHeader>
                        <SheetTitle>Event Not Found</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                        <p className="text-muted-foreground">
                            {error ? 'Failed to load event details.' : 'Event not found.'}
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    const start = formatDateTime(event.startAt);
    const end = formatDateTime(event.endAt);
    const duration = event.duration || calculateDuration(event.startAt, event.endAt);
    const callTime = event.callTime ? formatDateTime(event.callTime) : null;

    const hasProductionInfo = event.gameTitle || event.productionLead || event.broadcastChannel || event.graphicsPackage;
    const hasTournamentInfo = (event.eventType === 'Tournament' || event.eventType === 'Showmatch' || event.eventType === 'Broadcast') &&
        (event.opponent || event.tournamentName || event.tournamentStage || event.bestOf);
    const hasLinkedData = event.rosterId || event.checklistId;

    const handleViewRunsheet = () => {
        if (event.runsheetId) {
            router.push(`/org/${slug}/runsheets/${event.runsheetId}`);
            onOpenChange(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[550px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-lg font-montserrat pr-6 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {event.title}
                    </SheetTitle>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Status and Type Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                            variant="secondary"
                            className={statusColors[event.status as keyof typeof statusColors]}
                        >
                            {event.status}
                        </Badge>
                        {event.eventType && (
                            <Badge
                                variant="secondary"
                                className={eventTypeColors[event.eventType as keyof typeof eventTypeColors] || eventTypeColors.Other}
                            >
                                {event.eventType}
                            </Badge>
                        )}
                    </div>

                    {/* Linked Runsheet */}
                    {event.runsheetTitle && (
                        <>
                            <div className="space-y-3">
                                <h3 className="text-sm font-montserrat font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Linked Runsheet
                                </h3>
                                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                                    <div>
                                        <div className="font-medium">{event.runsheetTitle}</div>
                                        <div className="text-xs text-muted-foreground">Click to view runsheet details</div>
                                    </div>
                                    <Button
                                        onClick={handleViewRunsheet}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        View
                                    </Button>
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Production Information */}
                    {hasProductionInfo && (
                        <>
                            <div className="space-y-3">
                                <h3 className="text-sm font-montserrat font-semibold flex items-center gap-2">
                                    <Radio className="h-4 w-4" />
                                    Production Details
                                </h3>

                                <div className="space-y-2 text-sm">
                                    {event.gameTitle && (
                                        <div className="flex items-start gap-2">
                                            <div className="mt-0.5">
                                                <GameLogo gameName={event.gameTitle} size="md" showName={false} />
                                            </div>
                                            <div>
                                                <div className="font-medium">Game</div>
                                                <div className="text-muted-foreground">{event.gameTitle}</div>
                                            </div>
                                        </div>
                                    )}

                                    {event.productionLead && (
                                        <div className="flex items-start gap-2">
                                            <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">Production Lead</div>
                                                <div className="text-muted-foreground">
                                                    {event.productionLeadName || getProductionLeadName(event.productionLead)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {event.broadcastChannel && (
                                        <div className="flex items-start gap-2">
                                            <Radio className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">Broadcast Channel</div>
                                                <div className="text-muted-foreground">{event.broadcastChannel}</div>
                                            </div>
                                        </div>
                                    )}

                                    {event.graphicsPackage && (
                                        <div className="flex items-start gap-2">
                                            <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">Graphics Package</div>
                                                <div className="text-muted-foreground">{event.graphicsPackage}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Tournament Information */}
                    {hasTournamentInfo && (
                        <>
                            <div className="space-y-3">
                                <h3 className="text-sm font-montserrat font-semibold flex items-center gap-2">
                                    <Trophy className="h-4 w-4" />
                                    Tournament Details
                                </h3>

                                {/* Match Card */}
                                {event.teamName && event.opponent && (
                                    <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-4 border">
                                        <div className="flex items-center justify-between gap-4">
                                            {/* Home Team */}
                                            <div className="flex-1 flex flex-col items-center gap-2">
                                                <div className="w-16 h-16 rounded-full bg-background border-2 flex items-center justify-center overflow-hidden">
                                                    {event.teamLogoUrl ? (
                                                        <img
                                                            src={event.teamLogoUrl}
                                                            alt={event.teamName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Users className="h-8 w-8 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-montserrat font-semibold text-sm">{event.teamName}</div>
                                                </div>
                                            </div>

                                            {/* VS Divider */}
                                            <div className="flex flex-col items-center gap-1 px-2">
                                                <div className="font-montserrat font-bold text-xl text-muted-foreground">VS</div>
                                                {event.bestOf && event.bestOf > 1 && (
                                                    <div className="text-xs text-muted-foreground">BO{event.bestOf}</div>
                                                )}
                                            </div>

                                            {/* Opponent Team */}
                                            <div className="flex-1 flex flex-col items-center gap-2">
                                                <div className="w-16 h-16 rounded-full bg-background border-2 flex items-center justify-center overflow-hidden">
                                                    <Users className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-montserrat font-semibold text-sm">{event.opponent}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 text-sm">
                                    {event.tournamentName && (
                                        <div className="bg-muted/30 rounded-lg p-3 border flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center flex-shrink-0">
                                                <Trophy className="h-5 w-5 text-amber-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs text-muted-foreground">Tournament</div>
                                                <div className="font-montserrat font-semibold">{event.tournamentName}</div>
                                            </div>
                                        </div>
                                    )}

                                    {event.tournamentStage && (
                                        <div className="bg-muted/30 rounded-lg p-3 border flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center flex-shrink-0">
                                                {event.tournamentStage === 'Finals' || event.tournamentStage === 'Grand Finals' ? (
                                                    <Crown className="h-5 w-5 text-yellow-500" />
                                                ) : event.tournamentStage === 'Semifinals' ? (
                                                    <Medal className="h-5 w-5 text-orange-500" />
                                                ) : event.tournamentStage === 'Quarterfinals' ? (
                                                    <Award className="h-5 w-5 text-blue-500" />
                                                ) : event.tournamentStage === 'Groups' ? (
                                                    <Users className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <Flag className="h-5 w-5 text-purple-500" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs text-muted-foreground">Stage</div>
                                                <div className="font-montserrat font-semibold">{event.tournamentStage}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Date & Time */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-montserrat font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Schedule
                        </h3>

                        <div className="space-y-3 text-sm">
                            {callTime && (
                                <div>
                                    <div className="font-medium">Call Time</div>
                                    <div className="text-muted-foreground">{callTime.date}</div>
                                    <div className="text-muted-foreground">{callTime.time}</div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="font-medium">Start</div>
                                    <div className="text-muted-foreground">{start.date}</div>
                                    <div className="text-muted-foreground">{start.time}</div>
                                </div>
                                <div>
                                    <div className="font-medium">End</div>
                                    <div className="text-muted-foreground">{end.date}</div>
                                    <div className="text-muted-foreground">{end.time}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Duration: {typeof duration === 'number' ? `${duration} minutes` : duration}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Location */}
                    {event.location && (
                        <>
                            <div className="space-y-3">
                                <h3 className="text-sm font-montserrat font-semibold flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Location
                                </h3>
                                <p className="text-sm">{event.location}</p>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Linked Data */}
                    {hasLinkedData && (
                        <>
                            <div className="space-y-3">
                                <h3 className="text-sm font-montserrat font-semibold">Linked Resources</h3>
                                <div className="space-y-2 text-sm">
                                    {event.rosterId && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Roster</span>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">{event.rosterId.slice(0, 8)}...</code>
                                        </div>
                                    )}
                                    {event.checklistId && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Checklist</span>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">{event.checklistId.slice(0, 8)}...</code>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Notes */}
                    {event.notes && (
                        <>
                            <div className="space-y-3">
                                <h3 className="text-sm font-montserrat font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Notes
                                </h3>
                                <p className="text-sm whitespace-pre-wrap">{event.notes}</p>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Team Information */}
                    {event.teamId && (
                        <>
                            <div className="space-y-3">
                                <h3 className="text-sm font-montserrat font-semibold flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Team
                                </h3>
                                <p className="text-sm">
                                    {event.teamName || 'Team event'}
                                </p>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Metadata */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-montserrat font-semibold">Event Details</h3>
                        <div className="text-xs text-muted-foreground space-y-1">
                            <div>Created: {format(parseISO(event.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}</div>
                            <div>Updated: {format(parseISO(event.updatedAt), 'MMM dd, yyyy \'at\' h:mm a')}</div>
                            <div>ID: {event.id}</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-4">
                        {canEdit && (
                            <>
                                <Button
                                    onClick={() => setLineupDrawerOpen(true)}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    {event.lineupId ? 'Edit Lineup' : 'Assign Lineup'}
                                </Button>
                                {onEdit && (
                                    <Button
                                        onClick={onEdit}
                                        className="w-full"
                                    >
                                        Edit Event
                                    </Button>
                                )}
                            </>
                        )}
                        <Button
                            onClick={handleViewCalendar}
                            variant="outline"
                            className="w-full"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View in Calendar
                        </Button>
                    </div>
                </div>
            </SheetContent>


            {/* Lineup Assignment Drawer */}
            <LineupDrawer
                open={lineupDrawerOpen}
                onOpenChange={setLineupDrawerOpen}
                eventId={event.id}
                eventTitle={event.title}
                teamId={event.teamId}
                currentLineupId={event.lineupId}
                slug={slug}
            />
        </Sheet>
    );
}
