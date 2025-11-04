// In development, call the API directly at localhost:3001
// In production, NEXT_PUBLIC_API_URL must be set to the actual API URL (e.g., https://api.replayhub.app/api)
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// Get the base server URL without /api suffix (for static files like uploads)
export function getServerUrl(): string {
    // In production, use the NEXT_PUBLIC_API_URL environment variable
    // In development, use localhost:3001
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    // Remove /api suffix if present
    return apiUrl.replace(/\/api$/, '');
}

// Helper to get the full API URL for both client and server side
export function getApiUrl(path: string): string {
    const base = API_BASE;

    // Always use the full URL for the external API
    return `${base}${path}`;
}