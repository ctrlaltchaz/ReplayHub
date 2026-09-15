"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import * as React from "react";

interface AdminGuardProps {
    children: React.ReactNode;
    requiresGlobalAdmin?: boolean;
}

export function AdminGuard({ children, requiresGlobalAdmin = false }: AdminGuardProps) {
    const { globalUser, isLoadingGlobal } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoadingGlobal && (!globalUser || (requiresGlobalAdmin && globalUser.isGlobalAdmin !== true))) {
            // Don't redirect if we're already being redirected to login
            // This prevents redirect loops
            const currentPath = window.location.pathname;
            if (currentPath.startsWith('/login')) {
                console.log('[AdminGuard] Already on login page, skipping redirect');
                return;
            }

            if (requiresGlobalAdmin && globalUser) {
                router.replace('/');
                return;
            }

            // Redirect to login with current URL as redirect parameter
            const currentUrl = window.location.pathname + window.location.search;
            const loginUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;
            console.log('[AdminGuard] No global user, redirecting to:', loginUrl);
            router.push(loginUrl);
        }
    }, [globalUser, isLoadingGlobal, router]);

    // Show loading state while checking authentication
    if (isLoadingGlobal) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!globalUser) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
                    <p className="text-muted-foreground mb-4">
                        You need to be logged in to access the admin console.
                    </p>
                    <button
                        onClick={() => {
                            const currentUrl = window.location.pathname + window.location.search;
                            const loginUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;
                            router.push(loginUrl);
                        }}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (requiresGlobalAdmin && globalUser.isGlobalAdmin !== true) {
        return null;
    }

    return <>{children}</>;
}