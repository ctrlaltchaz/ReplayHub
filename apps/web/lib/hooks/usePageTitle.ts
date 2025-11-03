import { useOrganization } from '@/contexts/OrganizationContext';
import { useEffect } from 'react';

/**
 * Custom hook to dynamically set the page title
 * Format: [Page Name] - [Org Name] | ReplayHub
 * Falls back gracefully if org context is not available
 */
export function usePageTitle(pageTitle: string) {
    // Try to get organization context (may not be available on all pages)
    let orgName: string | null = null;
    try {
        const { organization } = useOrganization();
        orgName = organization?.name || null;
    } catch (e) {
        // Not in org context, that's fine
    }

    useEffect(() => {
        const parts: string[] = [];

        // Add page title
        if (pageTitle) {
            parts.push(pageTitle);
        }

        // Add org name if available
        if (orgName) {
            parts.push(orgName);
        }

        // Add platform name
        parts.push('ReplayHub');

        // Set document title
        document.title = parts.join(' - ');

        // Cleanup: reset to default on unmount
        return () => {
            document.title = 'ReplayHub';
        };
    }, [pageTitle, orgName]);
}
