import { getApiUrl } from '@/lib/api/config';
import type { CreateImprovementDto, ImprovementEntry } from '@/types/improvement';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateImprovement(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateImprovementDto): Promise<ImprovementEntry> => {
            const url = getApiUrl(`/org/${orgSlug}/improvements`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create improvement');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['improvements', orgSlug] });
        },
    });
}
