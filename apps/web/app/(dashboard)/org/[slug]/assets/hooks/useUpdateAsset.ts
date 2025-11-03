import { getApiUrl } from '@/lib/api/config';
import { Asset, UpdateAssetDto } from '@/types/asset';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateAssetParams {
    assetId: string;
    data: UpdateAssetDto;
}

export function useUpdateAsset(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ assetId, data }: UpdateAssetParams): Promise<Asset> => {
            const url = getApiUrl(`/org/${orgSlug}/assets/${assetId}`);
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update asset');
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
