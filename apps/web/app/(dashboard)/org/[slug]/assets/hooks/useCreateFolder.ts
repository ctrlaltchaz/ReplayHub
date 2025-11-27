import { getApiUrl } from '@/lib/api/config';
import type { AssetFolder, CreateFolderDto } from '@/types/asset';
import { useMutation } from '@tanstack/react-query';

export function useCreateFolder(orgSlug: string) {
    return useMutation({
        mutationFn: async (data: CreateFolderDto) => {
            const url = getApiUrl(`/org/${orgSlug}/assets/folders`);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to create folder' }));
                throw new Error(error.message || 'Failed to create folder');
            }

            return response.json() as Promise<AssetFolder>;
        },
    });
}
