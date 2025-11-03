import { apiPut } from '@/lib/api';
import { UpdateRunsheetTemplateDto } from '@/types/runsheet-template-full';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateRunsheetTemplate(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateRunsheetTemplateDto }) =>
            apiPut(`/org/${slug}/runsheet-templates-full/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheet-templates', slug] });
        },
    });
}
