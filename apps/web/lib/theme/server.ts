import { getApiUrl } from '@/lib/api/config';
import { ThemeConfig, defaultThemes, generateCssVariables } from '@/types/theme';

/**
 * Server-side theme utilities for generating CSS at build time
 */

interface OrgBrandingData {
    primary: string;
    surface: string;
    text: string;
    accent: string;
    logo?: string;
    favicon?: string;
}

interface OrgThemeResponse {
    organizationId: string;
    slug: string;
    name: string;
    branding: OrgBrandingData;
}

/**
 * Get theme configuration for an organization on the server
 */
export async function getOrgTheme(slug: string): Promise<ThemeConfig> {
    try {
        // Fetch real branding data from API
        const response = await fetch(getApiUrl(`/org/${slug}/settings/branding`), {
            cache: 'no-store', // Always get fresh theme data
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch branding: ${response.status}`);
        }

        const data: OrgThemeResponse = await response.json();
        const { branding } = data;

        // Convert branding colors to theme config
        const themeConfig: ThemeConfig = {
            // Organization branding
            primary: branding.primary,
            accent: branding.accent,
            background: branding.surface,
            foreground: branding.text,

            // Derived colors from branding
            secondary: branding.surface,
            muted: branding.surface,
            mutedForeground: branding.text,
            border: branding.primary,
            input: branding.surface,
            ring: branding.primary,

            // Organization metadata
            organizationName: data.name,
            logo: branding.logo,
            favicon: branding.favicon,

            // Typography
            fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
            headingFont: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',

            // Sidebar and header styles
            sidebarStyle: 'modern' as const,
            headerStyle: 'branded' as const,
        };

        return themeConfig;
    } catch (error) {
        console.error('Failed to load org theme:', error);

        // Return fallback theme with defaults
        return {
            ...defaultThemes.default,
            organizationName: slug.charAt(0).toUpperCase() + slug.slice(1),
            fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
            headingFont: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
            sidebarStyle: 'modern' as const,
            headerStyle: 'branded' as const,
        } as ThemeConfig;
    }
}

/**
 * Generate CSS variables for server-side rendering
 */
export function generateThemeCss(theme: ThemeConfig): string {
    return generateCssVariables(theme);
}

/**
 * Generate theme metadata for HTML head
 */
export function generateThemeMetadata(theme: ThemeConfig) {
    return {
        title: `${theme.organizationName} - Esports Operations`,
        favicon: theme.favicon,
        fonts: [
            theme.fontFamily,
            theme.headingFont,
        ].filter(Boolean),
    };
}