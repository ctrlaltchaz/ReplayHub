"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  const pathname = usePathname();

  // Extract orgSlug from pathname if we're in an org route
  const orgSlug = React.useMemo(() => {
    if (!pathname?.startsWith("/org/")) {
      return undefined;
    }
    const parts = pathname.split("/");
    const slug = parts[2]; // /org/[slug]/...

    // Exclude special routes that aren't org slugs
    if (slug === "select") {
      return undefined;
    }

    return slug;
  }, [pathname]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
      <QueryClientProvider client={qc}>
        <AuthProvider orgSlug={orgSlug}>
          <AuthRedirectGuard>{children}</AuthRedirectGuard>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function AuthRedirectGuard({ children }: { children: React.ReactNode }) {
  const { isUnauthenticated, isLoadingGlobal } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchString = searchParams?.toString();

  const isPublicRoute = React.useMemo(() => {
    if (!pathname) return false;
    if (pathname.includes("/login")) return true;
    return (
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/invite") ||
      pathname.startsWith("/health") ||
      pathname.startsWith("/install")
    );
  }, [pathname]);

  React.useEffect(() => {
    if (isLoadingGlobal || !pathname || isPublicRoute || !isUnauthenticated) {
      return;
    }

    const returnPath = searchString ? `${pathname}?${searchString}` : pathname;
    router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`);
  }, [isUnauthenticated, isLoadingGlobal, isPublicRoute, pathname, router, searchString]);

  return <>{children}</>;
}
