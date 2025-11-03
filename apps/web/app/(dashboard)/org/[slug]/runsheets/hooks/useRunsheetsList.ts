import { apiGet } from '@/lib/api/client';
import type { RunsheetQueryDto, RunsheetsListResponse } from '@/types/runsheet';
import { useQuery } from '@tanstack/react-query';

export function useRunsheetsList(slug: string, filters?: RunsheetQueryDto) {
    return useQuery({
        queryKey: ['runsheets', slug, filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.eventId) params.append('eventId', filters.eventId);
            if (filters?.status) params.append('status', filters.status);
            if (filters?.limit) params.append('limit', filters.limit.toString());
            if (filters?.cursor) params.append('cursor', filters.cursor);

            const queryString = params.toString();
            const url = `/org/${slug}/runsheets${queryString ? `?${queryString}` : ''}`;

            return apiGet<RunsheetsListResponse>(url);
        },
        enabled: !!slug,
    });
}
