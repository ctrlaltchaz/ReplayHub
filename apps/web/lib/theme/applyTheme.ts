import type { OrganizationBranding } from '../types/organization';

/**
 * Convert hex color to HSL format for Tailwind CSS
 */
function hexToHSL(hex: string): string {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    // Convert to degrees and percentages
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    const lPercent = Math.round(l * 100);

    // Return in Tailwind's HSL format (without hsl() wrapper)
    return `${h} ${s}% ${lPercent}%`;
}

/**
 * Calculate a lighter or darker shade of an HSL color
 */
function adjustLightness(hsl: string, amount: number): string {
    const parts = hsl.split(' ');
    if (parts.length !== 3) return hsl;

    const h = parts[0];
    const s = parts[1];
    const l = parseInt(parts[2].replace('%', ''));

    const newL = Math.max(0, Math.min(100, l + amount));
    return `${h} ${s} ${newL}%`;
}

/**
 * Determine if a color is dark (for contrast calculations)
 */
function isColorDark(hsl: string): boolean {
    const parts = hsl.split(' ');
    if (parts.length !== 3) return false;

    const lightness = parseInt(parts[2].replace('%', ''));
    return lightness < 50;
}

/**
 * Apply organization branding colors as CSS variables to a container element
 */
export function applyTheme(branding: OrganizationBranding | null, element?: HTMLElement) {
    const target = element || document.documentElement;

    if (!branding) {
        return;
    }

    const isDarkTheme = branding.backgroundColor ?
        isColorDark(hexToHSL(branding.backgroundColor)) : false;

    // Apply primary color - used for buttons, active states, links
    if (branding.primaryColor) {
        const hsl = hexToHSL(branding.primaryColor);
        target.style.setProperty('--primary', hsl);
        target.style.setProperty('--sidebar-primary', hsl);
        target.style.setProperty('--ring', hsl);
    }

    // Apply secondary color - used for secondary buttons, accents
    if (branding.secondaryColor) {
        const hsl = hexToHSL(branding.secondaryColor);
        target.style.setProperty('--secondary', hsl);
    }

    // Apply accent color - used for highlights, hover states
    if (branding.accentColor) {
        const hsl = hexToHSL(branding.accentColor);
        target.style.setProperty('--accent', hsl);
        target.style.setProperty('--sidebar-accent', hsl);
    }

    // Apply sidebar/card color if specified
    if (branding.sidebarColor) {
        const hsl = hexToHSL(branding.sidebarColor);
        target.style.setProperty('--sidebar-background', hsl);
        target.style.setProperty('--card', hsl);
        target.style.setProperty('--popover', hsl);

        // For dark themes, make muted slightly lighter than cards
        // For light themes, keep them similar
        const mutedHsl = isDarkTheme ? adjustLightness(hsl, 5) : adjustLightness(hsl, -3);
        target.style.setProperty('--muted', mutedHsl);
    }

    // Apply background color if specified
    if (branding.backgroundColor) {
        const hsl = hexToHSL(branding.backgroundColor);
        target.style.setProperty('--background', hsl);

        // Set input background to be slightly different from main background
        const inputHsl = isDarkTheme ? adjustLightness(hsl, 8) : adjustLightness(hsl, -2);
        target.style.setProperty('--input', inputHsl);
    }

    // Apply text color if specified
    if (branding.textColor) {
        const hsl = hexToHSL(branding.textColor);
        target.style.setProperty('--foreground', hsl);
        target.style.setProperty('--sidebar-foreground', hsl);
        target.style.setProperty('--card-foreground', hsl);
        target.style.setProperty('--popover-foreground', hsl);

        // Muted text should be slightly less prominent
        const mutedForegroundHsl = isDarkTheme ? adjustLightness(hsl, -30) : adjustLightness(hsl, 20);
        target.style.setProperty('--muted-foreground', mutedForegroundHsl);
    }

    // Set border colors based on theme
    if (branding.backgroundColor && branding.textColor) {
        const bgHsl = hexToHSL(branding.backgroundColor);
        // Borders should be subtle - lighter for dark, darker for light
        const borderHsl = isDarkTheme ? adjustLightness(bgHsl, 15) : adjustLightness(bgHsl, -10);
        target.style.setProperty('--border', borderHsl);
        target.style.setProperty('--sidebar-border', borderHsl);
    }
}

/**
 * Get a CSS variable value or fallback
 */
export function getThemeColor(variable: string, fallback: string): string {
    if (typeof window === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback;
}

/**
 * Generate gradient classes based on org colors
 */
export function getOrgGradient(branding: OrganizationBranding | null): string {
    if (!branding?.primaryColor || !branding?.secondaryColor) {
        return 'gradient-primary'; // Default gradient class
    }

    // Return inline style for custom gradient
    return '';
}

/**
 * Check if branding has custom colors set
 */
export function hasCustomTheme(branding: OrganizationBranding | null): boolean {
    if (!branding) return false;

    return !!(
        branding.primaryColor ||
        branding.secondaryColor ||
        branding.accentColor ||
        branding.backgroundColor ||
        branding.sidebarColor ||
        branding.textColor
    );
}
