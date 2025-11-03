import { useApiMutation } from "@/lib/api/query";
import { useQueryClient } from "@tanstack/react-query";

interface UpdatePlayerSettingsDto {
    statsVisible?: boolean;
}

interface PlayerSettingsResponse {
    id: string;
    gamerTag: string;
    statsVisible: boolean;
}

export function useUpdatePlayerSettings(slug: string, playerId: string) {
    const queryClient = useQueryClient();

    return useApiMutation<PlayerSettingsResponse, UpdatePlayerSettingsDto>(
        `/org/${slug}/players/${playerId}/settings`,
        {
            method: 'PATCH',
            apiOptions: {
                credentials: 'include',
                slug: slug,
            },
            onSuccess: () => {
                // Invalidate player queries to refresh the data
                queryClient.invalidateQueries({ queryKey: [`/org/${slug}/players/${playerId}`] });
                queryClient.invalidateQueries({ queryKey: [`/org/${slug}/players`] });
            },
        }
    );
}
