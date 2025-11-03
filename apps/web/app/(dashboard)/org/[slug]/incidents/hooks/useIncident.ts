import { getApiUrl } from '@/lib/api/config';
import type { Incident } from '@/types/incident';
import { useQuery } from '@tanstack/react-query';

export function useIncident(orgSlug: string, incidentId: string | undefined) {
    return useQuery({
        queryKey: ['incident', orgSlug, incidentId],
        queryFn: async (): Promise<Incident> => {
            if (!incidentId) {
                throw new Error('Incident ID is required');
            }

            const url = getApiUrl(`/org/${orgSlug}/incidents/${incidentId}`);
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch incident');
            }

            return response.json();
        },
        enabled: !!incidentId,
    });
}
