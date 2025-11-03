import { getApiUrl } from '@/lib/api/config';
import type { Checklist, CreateChecklistDto } from '@/types/checklist';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateChecklist(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateChecklistDto) => {
            const response = await fetch(getApiUrl(`/org/${orgSlug}/checklists`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to create checklist');

            return response.json() as Promise<Checklist>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklists', orgSlug] });
        },
    });
}
