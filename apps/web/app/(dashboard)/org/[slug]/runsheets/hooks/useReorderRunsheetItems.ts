import { apiPut } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ReorderItemsDto {
    itemIds: string[];
}

export function useReorderRunsheetItems(slug: string, runsheetId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ReorderItemsDto) => {
            return apiPut(`/org/${slug}/runsheets/${runsheetId}/items/reorder`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheet', slug, runsheetId] });
        },
    });
}
