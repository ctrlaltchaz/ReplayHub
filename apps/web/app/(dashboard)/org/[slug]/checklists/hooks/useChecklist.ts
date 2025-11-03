import { getApiUrl } from '@/lib/api/config';
import type { Checklist } from '@/types/checklist';
import { useQuery } from '@tanstack/react-query';

export function useChecklist(orgSlug: string, checklistId: string) {
    return useQuery({
        queryKey: ['checklist', orgSlug, checklistId],
        queryFn: async () => {
            const url = getApiUrl(`/org/${orgSlug}/checklists/${checklistId}`);
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) throw new Error('Failed to fetch checklist');

            return response.json() as Promise<Checklist>;
        },
        enabled: !!checklistId,
    });
}
