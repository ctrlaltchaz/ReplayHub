import { getApiUrl } from '@/lib/api/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteChecklist(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (checklistId: string) => {
            const response = await fetch(
                getApiUrl(`/org/${orgSlug}/checklists/${checklistId}`),
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete checklist');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate checklists query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['checklists', orgSlug] });
        },
    });
}
