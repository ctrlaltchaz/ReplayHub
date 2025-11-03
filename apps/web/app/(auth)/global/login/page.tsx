"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function GlobalLoginRedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Get the redirect parameter if it exists
        const redirect = searchParams?.get('redirect');

        // Redirect to unified login with redirect param
        if (redirect) {
            router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
        } else {
            router.replace('/login');
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground font-montserrat">Redirecting to login...</p>
            </div>
        </div>
    );
}

export default function GlobalLoginRedirect() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-montserrat">Loading...</p>
                </div>
            </div>
        }>
            <GlobalLoginRedirectContent />
        </Suspense>
    );
}