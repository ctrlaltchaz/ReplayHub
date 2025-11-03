import { apiPut } from '@/lib/api/client';
import type { RunsheetItem, UpdateRunsheetItemDto } from '@/types/runsheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateRunsheetItem(slug: string, runsheetId: string, itemId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateRunsheetItemDto) => {
            return apiPut<RunsheetItem>(`/org/${slug}/runsheets/${runsheetId}/items/${itemId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheet', slug, runsheetId] });
        },
    });
}
