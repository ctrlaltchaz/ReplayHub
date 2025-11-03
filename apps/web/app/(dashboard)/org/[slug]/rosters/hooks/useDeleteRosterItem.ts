import { useApiMutation } from "@/lib/api/query";
import { useQueryClient } from "@tanstack/react-query";

export function useDeleteRosterItem(slug: string, type: 'team' | 'player') {
    const queryClient = useQueryClient();

    return {
        deleteItem: (id: string) => {
            const endpoint = type === 'team' ? 'teams' : 'players';

            return useApiMutation<void, void>(`/org/${slug}/${endpoint}/${id}`, {
                method: 'DELETE',
                apiOptions: {
                    credentials: 'include',
                    slug: slug,
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: [`/org/${slug}/${endpoint}`] });
                },
            });
        },
    };
}
