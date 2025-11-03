import { apiDelete } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteRunsheetItem(slug: string, runsheetId: string, itemId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            return apiDelete(`/org/${slug}/runsheets/${runsheetId}/items/${itemId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheet', slug, runsheetId] });
        },
    });
}
