"use client";

import { apiDelete } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteRunsheetItemTemplate(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return apiDelete(`/org/${slug}/runsheet-templates/${id}`, { slug });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheet-templates', slug] });
        },
    });
}
