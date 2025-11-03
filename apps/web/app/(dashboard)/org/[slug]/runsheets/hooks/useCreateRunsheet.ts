import { apiPost } from '@/lib/api/client';
import type { CreateRunsheetDto, Runsheet } from '@/types/runsheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateRunsheet(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateRunsheetDto) => {
            return apiPost<Runsheet>(`/org/${slug}/runsheets`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheets', slug] });
        },
    });
}
