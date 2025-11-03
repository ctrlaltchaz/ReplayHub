export interface ThemeConfig {
    // Brand Colors
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;

    // Branding
    logo?: string;
    favicon?: string;
    organizationName: string;

    // Layout
    sidebarStyle: 'default' | 'compact' | 'modern';
    headerStyle: 'default' | 'minimal' | 'branded';

    // Typography
    fontFamily: string;
    headingFont?: string;

    // Custom CSS
    customCss?: string;
}

export interface OrganizationTheme {
    id: string;
    organizationId: string;
    name: string;
    config: ThemeConfig;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Predefined theme templates
export const defaultThemes: Record<string, Partial<ThemeConfig>> = {
    default: {
        primary: 'hsl(210 100% 56%)', // Modern bright blue
        secondary: 'hsl(204 100% 97%)', // Light blue background
        accent: 'hsl(199 95% 74%)', // Vibrant cyan accent
        background: 'hsl(210 17% 98%)', // Soft off-white
        foreground: 'hsl(210 40% 15%)', // Dark blue-gray text
        muted: 'hsl(204 44% 94%)', // Light blue-gray
        mutedForeground: 'hsl(210 22% 49%)', // Medium blue-gray
        border: 'hsl(204 33% 90%)', // Subtle blue border
        input: 'hsl(204 33% 94%)', // Light input background
        ring: 'hsl(210 100% 56%)', // Bright blue focus ring
        sidebarStyle: 'modern',
        headerStyle: 'branded',
        fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
        headingFont: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
    },
    gaming: {
        primary: 'hsl(142 84% 47%)', // Bright green
        secondary: 'hsl(140 100% 97%)', // Very light green
        accent: 'hsl(75 100% 60%)', // Electric lime
        background: 'hsl(140 20% 98%)', // Soft green-white
        foreground: 'hsl(140 61% 9%)', // Dark green text
        muted: 'hsl(140 44% 94%)', // Light green-gray
        mutedForeground: 'hsl(140 22% 49%)', // Medium green-gray
        border: 'hsl(140 33% 88%)', // Subtle green border
        input: 'hsl(140 33% 94%)', // Light green input
        ring: 'hsl(142 84% 47%)', // Bright green focus
        sidebarStyle: 'modern',
        headerStyle: 'branded',
        fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
        headingFont: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
    },
    corporate: {
        primary: 'hsl(259 94% 51%)', // Modern purple
        secondary: 'hsl(254 100% 98%)', // Very light purple
        accent: 'hsl(280 100% 80%)', // Bright magenta accent
        background: 'hsl(254 20% 98%)', // Soft purple-white
        foreground: 'hsl(259 61% 12%)', // Dark purple text
        muted: 'hsl(254 44% 94%)', // Light purple-gray
        mutedForeground: 'hsl(259 22% 49%)', // Medium purple-gray
        border: 'hsl(254 33% 88%)', // Subtle purple border
        input: 'hsl(254 33% 94%)', // Light purple input
        ring: 'hsl(259 94% 51%)', // Modern purple focus
        sidebarStyle: 'modern',
        headerStyle: 'branded',
        fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
        headingFont: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
    },
    esports: {
        primary: 'hsl(326 100% 54%)', // Electric pink
        secondary: 'hsl(320 100% 98%)', // Very light pink
        accent: 'hsl(45 100% 60%)', // Bright yellow accent
        background: 'hsl(320 20% 98%)', // Soft pink-white
        foreground: 'hsl(326 61% 12%)', // Dark pink text
        muted: 'hsl(320 44% 94%)', // Light pink-gray
        mutedForeground: 'hsl(326 22% 49%)', // Medium pink-gray
        border: 'hsl(320 33% 88%)', // Subtle pink border
        input: 'hsl(320 33% 94%)', // Light pink input
        ring: 'hsl(326 100% 54%)', // Electric pink focus
        sidebarStyle: 'modern',
        headerStyle: 'branded',
        fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
        headingFont: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
    }
};

export const generateCssVariables = (theme: ThemeConfig): string => {
    return `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
        
        :root {
            /* Organization-specific branding variables */
            --org-primary: ${theme.primary};
            --org-surface: ${theme.background};
            --org-text: ${theme.foreground};
            --org-accent: ${theme.accent};
            --org-secondary: ${theme.secondary};
            --org-muted: ${theme.muted};
            --org-border: ${theme.border};
            
            /* Map to Tailwind CSS variables */
            --primary: ${theme.primary};
            --secondary: ${theme.secondary};
            --accent: ${theme.accent};
            --background: ${theme.background};
            --foreground: ${theme.foreground};
            --muted: ${theme.muted};
            --muted-foreground: ${theme.mutedForeground};
            --border: ${theme.border};
            --input: ${theme.input};
            --ring: ${theme.ring};
            --font-family: ${theme.fontFamily};
            ${theme.headingFont ? `--heading-font: ${theme.headingFont};` : ''}
            
            /* Enhanced sizing variables */
            --text-sm: 0.9rem;
            --text-base: 1.1rem;
            --text-lg: 1.25rem;
            --text-xl: 1.5rem;
            --text-2xl: 1.75rem;
            --text-3xl: 2.25rem;
            --text-4xl: 2.75rem;
            
            --spacing-xs: 0.75rem;
            --spacing-sm: 1rem;
            --spacing-md: 1.5rem;
            --spacing-lg: 2rem;
            --spacing-xl: 2.5rem;
            --spacing-2xl: 3rem;
            
            --border-radius: 0.75rem;
            --border-radius-lg: 1rem;
            --border-radius-xl: 1.25rem;
        }
        
        * {
            font-family: var(--font-family) !important;
        }
        
        body {
            font-family: var(--font-family) !important;
            font-size: var(--text-base) !important;
            line-height: 1.6 !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
            ${theme.headingFont ? `font-family: var(--heading-font) !important;` : ''}
            font-weight: 600 !important;
            letter-spacing: -0.025em !important;
        }
        
        h1 { font-size: var(--text-4xl) !important; }
        h2 { font-size: var(--text-3xl) !important; }
        h3 { font-size: var(--text-3xl) !important; }
        h4 { font-size: var(--text-xl) !important; }
        h5 { font-size: var(--text-lg) !important; }
        h6 { font-size: var(--text-base) !important; }
        
        /* Enhanced component sizing */
        .btn, button {
            padding: var(--spacing-sm) var(--spacing-md) !important;
            font-size: var(--text-base) !important;
            border-radius: var(--border-radius) !important;
            font-weight: 500 !important;
        }
        
        .card, [data-card] {
            border-radius: var(--border-radius-lg) !important;
            padding: var(--spacing-lg) !important;
        }
        
        .sidebar {
            padding: var(--spacing-md) !important;
        }
        
        .sidebar a {
            padding: var(--spacing-sm) var(--spacing-md) !important;
            font-size: var(--text-base) !important;
            border-radius: var(--border-radius) !important;
            font-weight: 500 !important;
        }
        
        input, textarea, select {
            padding: var(--spacing-sm) var(--spacing-md) !important;
            font-size: var(--text-base) !important;
            border-radius: var(--border-radius) !important;
        }
        
        ${theme.customCss || ''}
    `;
};