import { getApiUrl } from '@/lib/api/config';
import type { IncidentListResponse, QueryIncidentsParams } from '@/types/incident';
import { useQuery } from '@tanstack/react-query';

export function useIncidents(orgSlug: string, params: QueryIncidentsParams = {}) {
    return useQuery({
        queryKey: ['incidents', orgSlug, params],
        queryFn: async (): Promise<IncidentListResponse> => {
            const searchParams = new URLSearchParams();

            if (params.q) searchParams.append('q', params.q);
            if (params.category) searchParams.append('category', params.category);
            if (params.severity) searchParams.append('severity', params.severity);
            if (params.status) searchParams.append('status', params.status);
            if (params.from) searchParams.append('from', params.from);
            if (params.to) searchParams.append('to', params.to);
            if (params.eventId) searchParams.append('eventId', params.eventId);
            if (params.page) searchParams.append('page', params.page.toString());
            if (params.limit) searchParams.append('limit', params.limit.toString());

            const url = getApiUrl(`/org/${orgSlug}/incidents?${searchParams.toString()}`);
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch incidents');
            }

            return response.json();
        },
    });
}
