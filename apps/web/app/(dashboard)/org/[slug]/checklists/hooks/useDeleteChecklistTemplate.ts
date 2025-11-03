import { getApiUrl } from '@/lib/api/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteChecklistTemplate(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (templateId: string) => {
            const response = await fetch(
                getApiUrl(`/org/${orgSlug}/checklist-templates/${templateId}`),
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete template');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate templates query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['checklist-templates', orgSlug] });
        },
    });
}
