"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider as CustomThemeProvider } from "@/context/ThemeContext";
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
        return parts[2]; // /org/[slug]/...
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
                    <CustomThemeProvider organizationSlug={orgSlug}>
                        {children}
                    </CustomThemeProvider>
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}