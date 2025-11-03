import { getApiUrl } from '@/lib/api/config';
import { useMutation } from '@tanstack/react-query';

export function useDeleteInventoryItem(orgSlug: string) {
    return useMutation({
        mutationFn: async (itemId: string) => {
            const url = getApiUrl(`/org/${orgSlug}/inventory/items/${itemId}`);
            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete inventory item');
            }

            return response.json();
        },
    });
}
