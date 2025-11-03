import { getApiUrl } from '@/lib/api/config';
import type { ChecklistQueryDto } from '@/types/checklist';
import { useQuery } from '@tanstack/react-query';

export function useChecklists(orgSlug: string, query?: ChecklistQueryDto) {
    return useQuery({
        queryKey: ['checklists', orgSlug, query],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (query?.eventId) params.append('eventId', query.eventId);
            if (query?.status) params.append('status', query.status);
            if (query?.assigneeId) params.append('assigneeId', query.assigneeId);
            if (query?.limit) params.append('limit', query.limit.toString());
            if (query?.cursor) params.append('cursor', query.cursor);

            const url = getApiUrl(`/org/${orgSlug}/checklists${params.toString() ? `?${params.toString()}` : ''}`);
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) throw new Error('Failed to fetch checklists');

            const result = await response.json();
            return result.data || result;
        },
    });
}
