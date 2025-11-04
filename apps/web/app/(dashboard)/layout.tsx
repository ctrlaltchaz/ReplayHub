"use client";

import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { useFavicon } from "@/lib/hooks/useFavicon";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const pathname = usePathname();

    // Extract slug from pathname (e.g., /org/demo-org/overview -> demo-org)
    const slug = React.useMemo(() => {
        if (pathname?.startsWith('/org/')) {
            const parts = pathname.split('/');
            return parts[2]; // /org/[slug]/...
        }
        return undefined;
    }, [pathname]);

    // Create org object for TopBar if we have a slug
    const orgForTopBar = slug ? { slug, name: '' } : undefined;

    // Render dashboard content (AuthProvider is at root level now with dynamic orgSlug)
    const content = (
        <DashboardContent
            slug={slug}
            orgForTopBar={orgForTopBar}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
        >
            {children}
        </DashboardContent>
    );

    // Wrap with OrganizationProvider if we're in an org route
    if (slug) {
        return <OrganizationProvider orgSlug={slug}>{content}</OrganizationProvider>;
    }

    return content;
}

function DashboardContent({
    slug,
    orgForTopBar,
    mobileMenuOpen,
    setMobileMenuOpen,
    children
}: {
    slug?: string;
    orgForTopBar?: { slug: string; name: string };
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    children: React.ReactNode;
}) {
    // Apply dynamic favicon based on org branding
    useFavicon();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Topbar
                org={orgForTopBar}
                onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
            <div className="flex flex-1 h-[calc(100vh-4rem)]">
                <Suspense fallback={
                    <aside className="w-64 border-r bg-card flex-shrink-0">
                        <div className="p-4">Loading...</div>
                    </aside>
                }>
                    <Sidebar
                        slug={slug}
                        mobileMenuOpen={mobileMenuOpen}
                        onMobileMenuClose={() => setMobileMenuOpen(false)}
                    />
                </Suspense>
                <main className="flex-1 overflow-auto flex flex-col">
                    <div className="flex-1">
                        {children}
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
