'use client';

import { getApiUrl } from '@/lib/api/config';
import type { Doc } from '@/types/docs';
import { useQuery } from '@tanstack/react-query';

export function useGlobalDoc(docId: string | null) {
    return useQuery<Doc>({
        queryKey: ['global-doc', docId],
        enabled: !!docId,
        queryFn: async () => {
            if (!docId) throw new Error('Doc ID is required');
            const response = await fetch(getApiUrl(`/admin/docs/${docId}`), {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch doc');
            }
            const data = await response.json();
            // API returns doc directly, not wrapped
            return data;
        },
    });
}
