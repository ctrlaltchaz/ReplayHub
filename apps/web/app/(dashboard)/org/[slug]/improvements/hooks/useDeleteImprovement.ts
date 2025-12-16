import { getApiUrl } from '@/lib/api/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteImprovement(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (improvementId: string): Promise<void> => {
            const url = getApiUrl(`/org/${orgSlug}/improvements/${improvementId}`);
            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete improvement');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['improvements', orgSlug] });
        },
    });
}
