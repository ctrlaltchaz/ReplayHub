import { apiPut } from '@/lib/api/client';
import type { Runsheet, UpdateRunsheetDto } from '@/types/runsheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateRunsheet(slug: string, runsheetId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateRunsheetDto) => {
            return apiPut<Runsheet>(`/org/${slug}/runsheets/${runsheetId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheet', slug, runsheetId] });
            queryClient.invalidateQueries({ queryKey: ['runsheets', slug] });
        },
    });
}
