import { apiGet } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

interface LineupSlot {
    id: string;
    playerId: string;
    role?: string;
    isSub: boolean;
    notes?: string;
    idx: number;
    player: {
        id: string;
        gamerTag: string;
        role?: string;
        rank?: string;
        eligibility?: string;
        mains?: string[];
    } | null;
}

interface LineupDetail {
    id: string;
    eventId: string;
    teamId: string;
    title?: string;
    published: boolean;
    createdAt: string;
    updatedAt: string;
    team: {
        id: string;
        name: string;
        game: string;
        season?: string;
    };
    slots: LineupSlot[];
}

export function useLineup(slug: string, lineupId: string) {
    return useQuery<LineupDetail>({
        queryKey: [`/org/${slug}/lineups/${lineupId}`],
        queryFn: () => apiGet(`/org/${slug}/lineups/${lineupId}`, { slug }),
        enabled: !!slug && !!lineupId,
    });
}
