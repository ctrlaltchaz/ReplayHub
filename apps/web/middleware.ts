import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;

        // Allow static assets and API routes
        if (
            pathname.startsWith('/_next/') ||
            pathname.startsWith('/favicon.ico') ||
            pathname.startsWith('/api/') ||
            pathname.includes('.')
        ) {
            return NextResponse.next();
        }

        // Extract org slug from pathname
        const orgMatch = pathname.match(/^\/org\/([^\/]+)/);
        if (!orgMatch) {
            return NextResponse.next();
        }

        const orgSlug = orgMatch[1];

        // Allow login pages
        if (pathname === `/org/${orgSlug}/login`) {
            return NextResponse.next();
        }

        // Check for org session cookie
        // In a real app, you'd validate the session properly
        // For now, we check for session cookies and let the API handle validation
        const hasGlobalSession = request.cookies.has('sessionId');
        const hasOrgSession = request.cookies.has(`org-${orgSlug}-session`) ||
            request.cookies.has('sessionId'); // Some APIs use global session for org access

        // If no session detected, redirect to org login
        if (!hasGlobalSession && !hasOrgSession) {
            const loginUrl = new URL(`/org/${orgSlug}/login`, request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Allow the request to continue
        return NextResponse.next();
    } catch (error) {
        // If anything goes wrong, allow the request to continue
        // This prevents middleware from breaking the entire app
        console.error('Middleware error:', error);
        return NextResponse.next();
    }
}

// Only match org routes
export const config = {
    matcher: ['/org/:path*']
};