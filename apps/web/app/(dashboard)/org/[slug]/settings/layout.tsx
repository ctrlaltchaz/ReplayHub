"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Link2, MessageSquare, Settings, Shield, UserPlus, Users } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const slug = params?.slug as string;

    // Determine active tab from pathname
    const getActiveTab = () => {
        if (pathname?.includes('/settings/roles')) return 'roles';
        if (pathname?.includes('/settings/invites')) return 'invites';
        if (pathname?.includes('/settings/organization')) return 'organization';
        if (pathname?.includes('/settings/discord')) return 'discord';
        if (pathname?.includes('/settings/quick-links')) return 'quick-links';
        return 'users';
    };

    const activeTab = getActiveTab();

    const handleTabChange = (value: string) => {
        const routes = {
            users: `/org/${slug}/settings/users`,
            roles: `/org/${slug}/settings/roles`,
            invites: `/org/${slug}/settings/invites`,
            organization: `/org/${slug}/settings/organization`,
            discord: `/org/${slug}/settings/discord`,
            'quick-links': `/org/${slug}/settings/quick-links`,
        };
        router.push(routes[value as keyof typeof routes]);
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                    <Settings className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                    <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 font-montserrat">
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage users, roles, invitations, and organization settings
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-6 lg:w-auto">
                    <TabsTrigger value="users" className="gap-2">
                        <Users className="h-4 w-4" />
                        Users
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="gap-2">
                        <Shield className="h-4 w-4" />
                        Roles
                    </TabsTrigger>
                    <TabsTrigger value="invites" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Invites
                    </TabsTrigger>
                    <TabsTrigger value="organization" className="gap-2">
                        <Building className="h-4 w-4" />
                        Organization
                    </TabsTrigger>
                    <TabsTrigger value="discord" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Discord
                    </TabsTrigger>
                    <TabsTrigger value="quick-links" className="gap-2">
                        <Link2 className="h-4 w-4" />
                        Quick Links
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Content */}
            <div className="mt-6">
                {children}
            </div>
        </div>
    );
}
