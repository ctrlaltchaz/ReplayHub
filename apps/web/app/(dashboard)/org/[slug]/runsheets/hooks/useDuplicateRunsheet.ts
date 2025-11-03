import { apiPost } from '@/lib/api/client';
import type { Runsheet } from '@/types/runsheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDuplicateRunsheet(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (runsheetId: string) => {
            return apiPost<Runsheet>(`/org/${slug}/runsheets/${runsheetId}/duplicate`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheets', slug] });
        },
    });
}
