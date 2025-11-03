import { apiPost } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateLineupDto {
    teamId: string;
    title?: string;
}

export function useCreateLineup(slug: string, eventId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateLineupDto) => {
            return apiPost(`/org/${slug}/events/${eventId}/lineup`, data, { slug });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/lineups`],
            });
        },
    });
}
