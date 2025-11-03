"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface OrgLoginRedirectProps {
    params: {
        slug: string;
    };
}

export default function OrgLoginRedirect({ params }: OrgLoginRedirectProps) {
    const router = useRouter();
    // Unused but required for component type
    void params;

    useEffect(() => {
        // Redirect to unified login, which will detect user type
        router.replace('/login');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground font-montserrat">Redirecting to login...</p>
            </div>
        </div>
    );
}