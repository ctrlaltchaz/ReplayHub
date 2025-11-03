// Event types based on the API schema
export type EventType = 'Broadcast' | 'Tournament' | 'Showmatch' | 'Rehearsal' | 'Other';
export type EventStatus = 'scheduled' | 'cancelled' | 'completed';

export interface Event {
    id: string;
    title: string;
    eventType?: EventType;
    gameTitle?: string;
    productionLead?: string;
    productionLeadName?: string;
    broadcastChannel?: string;
    startAt: string;
    callTime?: string;
    endAt: string;
    duration?: number;
    location?: string;
    teamId?: string;
    lineupId?: string;
    // Tournament-specific fields
    opponent?: string;
    tournamentName?: string;
    tournamentStage?: string;
    bestOf?: number;
    graphicsPackage?: string;
    checklistId?: string;
    rosterId?: string;
    notes?: string;
    status: EventStatus;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEventData {
    title: string;
    eventType?: EventType;
    gameTitle?: string;
    productionLead?: string;
    broadcastChannel?: string;
    startAt: string;
    callTime?: string;
    endAt: string;
    duration?: number;
    location?: string;
    teamId?: string;
    lineupId?: string;
    // Tournament-specific fields
    opponent?: string;
    tournamentName?: string;
    tournamentStage?: string;
    bestOf?: number;
    graphicsPackage?: string;
    checklistId?: string;
    rosterId?: string;
    notes?: string;
    status?: EventStatus;
}

export interface EventsQueryParams {
    from?: string;
    to?: string;
    teamId?: string;
    eventType?: EventType;
    gameTitle?: string;
    productionLead?: string;
    q?: string;
    status?: EventStatus;
    page?: number;
    limit?: number;
}