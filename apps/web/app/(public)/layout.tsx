import type { Metadata } from "next";
import * as React from "react";

export const metadata: Metadata = {
    title: "Invitation - ReplayHub",
};

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Public routes don't need auth checking
    return <>{children}</>;
}
