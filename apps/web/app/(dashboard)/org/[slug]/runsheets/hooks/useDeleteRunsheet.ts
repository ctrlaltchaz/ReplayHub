import { apiDelete } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteRunsheet(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (runsheetId: string) => {
            return apiDelete(`/org/${slug}/runsheets/${runsheetId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheets', slug] });
        },
    });
}
