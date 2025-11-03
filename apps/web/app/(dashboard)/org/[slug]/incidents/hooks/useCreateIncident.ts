import { getApiUrl } from '@/lib/api/config';
import type { CreateIncidentDto, Incident } from '@/types/incident';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateIncident(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateIncidentDto): Promise<Incident> => {
            const url = getApiUrl(`/org/${orgSlug}/incidents`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create incident');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate incidents list and summary
            queryClient.invalidateQueries({ queryKey: ['incidents', orgSlug] });
            queryClient.invalidateQueries({ queryKey: ['incident-summary', orgSlug] });
        },
    });
}
