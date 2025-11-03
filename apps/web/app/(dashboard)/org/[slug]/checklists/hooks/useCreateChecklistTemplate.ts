import { getApiUrl } from '@/lib/api/config';
import type { ChecklistTemplate, CreateChecklistTemplateDto } from '@/types/checklist';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateChecklistTemplate(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateChecklistTemplateDto) => {
            const response = await fetch(getApiUrl(`/org/${orgSlug}/checklist-templates`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to create template');

            return response.json() as Promise<ChecklistTemplate>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklist-templates', orgSlug] });
        },
    });
}
