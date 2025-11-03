import { apiPost } from '@/lib/api/client';
import type { Runsheet } from '@/types/runsheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useLockRunsheet(slug: string, runsheetId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            return apiPost<Runsheet>(`/org/${slug}/runsheets/${runsheetId}/lock`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheet', slug, runsheetId] });
            queryClient.invalidateQueries({ queryKey: ['runsheets', slug] });
        },
    });
}
