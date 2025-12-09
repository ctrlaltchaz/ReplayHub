'use client';

import { getApiUrl } from '@/lib/api/config';
import type { Doc } from '@/types/docs';
import { useQuery } from '@tanstack/react-query';

export function useGlobalDocs(categoryId?: string) {
    return useQuery<Doc[]>({
        queryKey: ['global-docs', categoryId],
        queryFn: async () => {
            const url = categoryId
                ? getApiUrl(`/admin/docs?categoryId=${categoryId}`)
                : getApiUrl('/admin/docs');
            const response = await fetch(url, {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch global docs');
            }
            const data = await response.json();
            return data.docs || [];
        },
    });
}
