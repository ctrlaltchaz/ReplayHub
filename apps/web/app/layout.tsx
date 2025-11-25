import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import * as React from "react";
import "./globals.css";
import { Providers } from "./providers";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReplayHub",
  description: "Multi-tenant esports operations platform",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} antialiased font-sans`}
        style={{
          fontFamily: "var(--font-montserrat), -apple-system, BlinkMacSystemFont, sans-serif",
        }}
        suppressHydrationWarning
      >
        <React.Suspense fallback={null}>
          <Providers>{children}</Providers>
        </React.Suspense>
      </body>
    </html>
  );
}
