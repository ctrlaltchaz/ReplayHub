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

        // DISABLE MIDDLEWARE AUTH CHECKS
        // Let the frontend components handle authentication
        // The API will return 401 if not authenticated, and the client will handle redirects
        // This prevents redirect loops caused by cookie reading issues in middleware

        // Allow the request to continue
        return NextResponse.next();
    } catch (error) {
        // If anything goes wrong, allow the request to continue
        // This prevents middleware from breaking the entire app
        console.error('Middleware error:', error);
        return NextResponse.next();
    }
}