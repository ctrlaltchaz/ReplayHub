import { apiPost } from '@/lib/api/client';
import type { BulkCreateRunsheetItemsDto, RunsheetItem } from '@/types/runsheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useAddRunsheetItems(slug: string, runsheetId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: BulkCreateRunsheetItemsDto) => {
            return apiPost<RunsheetItem[]>(`/org/${slug}/runsheets/${runsheetId}/items`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheet', slug, runsheetId] });
        },
    });
}
