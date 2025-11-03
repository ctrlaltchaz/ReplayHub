'use client';

import { OrganizationTheme, ThemeConfig, defaultThemes, generateCssVariables } from '@/types/theme';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
    currentTheme: ThemeConfig | null;
    organizationThemes: OrganizationTheme[];
    isLoading: boolean;
    error: string | null;
    applyTheme: (themeConfig: ThemeConfig) => void;
    saveTheme: (theme: Partial<ThemeConfig>) => Promise<void>;
    loadTheme: (themeId: string) => Promise<void>;
    resetToDefault: () => void;
    previewTheme: (themeConfig: ThemeConfig) => void;
    clearPreview: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: React.ReactNode;
    organizationSlug?: string;
    initialTheme?: ThemeConfig;
}

export function ThemeProvider({ children, organizationSlug, initialTheme }: ThemeProviderProps) {
    const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(initialTheme || null);
    const [organizationThemes, setOrganizationThemes] = useState<OrganizationTheme[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPreview, setIsPreview] = useState(false);

    // Apply theme CSS variables to the document
    const applyTheme = React.useCallback((themeConfig: ThemeConfig) => {
        const cssVariables = generateCssVariables(themeConfig);

        // Remove existing theme style (but preserve SSR styles)
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
        if (themeConfig.favicon) {
            let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.href = themeConfig.favicon;
        }

        // Update document title if organization name is provided
        if (themeConfig.organizationName && organizationSlug) {
            document.title = `${themeConfig.organizationName} - Esports Operations`;
        }

        setCurrentTheme(themeConfig);
    }, [organizationSlug]);

    // Load organization themes from API
    const loadOrganizationThemes = React.useCallback(async () => {
        if (!organizationSlug) return;

        // If we already have an initial theme (from server), use it
        if (initialTheme && !currentTheme) {
            setCurrentTheme(initialTheme);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // TODO: Replace with actual API call
            // const themes = await apiGet<OrganizationTheme[]>(`/org/${organizationSlug}/themes`);
            // setOrganizationThemes(themes);

            // For now, use default theme only if no initial theme was provided
            if (!initialTheme && !currentTheme) {
                const defaultTheme: ThemeConfig = {
                    ...defaultThemes.default,
                    organizationName: organizationSlug.charAt(0).toUpperCase() + organizationSlug.slice(1),
                } as ThemeConfig;

                applyTheme(defaultTheme);
            }
        } catch (err) {
            setError('Failed to load organization themes');
            console.error('Theme loading error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [organizationSlug, currentTheme, initialTheme, applyTheme]);

    // Save theme to API
    const saveTheme = async (themeUpdate: Partial<ThemeConfig>) => {
        if (!organizationSlug || !currentTheme) return;

        setIsLoading(true);
        setError(null);

        try {
            const updatedTheme = { ...currentTheme, ...themeUpdate };

            // TODO: Replace with actual API call
            // await apiPost(`/org/${organizationSlug}/themes`, updatedTheme);

            applyTheme(updatedTheme);
        } catch (err) {
            setError('Failed to save theme');
            console.error('Theme save error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Load specific theme
    const loadTheme = async (themeId: string) => {
        if (!organizationSlug) return;

        setIsLoading(true);
        setError(null);

        try {
            // Check if it's a predefined theme
            if (defaultThemes[themeId]) {
                const theme: ThemeConfig = {
                    ...defaultThemes[themeId],
                    organizationName: currentTheme?.organizationName || organizationSlug,
                } as ThemeConfig;
                applyTheme(theme);
                return;
            }

            // TODO: Load custom theme from API
            // const theme = await apiGet<OrganizationTheme>(`/org/${organizationSlug}/themes/${themeId}`);
            // applyTheme(theme.config);
        } catch (err) {
            setError('Failed to load theme');
            console.error('Theme load error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Reset to default theme
    const resetToDefault = () => {
        const defaultTheme: ThemeConfig = {
            ...defaultThemes.default,
            organizationName: currentTheme?.organizationName || organizationSlug || 'Organization',
        } as ThemeConfig;
        applyTheme(defaultTheme);
    };

    // Preview theme temporarily
    const previewTheme = (themeConfig: ThemeConfig) => {
        setIsPreview(true);
        applyTheme(themeConfig);
    };

    // Clear preview and restore current theme
    const clearPreview = () => {
        if (isPreview && currentTheme) {
            setIsPreview(false);
            applyTheme(currentTheme);
        }
    };

    // Load themes on mount
    useEffect(() => {
        loadOrganizationThemes();
    }, [loadOrganizationThemes]);

    // Apply initial theme
    useEffect(() => {
        if (initialTheme) {
            applyTheme(initialTheme);
        }
    }, [initialTheme, applyTheme]);

    const value: ThemeContextType = {
        currentTheme,
        organizationThemes,
        isLoading,
        error,
        applyTheme,
        saveTheme,
        loadTheme,
        resetToDefault,
        previewTheme,
        clearPreview,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}