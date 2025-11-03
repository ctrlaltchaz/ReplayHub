import { getApiUrl } from '@/lib/api/config';
import type { ChecklistScope, ChecklistTemplateItem } from '@/types/checklist';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateChecklistTemplateData {
    title: string;
    scope: ChecklistScope;
    itemsJson: ChecklistTemplateItem[];
}

export function useUpdateChecklistTemplate(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ templateId, data }: { templateId: string; data: UpdateChecklistTemplateData }) => {
            const response = await fetch(
                getApiUrl(`/org/${orgSlug}/checklist-templates/${templateId}`),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update template');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate both templates and individual template queries
            queryClient.invalidateQueries({ queryKey: ['checklist-templates', orgSlug] });
        },
    });
}
