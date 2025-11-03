import { getApiUrl } from '@/lib/api/config';
import type { Incident, UpdateIncidentDto } from '@/types/incident';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateIncidentParams {
    incidentId: string;
    data: UpdateIncidentDto;
}

export function useUpdateIncident(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ incidentId, data }: UpdateIncidentParams): Promise<Incident> => {
            const url = getApiUrl(`/org/${orgSlug}/incidents/${incidentId}`);
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update incident');
            }

            return response.json();
        },
        onSuccess: (data) => {
            // Update cache for single incident
            queryClient.setQueryData(['incident', orgSlug, data.id], data);
            // Invalidate incidents list and summary
            queryClient.invalidateQueries({ queryKey: ['incidents', orgSlug] });
            queryClient.invalidateQueries({ queryKey: ['incident-summary', orgSlug] });
        },
    });
}
