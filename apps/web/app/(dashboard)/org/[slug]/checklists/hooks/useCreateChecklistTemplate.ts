import { getApiUrl } from '@/lib/api/config';
import type { ChecklistTemplate, CreateChecklistTemplateDto } from '@/types/checklist';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function parseErrorMessage(response: Response, fallback: string) {
    return response
        .clone()
        .json()
        .then((body) => {
            if (!body) return fallback;
            if (typeof body === 'string') return body;
            if (Array.isArray(body.message)) {
                return body.message.join(', ');
            }
            if (typeof body.message === 'string') {
                return body.message;
            }
            return fallback;
        })
        .catch(() => response.text().catch(() => fallback));
}

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

            if (!response.ok) {
                const message = await parseErrorMessage(response, 'Failed to create template');
                throw new Error(message);
            }

            return response.json() as Promise<ChecklistTemplate>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklist-templates', orgSlug] });
        },
    });
}
