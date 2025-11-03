"use client";

import { PageTransition } from "@/components/ui/PageTransition";
import { AuthProvider } from "@/context/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { useParams } from "next/navigation";
import * as React from "react";

export default function OrgLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const slug = params?.slug as string;

    return (
        <AuthProvider orgSlug={slug}>
            <OrganizationProvider orgSlug={slug}>
                <PageTransition>
                    {children}
                </PageTransition>
            </OrganizationProvider>
        </AuthProvider>
    );
}
