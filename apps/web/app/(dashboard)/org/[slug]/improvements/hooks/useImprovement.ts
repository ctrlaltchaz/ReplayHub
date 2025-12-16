import { getApiUrl } from '@/lib/api/config';
import type { ImprovementEntry } from '@/types/improvement';
import { useQuery } from '@tanstack/react-query';

export function useImprovement(orgSlug: string, improvementId: string | undefined) {
    return useQuery({
        queryKey: ['improvement', orgSlug, improvementId],
        queryFn: async (): Promise<ImprovementEntry> => {
            if (!improvementId) throw new Error('Improvement ID is required');

            const url = getApiUrl(`/org/${orgSlug}/improvements/${improvementId}`);
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch improvement');
            }

            return response.json();
        },
        enabled: !!improvementId,
    });
}
