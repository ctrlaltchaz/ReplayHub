'use client';

import { apiGet } from '@/lib/api';
import { useEffect, useState } from 'react';
import GlobalUsersClient from './GlobalUsersClient';

interface GlobalUser {
    id: string;
    email: string;
    name?: string;
    isGlobalAdmin: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

interface GlobalUsersData {
    users: GlobalUser[];
    total: number;
    page: number;
    limit: number;
}

export default function GlobalUsersPage() {
    const [users, setUsers] = useState<GlobalUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                // Use real API now that endpoints are implemented
                const data = await apiGet<GlobalUsersData>('/admin/global-users');

                setUsers(data.users);
                setTotal(data.total);
            } catch (err) {
                console.error('Failed to fetch global users:', err);

                // Fallback to mock data if API fails (for development)
                const mockData: GlobalUsersData = {
                    users: [
                        {
                            id: '1',
                            email: 'admin@example.com',
                            name: 'System Administrator',
                            isGlobalAdmin: true,
                            lastLoginAt: new Date().toISOString(),
                            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                            updatedAt: new Date().toISOString(),
                            isActive: true
                        },
                        {
                            id: '2',
                            email: 'user@example.com',
                            name: 'Test User',
                            isGlobalAdmin: false,
                            lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                            isActive: true
                        },
                        {
                            id: '3',
                            email: 'inactive@example.com',
                            name: 'Inactive User',
                            isGlobalAdmin: false,
                            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                            updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                            isActive: false
                        }
                    ],
                    total: 3,
                    page: 1,
                    limit: 10
                };

                setUsers(mockData.users);
                setTotal(mockData.total);
                setError('API unavailable, using mock data');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []); if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold tracking-tight font-montserrat">Global Users</h1>
                    <div className="animate-pulse">
                        <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
                        <div className="grid gap-6 md:grid-cols-3 mb-6">
                            <div className="h-24 bg-muted rounded"></div>
                            <div className="h-24 bg-muted rounded"></div>
                            <div className="h-24 bg-muted rounded"></div>
                        </div>
                        <div className="h-64 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold tracking-tight font-montserrat">Global Users</h1>
                    <div className="text-center p-8">
                        <h2 className="text-xl font-semibold mb-2 font-montserrat">Error</h2>
                        <p className="text-muted-foreground font-montserrat">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return <GlobalUsersClient initialUsers={users} initialTotal={total} />;
}