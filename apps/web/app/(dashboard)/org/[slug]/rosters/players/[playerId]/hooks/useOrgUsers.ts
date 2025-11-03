"use client";

import { apiGet } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

interface OrgUserListItem {
    id: string;
    email: string;
    displayName: string;
    isActive: boolean;
}

export function useOrgUsers(slug: string) {
    return useQuery({
        queryKey: [`/org/${slug}/users`],
        queryFn: async () => {
            const data = await apiGet<{ users: OrgUserListItem[] }>(
                `/org/${slug}/users`,
                {
                    slug,
                    credentials: 'include',
                }
            );
            return data.users;
        },
        enabled: !!slug,
    });
}
