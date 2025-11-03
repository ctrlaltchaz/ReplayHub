import { getApiUrl } from '@/lib/api/config';
import type { AssetUploadResponse } from '@/types/asset';
import { useMutation } from '@tanstack/react-query';

export function useUploadAsset(orgSlug: string) {
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);

            const url = getApiUrl(`/org/${orgSlug}/assets/upload`);
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to upload asset');
            }

            return response.json() as Promise<AssetUploadResponse>;
        },
    });
}
