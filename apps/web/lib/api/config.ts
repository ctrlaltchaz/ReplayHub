// In development, use the Next.js proxy at /api
// In production, NEXT_PUBLIC_API_URL must be set to the actual API URL (e.g., https://api.replayhub.app/api)
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

// Get the base server URL without /api suffix (for static files like uploads)
export function getServerUrl(): string {
    // In production, use the NEXT_PUBLIC_API_URL environment variable
    // In development, use localhost:3001
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
    // For local development with proxy, we need the actual server URL for uploads
    if (apiUrl === '/api') {
        return 'http://localhost:3001';
    }
    // Remove /api suffix if present
    return apiUrl.replace(/\/api$/, '');
}

// Helper to get the full API URL for both client and server side
export function getApiUrl(path: string): string {
    const base = API_BASE;

    // Always use the full URL for the external API
    return `${base}${path}`;
}