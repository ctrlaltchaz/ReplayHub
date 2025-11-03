import { getApiUrl } from '@/lib/api/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteAsset(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (assetId: string) => {
            const url = getApiUrl(`/org/${orgSlug}/assets/${assetId}`);
            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete asset');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate assets list to refresh after deletion
            queryClient.invalidateQueries({ queryKey: ['assets', orgSlug] });
        },
    });
}
