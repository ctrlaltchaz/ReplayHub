import { getApiUrl } from '@/lib/api/config';
import type { AssetFolderWithContents } from '@/types/asset';
import { useQuery } from '@tanstack/react-query';

export function useAssetFolder(orgSlug: string, folderId: string | null | undefined) {
    return useQuery({
        queryKey: ['asset-folder', orgSlug, folderId],
        queryFn: async () => {
            if (!folderId) return null;

            const url = getApiUrl(`/org/${orgSlug}/assets/folders/${folderId}`);
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) throw new Error('Failed to fetch folder');

            return response.json() as Promise<AssetFolderWithContents>;
        },
        enabled: !!folderId,
    });
}
