export interface Runsheet {
    id: string;
    tenantId: string;
    eventId?: string | null;
    title: string;
    status: 'draft' | 'approved' | 'locked';
    revision: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    items?: RunsheetItem[];
}

export interface RunsheetItem {
    id: string;
    tenantId: string;
    runsheetId: string;
    idx: number;
    title: string;
    type?: string | null;
    ownerId?: string | null;
    durationMs: number;
    location?: string | null;
    equipment?: string | null;
    priority?: 'low' | 'normal' | 'high' | 'critical' | null;
    notes?: string | null;
    attachmentsJson?: any[];
    createdAt: string;
}

// DTOs
export interface CreateRunsheetDto {
    title: string;
    eventId?: string;
}

export interface UpdateRunsheetDto {
    title?: string;
    status?: 'draft' | 'approved' | 'locked';
}

export interface CreateRunsheetItemDto {
    idx: number;
    title: string;
    type?: string;
    ownerId?: string;
    durationMs?: number;
    location?: string;
    equipment?: string;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    notes?: string;
    attachmentsJson?: any[];
}

export interface UpdateRunsheetItemDto {
    idx?: number;
    title?: string;
    type?: string;
    ownerId?: string;
    durationMs?: number;
    location?: string;
    equipment?: string;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    notes?: string;
    attachmentsJson?: any[];
}

export interface BulkCreateRunsheetItemsDto {
    items: CreateRunsheetItemDto[];
}

// Query params
export interface RunsheetQueryDto {
    eventId?: string;
    status?: 'draft' | 'approved' | 'locked';
    limit?: number;
    cursor?: string;
}

// API Response
export interface RunsheetsListResponse {
    data: Runsheet[];
    pagination: {
        hasMore: boolean;
        nextCursor: string | null;
    };
}
