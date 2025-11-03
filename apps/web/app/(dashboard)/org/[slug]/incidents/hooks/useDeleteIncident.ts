import { getApiUrl } from '@/lib/api/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteIncident(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (incidentId: string): Promise<void> => {
            const url = getApiUrl(`/org/${orgSlug}/incidents/${incidentId}`);
            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete incident');
            }
        },
        onSuccess: () => {
            // Invalidate incidents list and summary
            queryClient.invalidateQueries({ queryKey: ['incidents', orgSlug] });
            queryClient.invalidateQueries({ queryKey: ['incident-summary', orgSlug] });
        },
    });
}
