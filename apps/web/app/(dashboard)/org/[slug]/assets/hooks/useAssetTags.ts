import { getApiUrl } from '@/lib/api/config';
import { useQuery } from '@tanstack/react-query';

interface AssetTag {
    tag: string;
    count: number;
}

interface AssetTagsResponse {
    tags: AssetTag[];
}

export function useAssetTags(orgSlug: string) {
    return useQuery({
        queryKey: ['asset-tags', orgSlug],
        queryFn: async (): Promise<AssetTagsResponse> => {
            const url = getApiUrl(`/org/${orgSlug}/assets/tags`);
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch asset tags');
            }

            return response.json();
        },
    });
}
