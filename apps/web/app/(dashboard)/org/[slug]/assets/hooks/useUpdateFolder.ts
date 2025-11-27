import { getApiUrl } from '@/lib/api/config';
import type { AssetFolder, UpdateFolderDto } from '@/types/asset';
import { useMutation } from '@tanstack/react-query';

export function useUpdateFolder(orgSlug: string, folderId: string) {
    return useMutation({
        mutationFn: async (data: UpdateFolderDto) => {
            const url = getApiUrl(`/org/${orgSlug}/assets/folders/${folderId}`);
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to update folder' }));
                throw new Error(error.message || 'Failed to update folder');
            }

            return response.json() as Promise<AssetFolder>;
        },
    });
}
