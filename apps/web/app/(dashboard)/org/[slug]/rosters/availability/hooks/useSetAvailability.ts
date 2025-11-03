import { apiPost } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SetAvailabilityDto {
    date: string;
    status: "available" | "unsure" | "unavailable";
    note?: string;
}

export function useSetAvailability(slug: string, playerId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: SetAvailabilityDto) => {
            return apiPost(`/org/${slug}/players/${playerId}/availability`, data, { slug });
        },
        onSuccess: (_, variables) => {
            // Invalidate availability queries for this date
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/players/availability`, variables.date],
            });
            // Also invalidate the player detail
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/players/${playerId}`],
            });
        },
    });
}
