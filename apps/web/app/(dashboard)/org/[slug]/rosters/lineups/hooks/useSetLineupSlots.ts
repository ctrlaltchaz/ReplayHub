import { apiPost } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LineupSlotDto {
    playerId: string;
    role?: string;
    isSub?: boolean;
    notes?: string;
    idx?: number;
}

interface SetLineupslotsDto {
    slots: LineupSlotDto[];
    autoAttachMissing?: boolean;
}

export function useSetLineupSlots(slug: string, lineupId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: SetLineupslotsDto) => {
            return apiPost(`/org/${slug}/lineups/${lineupId}/slots`, data, { slug });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/lineups/${lineupId}`],
            });
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/lineups`],
            });
        },
    });
}
