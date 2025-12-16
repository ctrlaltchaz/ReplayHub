import { getApiUrl } from '@/lib/api/config';
import type {
    ImpactLevel,
    ImprovementCategory,
    ImprovementListResponse,
    ImprovementPriority,
    ImprovementStatus
} from '@/types/improvement';
import { useQuery } from '@tanstack/react-query';

export interface QueryImprovementsParams {
    q?: string;
    category?: ImprovementCategory;
    priority?: ImprovementPriority;
    status?: ImprovementStatus;
    impactLevel?: ImpactLevel;
    from?: string;
    to?: string;
    eventId?: string;
    matchId?: string;
    reportedBy?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
}

export function useImprovements(orgSlug: string, params: QueryImprovementsParams = {}) {
    return useQuery({
        queryKey: ['improvements', orgSlug, params],
        queryFn: async (): Promise<ImprovementListResponse> => {
            const searchParams = new URLSearchParams();

            if (params.q) searchParams.append('q', params.q);
            if (params.category) searchParams.append('category', params.category);
            if (params.priority) searchParams.append('priority', params.priority);
            if (params.status) searchParams.append('status', params.status);
            if (params.impactLevel) searchParams.append('impactLevel', params.impactLevel);
            if (params.from) searchParams.append('from', params.from);
            if (params.to) searchParams.append('to', params.to);
            if (params.eventId) searchParams.append('eventId', params.eventId);
            if (params.matchId) searchParams.append('matchId', params.matchId);
            if (params.reportedBy) searchParams.append('reportedBy', params.reportedBy);
            if (params.assignedTo) searchParams.append('assignedTo', params.assignedTo);
            if (params.page) searchParams.append('page', params.page.toString());
            if (params.limit) searchParams.append('limit', params.limit.toString());

            const url = getApiUrl(`/org/${orgSlug}/improvements?${searchParams.toString()}`);
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch improvements');
            }

            return response.json();
        },
    });
}
