import { apiPost } from "@/lib/api/client";
import type { CreateRunsheetTemplateDto, RunsheetTemplate } from "@/types/runsheet-template-full";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateRunsheetTemplate(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateRunsheetTemplateDto) =>
            apiPost<RunsheetTemplate>(`/org/${slug}/runsheet-templates-full`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheet-templates', slug] });
        },
    });
}
