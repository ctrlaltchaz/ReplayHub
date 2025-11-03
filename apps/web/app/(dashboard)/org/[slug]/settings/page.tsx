"use client";

import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
    usePageTitle('Settings');

    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    useEffect(() => {
        // Redirect to users page by default
        router.replace(`/org/${slug}/settings/users`);
    }, [router, slug]);

    return null;
}
