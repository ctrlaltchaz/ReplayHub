import { getApiUrl } from '@/lib/api/config';
import { useMutation } from '@tanstack/react-query';

export function useDeleteFolder(orgSlug: string) {
    return useMutation({
        mutationFn: async (folderId: string) => {
            const url = getApiUrl(`/org/${orgSlug}/assets/folders/${folderId}`);
            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to delete folder' }));
                throw new Error(error.message || 'Failed to delete folder');
            }

            return response.json();
        },
    });
}
