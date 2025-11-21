"use client";

import { GameLogo } from "@/components/events/GameLogo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import type { Event } from "@/hooks/events";
import { PERMISSIONS } from "@/lib/permissions/utils";
import { apiGet } from "@/lib/api/client";
import type { Player } from "@/types/roster";
import { format, formatDistanceToNow, isFuture } from "date-fns";
import { Calendar, Clock, MapPin, Radio, Trophy, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface NextEventWidgetProps {
  slug: string;
}

const eventTypeIcons = {
  Tournament: Trophy,
  Broadcast: Radio,
  Showmatch: Zap,
  Rehearsal: Calendar,
  Other: Calendar,
} as const;

const eventTypeColors = {
  Tournament: "bg-orange-500 text-white",
  Broadcast: "bg-purple-500 text-white",
  Showmatch: "bg-pink-500 text-white",
  Rehearsal: "bg-yellow-500 text-white",
  Other: "bg-gray-500 text-white",
} as const;

export function NextEventWidget({ slug }: NextEventWidgetProps) {
  const { orgUser, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [playerInfo, setPlayerInfo] = useState<Player | null>(null);

  useEffect(() => {
    const fetchNextEvent = async () => {
      if (!orgUser) {
        setLoading(false);
        return;
      }

      // Skip fetching if the user doesn't have access to players or events.
      // This prevents 401s that trigger login redirects for limited-permission roles.
      const canViewPlayers = hasPermission(PERMISSIONS.PLAYERS_VIEW);
      const canViewEvents =
        hasPermission(PERMISSIONS.EVENTS_VIEW) || hasPermission(PERMISSIONS.CALENDAR_VIEW);
      if (!canViewPlayers || !canViewEvents) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Find player associated with this user
        const players = await apiGet<Player[]>(`/org/${slug}/players?active=true`);
        const currentPlayer = players.find((p) => p.orgUserId === orgUser.id);

        if (!currentPlayer || !currentPlayer.teams?.length) {
          setLoading(false);
          return;
        }

        setPlayerInfo(currentPlayer);

        // 2. Get team IDs for this player
        const teamIds = currentPlayer.teams.map((tm) => tm.teamId);
        console.log("[NextEventWidget] Player teams:", teamIds);

        // 3. Fetch all events (not just upcoming status, as we'll filter by date)
        const events = await apiGet<Event[]>(`/org/${slug}/events`);
        console.log("[NextEventWidget] Total events fetched:", events.length);

        // 4. Filter events that are in the future (regardless of teamId for now, or match player's teams)
        const now = new Date();
        const relevantEvents = events.filter((event) => {
          const eventStart = new Date(event.startAt);

          // Must be in the future
          if (!isFuture(eventStart)) return false;

          // If event has a teamId, check if it matches one of player's teams
          // If no teamId, include it (could be org-wide event)
          if (event.teamId) {
            return teamIds.includes(event.teamId);
          }

          // Include events without teamId (org-wide events)
          return true;
        });

        console.log("[NextEventWidget] Relevant future events:", relevantEvents.length);
        if (relevantEvents.length > 0) {
          console.log("[NextEventWidget] First event:", relevantEvents[0]);
        }

        // 5. Sort by start time and get the next one
        if (relevantEvents.length > 0) {
          const sorted = relevantEvents.sort(
            (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
          );
          setNextEvent(sorted[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch next event:", error);
        setLoading(false);
      }
    };

    fetchNextEvent();
  }, [orgUser, slug, hasPermission]);

  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Calendar className="h-5 w-5 text-primary" />
            Your Next Event
          </CardTitle>
          <CardDescription>Loading your schedule...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orgUser) {
    return null;
  }

  if (!playerInfo) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Calendar className="h-5 w-5 text-primary" />
            Your Next Event
          </CardTitle>
          <CardDescription>No player profile associated with your account</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ask an admin to create a player profile and link it to your account to see your upcoming
            events.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!playerInfo.teams?.length) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Calendar className="h-5 w-5 text-primary" />
            Your Next Event
          </CardTitle>
          <CardDescription>Not currently assigned to any teams</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Join a team to see your upcoming events and tournaments!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!nextEvent) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Calendar className="h-5 w-5 text-primary" />
            Your Next Event
          </CardTitle>
          <CardDescription>No upcoming events scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You're currently on {playerInfo.teams.length} team
            {playerInfo.teams.length !== 1 ? "s" : ""}, but no events are scheduled yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const eventStart = new Date(nextEvent.startAt);
  const eventEnd = new Date(nextEvent.endAt);
  const EventIcon = eventTypeIcons[nextEvent.eventType as keyof typeof eventTypeIcons] || Calendar;
  const eventColorClass =
    eventTypeColors[nextEvent.eventType as keyof typeof eventTypeColors] || eventTypeColors.Other;

  // Determine the title based on event type
  const eventTypeLabel =
    nextEvent.eventType && nextEvent.eventType !== "Other" ? nextEvent.eventType : "Event";

  // Parse broadcast channels
  const channels =
    nextEvent.broadcastChannel
      ?.split(",")
      .map((c) => c.trim())
      .filter(Boolean) || [];

  return (
    <Card className="hover:shadow-lg transition-shadow border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-montserrat">
          <EventIcon className="h-5 w-5 text-primary" />
          Your Next {eventTypeLabel}
        </CardTitle>
        <CardDescription>{formatDistanceToNow(eventStart, { addSuffix: true })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Title */}
        <div>
          <h3 className="text-xl font-bold font-montserrat">{nextEvent.title}</h3>
          <Badge className={`mt-2 ${eventColorClass}`}>{nextEvent.eventType}</Badge>
        </div>

        {/* Game Logo */}
        {nextEvent.gameTitle && (
          <div className="flex items-center gap-2">
            <GameLogo gameName={nextEvent.gameTitle} size="md" />
          </div>
        )}

        {/* Date & Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{format(eventStart, "EEEE, MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(eventStart, "h:mm a")} - {format(eventEnd, "h:mm a")}
            </span>
          </div>
        </div>

        {/* Location */}
        {nextEvent.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{nextEvent.location}</span>
          </div>
        )}

        {/* Broadcast Channels */}
        {channels.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Radio className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {channels.map((channel, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {channel}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Production Lead */}
        {nextEvent.productionLead && nextEvent.productionLeadName && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Production Lead: {nextEvent.productionLeadName}</span>
          </div>
        )}

        {/* Tournament Details */}
        {nextEvent.eventType === "Tournament" && (
          <div className="space-y-2 pt-2 border-t">
            {nextEvent.opponent && (
              <div className="text-sm">
                <span className="text-muted-foreground">Opponent: </span>
                <span className="font-semibold">{nextEvent.opponent}</span>
              </div>
            )}
            {nextEvent.tournamentName && (
              <div className="text-sm">
                <span className="text-muted-foreground">Tournament: </span>
                <span className="font-semibold">{nextEvent.tournamentName}</span>
              </div>
            )}
            {nextEvent.tournamentStage && (
              <div className="text-sm">
                <span className="text-muted-foreground">Stage: </span>
                <span className="font-semibold">{nextEvent.tournamentStage}</span>
              </div>
            )}
            {nextEvent.bestOf && (
              <div className="text-sm">
                <span className="text-muted-foreground">Format: </span>
                <span className="font-semibold">Best of {nextEvent.bestOf}</span>
              </div>
            )}
          </div>
        )}

        {/* Call Time */}
        {nextEvent.callTime && (
          <div className="flex items-center gap-2 text-sm bg-primary/10 p-2 rounded-md">
            <Clock className="h-4 w-4 text-primary" />
            <span>
              <span className="font-semibold">Call Time:</span>{" "}
              {format(new Date(nextEvent.callTime), "h:mm a")}
            </span>
          </div>
        )}

        {/* Notes */}
        {nextEvent.notes && (
          <div className="text-sm p-3 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Notes:</p>
            <p className="text-sm">{nextEvent.notes}</p>
          </div>
        )}

        {/* Player Info */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Playing as <span className="font-semibold text-foreground">{playerInfo.gamerTag}</span>
            {playerInfo.teams && playerInfo.teams.length > 0 && playerInfo.teams[0].team && (
              <>
                {" "}
                on{" "}
                <span className="font-semibold text-foreground">
                  {playerInfo.teams[0].team.name}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Call to Action */}
        <a
          href={`/org/${slug}/events`}
          className="block text-center text-sm text-primary hover:underline font-medium"
        >
          View all events →
        </a>
      </CardContent>
    </Card>
  );
}
