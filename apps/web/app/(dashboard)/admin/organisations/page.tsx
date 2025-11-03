'use client';

import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import OrganisationsClient from './OrganisationsClient';

interface Organisation {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    userCount?: number;
}

interface OrganisationsData {
    organisations: Organisation[];
    total: number;
    page: number;
    totalPages: number;
}

export default function OrganisationsPage() {
    const [data, setData] = useState<OrganisationsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { globalUser, isLoadingGlobal } = useAuth();

    useEffect(() => {
        const fetchOrganisations = async () => {
            if (!globalUser) return;

            try {
                setLoading(true);
                const result = await apiGet<OrganisationsData>('/admin/organisations');
                setData(result);
            } catch (err) {
                console.error('Failed to fetch organisations:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch organisations');
            } finally {
                setLoading(false);
            }
        };

        fetchOrganisations();
    }, [globalUser]);

    if (isLoadingGlobal || loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
                        <p className="text-destructive">Error: {error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
                        <p className="text-muted-foreground">No data available</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <OrganisationsClient
            initialOrganisations={data.organisations}
            initialTotal={data.total}
        />
    );
}