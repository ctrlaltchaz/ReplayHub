import { getApiUrl } from '@/lib/api/config';
import type { Checklist, UpdateChecklistDto } from '@/types/checklist';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateChecklist(orgSlug: string, checklistId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateChecklistDto) => {
            const response = await fetch(getApiUrl(`/org/${orgSlug}/checklists/${checklistId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update checklist');

            return response.json() as Promise<Checklist>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklists', orgSlug] });
            queryClient.invalidateQueries({ queryKey: ['checklist', orgSlug, checklistId] });
        },
    });
}
