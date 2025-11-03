"use client";

import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import * as React from "react";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [qc] = useState(() => new QueryClient());

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            forcedTheme="light"
        >
            <QueryClientProvider client={qc}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}