import { getApiUrl } from '@/lib/api/config';
import type { Checklist, ChecklistCompletedItem } from '@/types/checklist';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateChecklistItems(orgSlug: string, checklistId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (completedItems: ChecklistCompletedItem[]) => {
            const response = await fetch(getApiUrl(`/org/${orgSlug}/checklists/${checklistId}/completed-items`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ completedItems }),
            });

            if (!response.ok) {
                throw new Error('Failed to update checklist progress');
            }

            return response.json() as Promise<Checklist>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklists', orgSlug] });
            queryClient.invalidateQueries({ queryKey: ['checklist', orgSlug, checklistId] });
            queryClient.invalidateQueries({ queryKey: ['my-checklist-tasks', orgSlug] });
        },
    });
}
