import { getApiUrl } from '@/lib/api/config';
import type { IncidentSummary } from '@/types/incident';
import { useQuery } from '@tanstack/react-query';

export function useIncidentSummary(orgSlug: string) {
    return useQuery({
        queryKey: ['incident-summary', orgSlug],
        queryFn: async (): Promise<IncidentSummary> => {
            const url = getApiUrl(`/org/${orgSlug}/incidents/summary`);
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch incident summary');
            }

            return response.json();
        },
    });
}
