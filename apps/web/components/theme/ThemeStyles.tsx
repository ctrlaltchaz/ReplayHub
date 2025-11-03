'use client';

import { ThemeConfig, generateCssVariables } from '@/types/theme';
import { useEffect } from 'react';

interface ThemeStylesProps {
    theme: ThemeConfig;
}

/**
 * Client component that injects theme CSS variables
 * This should be rendered at the layout boundary for optimal performance
 */
export function ThemeStyles({ theme }: ThemeStylesProps) {
    useEffect(() => {
        // Generate CSS variables
        const cssVariables = generateCssVariables(theme);

        // Remove existing theme style
        const existingStyle = document.getElementById('org-theme-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Add new theme style
        const style = document.createElement('style');
        style.id = 'org-theme-styles';
        style.textContent = cssVariables;
        document.head.appendChild(style);

        // Update favicon if provided
        if (theme.favicon) {
            let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.href = theme.favicon;
        }

        // Update document title
        if (theme.organizationName) {
            document.title = `${theme.organizationName} - Esports Operations`;
        }

        // Cleanup function
        return () => {
            const style = document.getElementById('org-theme-styles');
            if (style) {
                style.remove();
            }
        };
    }, [theme]);

    return null; // This component only manages side effects
}

/**
 * Server-side rendered style tag for initial theme
 * This prevents FOUC (Flash of Unstyled Content)
 */
interface ServerThemeStylesProps {
    theme: ThemeConfig;
}

export function ServerThemeStyles({ theme }: ServerThemeStylesProps) {
    const cssVariables = generateCssVariables(theme);

    return (
        <style
            id="org-theme-styles-ssr"
            dangerouslySetInnerHTML={{
                __html: cssVariables
            }}
        />
    );
}