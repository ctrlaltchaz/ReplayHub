export interface OrganizationBranding {
    logo?: string;
    logoUrl?: string;
    theme?: string; // Theme preset name
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    sidebarColor?: string;
    textColor?: string;
}

export interface ThemePreset {
    name: string;
    label: string;
    description: string;
    colors: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        backgroundColor: string;
        sidebarColor: string;
        textColor: string;
    };
}

// Predefined theme presets
export const THEME_PRESETS: Record<string, ThemePreset> = {
    default: {
        name: 'default',
        label: 'Default',
        description: 'Clean and professional default theme',
        colors: {
            primaryColor: '#3b82f6', // blue-500
            secondaryColor: '#8b5cf6', // violet-500
            accentColor: '#10b981', // green-500
            backgroundColor: '#ffffff',
            sidebarColor: '#f9fafb', // gray-50
            textColor: '#111827', // gray-900
        },
    },
    dark: {
        name: 'dark',
        label: 'Dark',
        description: 'Modern dark theme for reduced eye strain',
        colors: {
            primaryColor: '#6366f1', // indigo-500 - vibrant for dark mode
            secondaryColor: '#8b5cf6', // violet-500
            accentColor: '#06b6d4', // cyan-500
            backgroundColor: '#09090b', // zinc-950 - very dark background
            sidebarColor: '#18181b', // zinc-900 - slightly lighter for cards/sidebar
            textColor: '#fafafa', // zinc-50 - bright white text
        },
    },
    blue: {
        name: 'blue',
        label: 'Ocean Blue',
        description: 'Cool blue theme for a calm workspace',
        colors: {
            primaryColor: '#0ea5e9', // sky-500
            secondaryColor: '#06b6d4', // cyan-500
            accentColor: '#3b82f6', // blue-500
            backgroundColor: '#f0f9ff', // sky-50
            sidebarColor: '#e0f2fe', // sky-100
            textColor: '#0c4a6e', // sky-900
        },
    },
    purple: {
        name: 'purple',
        label: 'Royal Purple',
        description: 'Rich purple theme for creative teams',
        colors: {
            primaryColor: '#a855f7', // purple-500
            secondaryColor: '#d946ef', // fuchsia-500
            accentColor: '#ec4899', // pink-500
            backgroundColor: '#faf5ff', // purple-50
            sidebarColor: '#f3e8ff', // purple-100
            textColor: '#581c87', // purple-900
        },
    },
    green: {
        name: 'green',
        label: 'Forest Green',
        description: 'Natural green theme for eco-friendly brands',
        colors: {
            primaryColor: '#22c55e', // green-500
            secondaryColor: '#10b981', // emerald-500
            accentColor: '#84cc16', // lime-500
            backgroundColor: '#f0fdf4', // green-50
            sidebarColor: '#dcfce7', // green-100
            textColor: '#14532d', // green-900
        },
    },
    red: {
        name: 'red',
        label: 'Energetic Red',
        description: 'Bold red theme for high-energy teams',
        colors: {
            primaryColor: '#ef4444', // red-500
            secondaryColor: '#f97316', // orange-500
            accentColor: '#eab308', // yellow-500
            backgroundColor: '#fef2f2', // red-50
            sidebarColor: '#fee2e2', // red-100
            textColor: '#7f1d1d', // red-900
        },
    },
};
