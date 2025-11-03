import { useOrganization } from '@/contexts/OrganizationContext';
import { getServerUrl } from '@/lib/api/config';
import { useEffect } from 'react';

/**
 * Custom hook to dynamically set the favicon based on organization branding
 * Falls back to default favicon if no logo is available
 */
export function useFavicon() {
    // Try to get organization context (may not be available on all pages)
    let logoUrl: string | null = null;
    try {
        const { branding } = useOrganization();
        logoUrl = branding?.logoUrl || branding?.logo || null;
    } catch (e) {
        // Not in org context, that's fine
    }

    useEffect(() => {
        // Find existing favicon link elements
        let faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;

        if (!faviconLink) {
            // Create favicon link if it doesn't exist
            faviconLink = document.createElement('link');
            faviconLink.rel = 'icon';
            document.head.appendChild(faviconLink);
        }

        if (logoUrl) {
            // Convert relative URL to full URL if needed
            const fullLogoUrl = logoUrl.startsWith('/')
                ? `${getServerUrl()}${logoUrl}`
                : logoUrl;

            faviconLink.href = fullLogoUrl;
        } else {
            // Reset to default favicon
            faviconLink.href = '/favicon.ico';
        }
    }, [logoUrl]);
}
