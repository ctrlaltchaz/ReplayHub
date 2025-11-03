import { getApiUrl } from '@/lib/api/config';
import type { Asset } from '@/types/asset';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useRejectAsset(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (assetId: string): Promise<Asset> => {
            const url = getApiUrl(`/org/${orgSlug}/assets/${assetId}/reject`);
            const response = await fetch(url, {
                method: 'PUT',
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to reject asset');
            }

            return response.json();
        },
        onSuccess: (data) => {
            // Update cache for single asset
            queryClient.setQueryData(['asset', orgSlug, data.id], data);
            // Invalidate assets list
            queryClient.invalidateQueries({ queryKey: ['assets', orgSlug] });
        },
    });
}
