import { getApiUrl } from '@/lib/api/config';
import type { AssetVersion } from '@/types/asset';
import { useQuery } from '@tanstack/react-query';

interface AssetVersionsResponse {
    versions: AssetVersion[];
}

export function useAssetVersions(orgSlug: string, assetId: string) {
    return useQuery({
        queryKey: ['asset-versions', orgSlug, assetId],
        queryFn: async (): Promise<AssetVersionsResponse> => {
            const url = getApiUrl(`/org/${orgSlug}/assets/${assetId}/versions`);
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch asset versions');
            }

            return response.json();
        },
        enabled: !!assetId,
    });
}
