"use client";

import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [qc] = useState(() => new QueryClient());
    const pathname = usePathname();

    // Extract orgSlug from pathname if we're in an org route
    const orgSlug = React.useMemo(() => {
        if (!pathname?.startsWith('/org/')) {
            return undefined;
        }
        const parts = pathname.split('/');
        const slug = parts[2]; // /org/[slug]/...

        // Exclude special routes that aren't org slugs
        if (slug === 'select') {
            return undefined;
        }

        return slug;
    }, [pathname]);

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            forcedTheme="light"
        >
            <QueryClientProvider client={qc}>
                <AuthProvider orgSlug={orgSlug}>
                    {children}
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}