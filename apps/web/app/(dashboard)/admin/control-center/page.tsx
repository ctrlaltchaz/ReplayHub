'use client';

import { AdminAuditLog } from '@/components/admin/AdminAuditLog';
import { AdminFeedback } from '@/components/admin/AdminFeedback';
import { AdminGlobalUsers } from '@/components/admin/AdminGlobalUsers';
import { AdminOrganisations } from '@/components/admin/AdminOrganisations';
import { AdminOverviewStats } from '@/components/admin/AdminOverviewStats';
import { MobileTabNavigation } from '@/components/ui/mobile-tab-navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
    BookOpen,
    Building,
    FileText,
    MessageSquare,
    Shield,
    Users
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ControlCenterPage() {
    const searchParams = useSearchParams();
    const tabParam = searchParams?.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || 'overview');

    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-8 w-8" />
                        Global Control Center
                    </h1>
                    <p className="text-muted-foreground">
                        Superadmin dashboard for platform management
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {/* Mobile Tab Navigation */}
                <div className="lg:hidden">
                    <MobileTabNavigation
                        tabs={[
                            { value: "overview", label: "Overview", icon: <Activity className="h-4 w-4" /> },
                            { value: "organisations", label: "Organizations", icon: <Building className="h-4 w-4" /> },
                            { value: "users", label: "Global Users", icon: <Users className="h-4 w-4" /> },
                            { value: "docs", label: "Documentation", icon: <BookOpen className="h-4 w-4" /> },
                            { value: "feedback", label: "Feedback", icon: <MessageSquare className="h-4 w-4" /> },
                            { value: "audit", label: "Audit Log", icon: <FileText className="h-4 w-4" /> },
                        ]}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        title="Control Center"
                        description="Switch between tabs"
                    />
                </div>

                {/* Desktop Tab List */}
                <TabsList className="hidden lg:inline-flex flex-wrap">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="organisations" className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Organizations
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Global Users
                    </TabsTrigger>
                    <TabsTrigger value="docs" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Documentation
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Feedback
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Audit Log
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <AdminOverviewStats />
                </TabsContent>

                <TabsContent value="organisations" className="space-y-6">
                    <AdminOrganisations />
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                    <AdminGlobalUsers />
                </TabsContent>

                <TabsContent value="docs" className="space-y-6">
                    <div className="text-center py-12">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Platform Documentation</h3>
                        <p className="text-muted-foreground mb-4">
                            Manage global documentation visible to all organizations
                        </p>
                        <a
                            href="/admin/docs"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            Go to Documentation Manager
                        </a>
                    </div>
                </TabsContent>

                <TabsContent value="feedback" className="space-y-6">
                    <AdminFeedback />
                </TabsContent>

                <TabsContent value="audit" className="space-y-6">
                    <AdminAuditLog />
                </TabsContent>
            </Tabs>
        </div>
    );
}