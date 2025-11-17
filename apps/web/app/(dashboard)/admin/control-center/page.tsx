'use client';

import { AdminAuditLog } from '@/components/admin/AdminAuditLog';
import { AdminFeedback } from '@/components/admin/AdminFeedback';
import { AdminGlobalUsers } from '@/components/admin/AdminGlobalUsers';
import { AdminOrganisations } from '@/components/admin/AdminOrganisations';
import { AdminOverviewStats } from '@/components/admin/AdminOverviewStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
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
                <TabsList className="grid w-full grid-cols-5">
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