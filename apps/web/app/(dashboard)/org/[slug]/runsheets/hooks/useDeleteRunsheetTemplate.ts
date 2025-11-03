import { apiDelete } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteRunsheetTemplate(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            apiDelete(`/org/${slug}/runsheet-templates-full/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['runsheet-templates-full', slug] });
        },
    });
}
