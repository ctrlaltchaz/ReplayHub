import { getApiUrl } from '@/lib/api/config';
import type { ChecklistTaskQuery, ChecklistTaskResponse } from '@/types/checklist';
import { useQuery } from '@tanstack/react-query';

export function useMyChecklistTasks(orgSlug?: string, query?: ChecklistTaskQuery) {
    return useQuery<ChecklistTaskResponse>({
        queryKey: ['my-checklist-tasks', orgSlug, query],
        enabled: Boolean(orgSlug),
        queryFn: async () => {
            if (!orgSlug) {
                return { data: [], pagination: { hasMore: false, nextCursor: null } };
            }

            const params = new URLSearchParams();
            if (query?.status) params.set('status', query.status);
            if (query?.priority) params.set('priority', query.priority);
            if (query?.dueBefore) params.set('dueBefore', query.dueBefore);
            if (query?.dueAfter) params.set('dueAfter', query.dueAfter);
            if (query?.search) params.set('search', query.search);
            if (query?.cursor) params.set('cursor', query.cursor);
            if (query?.limit) params.set('limit', query.limit.toString());

            const url = getApiUrl(
                `/org/${orgSlug}/checklists/tasks/my${params.toString() ? `?${params.toString()}` : ''}`,
            );
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) {
                throw new Error('Failed to fetch assigned tasks');
            }

            return response.json();
        },
        staleTime: 15_000,
    });
}
