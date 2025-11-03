import { getApiUrl } from '@/lib/api/config';
import type { Asset } from '@/types/asset';
import { useQuery } from '@tanstack/react-query';

export function useAsset(orgSlug: string, assetId: string) {
    return useQuery({
        queryKey: ['asset', orgSlug, assetId],
        queryFn: async () => {
            const url = getApiUrl(`/org/${orgSlug}/assets/${assetId}`);
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) throw new Error('Failed to fetch asset');

            return response.json() as Promise<Asset>;
        },
        enabled: !!assetId,
    });
}
