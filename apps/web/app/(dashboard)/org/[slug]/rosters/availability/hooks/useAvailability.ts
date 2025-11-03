import { apiGet } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

interface AvailabilityRecord {
    id: string;
    playerId: string;
    date: string;
    status: "available" | "unsure" | "unavailable";
    note?: string;
    player: {
        id: string;
        gamerTag: string;
        role?: string;
    };
}

export function useAvailability(slug: string, date: string, teamId?: string) {
    return useQuery<AvailabilityRecord[]>({
        queryKey: [`/org/${slug}/players/availability`, date, teamId],
        queryFn: async () => {
            const params = new URLSearchParams({ date });
            if (teamId) params.append("teamId", teamId);
            return apiGet(`/org/${slug}/players/availability?${params}`, { slug });
        },
        enabled: !!slug && !!date,
    });
}
