'use client';

import { getApiUrl } from '@/lib/api/config';
import type { Doc } from '@/types/docs';
import { useQuery } from '@tanstack/react-query';

export function useDocs(slug: string, categoryId?: string) {
    return useQuery<Doc[]>({
        queryKey: ['docs', slug, categoryId],
        queryFn: async () => {
            const url = categoryId
                ? getApiUrl(`/org/${slug}/docs?categoryId=${categoryId}`)
                : getApiUrl(`/org/${slug}/docs`);
            const response = await fetch(url, {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch docs');
            }
            const data = await response.json();
            return data.docs || [];
        },
    });
}
