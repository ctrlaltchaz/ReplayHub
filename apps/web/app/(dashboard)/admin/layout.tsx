import { AdminGuard } from "@/components/guards/AdminGuard";
import { PageTransition } from "@/components/ui/PageTransition";
import { AuthProvider } from "@/context/AuthContext";
import * as React from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <AdminGuard requiresGlobalAdmin={true}>
                <PageTransition>
                    {children}
                </PageTransition>
            </AdminGuard>
        </AuthProvider>
    );
}