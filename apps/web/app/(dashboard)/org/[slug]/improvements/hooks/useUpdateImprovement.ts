import { getApiUrl } from '@/lib/api/config';
import type { ImprovementEntry, UpdateImprovementDto } from '@/types/improvement';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateImprovement(orgSlug: string, improvementId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateImprovementDto): Promise<ImprovementEntry> => {
            const url = getApiUrl(`/org/${orgSlug}/improvements/${improvementId}`);
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update improvement');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['improvements', orgSlug] });
            queryClient.invalidateQueries({ queryKey: ['improvement', orgSlug, improvementId] });
        },
    });
}
