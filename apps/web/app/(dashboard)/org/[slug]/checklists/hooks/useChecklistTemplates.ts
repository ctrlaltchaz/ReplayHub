import { getApiUrl } from '@/lib/api/config';
import type { ChecklistTemplateQueryDto } from '@/types/checklist';
import { useQuery } from '@tanstack/react-query';

export function useChecklistTemplates(orgSlug: string, query?: ChecklistTemplateQueryDto) {
    return useQuery({
        queryKey: ['checklist-templates', orgSlug, query],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (query?.scope) params.append('scope', query.scope);
            if (query?.limit) params.append('limit', query.limit.toString());
            if (query?.cursor) params.append('cursor', query.cursor);

            const url = getApiUrl(`/org/${orgSlug}/checklist-templates${params.toString() ? `?${params.toString()}` : ''}`);
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) throw new Error('Failed to fetch templates');

            const result = await response.json();
            return result.data || result;
        },
    });
}
