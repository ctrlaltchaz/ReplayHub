'use client';

import { getApiUrl } from '@/lib/api/config';
import type { ThemePreset } from '@/lib/types/organization';
import { useEffect, useState } from 'react';

export function useThemePresets(orgSlug: string) {
    const [presets, setPresets] = useState<ThemePreset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPresets = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(getApiUrl(`/org/${orgSlug}/profile/themes`), {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch theme presets');
                }

                const data = await response.json();
                setPresets(data.themes || []);
            } catch (err: any) {
                console.error('Failed to fetch theme presets:', err);
                setError(err.message || 'Failed to load themes');
            } finally {
                setIsLoading(false);
            }
        };

        if (orgSlug) {
            fetchPresets();
        }
    }, [orgSlug]);

    return { presets, isLoading, error };
}
