// Improvement Types
export type ImprovementCategory =
    | 'stream_production'
    | 'broadcast_technical'
    | 'event_operations'
    | 'communication'
    | 'content_quality'
    | 'viewer_experience'
    | 'equipment'
    | 'process'
    | 'social_media';

export type ImprovementPriority = 'low' | 'medium' | 'high';

export type ImprovementStatus = 'proposed' | 'accepted' | 'in_progress' | 'implemented' | 'dismissed';

export type ImpactLevel = 'viewer_facing' | 'internal' | 'minimal';

export type PlatformType = 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'linkedin';

export interface ImprovementEntry {
    id: string;
    tenantId: string;

    // Core fields
    title: string;
    description?: string | null;
    category: ImprovementCategory;
    priority: ImprovementPriority;
    status: ImprovementStatus;

    // Context linking
    eventId?: string | null;
    matchId?: string | null;

    // VOD/Media references
    vodUrl?: string | null;
    vodTimestamp?: string | null;
    screenshotUrl?: string | null;

    // Improvement tracking
    whatWentWrong?: string | null;
    rootCause?: string | null;
    proposedSolution?: string | null;
    actualSolution?: string | null;
    preventionSteps?: string | null;

    // Social media specific
    platformType?: PlatformType | null;
    postUrl?: string | null;
    engagementMetrics?: string | null; // JSON string

    // Assignment & ownership
    reportedBy: string;
    assignedTo?: string | null;
    implementedBy?: string | null;

    // Metadata
    tags?: string | null;
    impactLevel?: ImpactLevel | null;

    // Dates
    occurredAt?: string | null;
    implementedAt?: string | null;
    createdAt: string;
    updatedAt: string;

    // Relations
    event?: {
        id: string;
        title: string;
        startAt: string;
    };
    match?: {
        id: string;
        title?: string;
    };
    reporter?: {
        id: string;
        displayName: string;
        email: string;
    };
    assignee?: {
        id: string;
        displayName: string;
        email: string;
    };
    implementer?: {
        id: string;
        displayName: string;
        email: string;
    };
}

export interface ImprovementComment {
    id: string;
    improvementId: string;
    userId: string;
    comment: string;
    createdAt: string;
    updatedAt: string;

    user?: {
        id: string;
        displayName: string;
        email: string;
    };
}

export interface ImprovementSummary {
    total: number;
    proposed: number;
    accepted: number;
    inProgress: number;
    implemented: number;
    byCategory: Record<ImprovementCategory, number>;
    byPriority: Record<ImprovementPriority, number>;
}

export interface ImprovementListResponse {
    improvements: ImprovementEntry[];
    total: number;
    page: number;
    limit: number;
}

export interface CreateImprovementDto {
    title: string;
    description?: string;
    category: ImprovementCategory;
    priority?: ImprovementPriority;
    eventId?: string;
    matchId?: string;
    vodUrl?: string;
    vodTimestamp?: string;
    screenshotUrl?: string;
    whatWentWrong?: string;
    rootCause?: string;
    proposedSolution?: string;
    platformType?: PlatformType;
    postUrl?: string;
    engagementMetrics?: string;
    assignedTo?: string;
    tags?: string;
    impactLevel?: ImpactLevel;
    occurredAt?: string;
}

export interface UpdateImprovementDto {
    title?: string;
    description?: string;
    category?: ImprovementCategory;
    priority?: ImprovementPriority;
    status?: ImprovementStatus;
    eventId?: string;
    matchId?: string;
    vodUrl?: string;
    vodTimestamp?: string;
    screenshotUrl?: string;
    whatWentWrong?: string;
    rootCause?: string;
    proposedSolution?: string;
    actualSolution?: string;
    preventionSteps?: string;
    platformType?: PlatformType;
    postUrl?: string;
    engagementMetrics?: string;
    assignedTo?: string;
    implementedBy?: string;
    tags?: string;
    impactLevel?: ImpactLevel;
    occurredAt?: string;
    implementedAt?: string;
}
