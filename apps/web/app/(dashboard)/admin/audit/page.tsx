'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiGet } from '@/lib/api/client';
import { useEffect, useState } from 'react';

interface AuditEntry {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    userEmail?: string;
    metadata: any;
    createdAt: string;
}

interface AuditData {
    entries: AuditEntry[];
    total: number;
    page: number;
    limit: number;
}

export default function AdminAuditPage() {
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchAudit = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await apiGet<AuditData>('/admin/audit');
                setEntries(data.entries || []);
                setTotal(data.total || 0);
            } catch (err) {
                console.error('Failed to fetch audit log:', err);
                setError('Failed to load audit log');
            } finally {
                setLoading(false);
            }
        };

        fetchAudit();
    }, []);

    const getActionBadgeVariant = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create': return 'default';
            case 'update': return 'secondary';
            case 'delete': return 'destructive';
            case 'login': return 'outline';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold tracking-tight">Global Audit Log</h1>
                    <div className="animate-pulse">
                        <Card>
                            <CardHeader>
                                <div className="h-4 bg-muted rounded w-1/4"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="h-4 bg-muted rounded w-full"></div>
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold tracking-tight">Global Audit Log</h1>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold mb-2">Error</h2>
                                <p className="text-muted-foreground">{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Global Audit Log</h1>
                    <p className="text-muted-foreground">
                        System-wide audit trail for administrative actions ({total} entries)
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Audit Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {entries.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No audit entries found</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Entity</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entries.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="font-mono text-sm">
                                                {new Date(entry.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getActionBadgeVariant(entry.action)}>
                                                    {entry.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium">{entry.entityType}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">
                                                        {entry.entityId}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium">
                                                        {entry.userEmail || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground font-mono">
                                                        {entry.userId}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <details className="text-xs">
                                                    <summary className="cursor-pointer text-muted-foreground">
                                                        Show metadata
                                                    </summary>
                                                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                                        {JSON.stringify(entry.metadata, null, 2)}
                                                    </pre>
                                                </details>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}