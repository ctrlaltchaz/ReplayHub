// Incident Types
export type IncidentCategory = 'tech' | 'comms' | 'people' | 'safety' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed';

export interface Incident {
    id: string;
    tenantId: string;
    eventId?: string | null;
    category: IncidentCategory;
    severity: IncidentSeverity;
    title: string;
    description?: string | null;
    ownerId?: string | null;
    status: IncidentStatus;
    tags?: string | null;
    rcaJson?: any;
    createdBy: string;
    createdAt: string;
    updatedAt: string;

    // Relations
    event?: {
        id: string;
        title: string;
        startAt: string;
    };
    owner?: {
        id: string;
        displayName: string;
        email: string;
    };
    createdByUser?: {
        id: string;
        displayName: string;
        email: string;
    };
}

export interface IncidentSummary {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    critical: number;
}

export interface IncidentListResponse {
    incidents: Incident[];
    total: number;
    page: number;
    totalPages: number;
}

export interface QueryIncidentsParams {
    q?: string;
    category?: IncidentCategory;
    severity?: IncidentSeverity;
    status?: IncidentStatus;
    from?: string;
    to?: string;
    eventId?: string;
    page?: number;
    limit?: number;
}

export interface CreateIncidentDto {
    eventId?: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
    title: string;
    description?: string;
    ownerId?: string;
    tags?: string;
}

export interface UpdateIncidentDto {
    title?: string;
    description?: string;
    ownerId?: string;
    status?: IncidentStatus;
    tags?: string;
    rcaJson?: any;
}
