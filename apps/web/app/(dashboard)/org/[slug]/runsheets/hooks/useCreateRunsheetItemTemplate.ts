"use client";

import { apiPost } from "@/lib/api/client";
import type { RunsheetTemplateItem } from "@/types/runsheet-template-full";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Temporary type until proper types are defined
type CreateRunsheetItemTemplateDto = Omit<RunsheetTemplateItem, 'id'>;

export function useCreateRunsheetItemTemplate(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateRunsheetItemTemplateDto) => {
            return apiPost<RunsheetTemplateItem>(
                `/org/${slug}/runsheet-templates`,
                data,
                { slug }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheet-templates', slug] });
        },
    });
}
