import type { Metadata } from "next";
import * as React from "react";

export const metadata: Metadata = {
    title: "Authentication - ReplayHub",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}