'use client';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useApiQuery } from '@/lib/api/query';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: string;
    resource: string;
    details?: string;
}

interface AuditLogResponse {
    audits: AuditLogEntry[];
    total: number;
    page: number;
    totalPages: number;
}

export function AdminAuditLog() {
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data, isLoading } = useApiQuery<AuditLogResponse>(
        `/admin/audit?page=${page}&limit=${limit}`,
        {
            staleTime: 10 * 1000, // 10 seconds
        }
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const totalPages = data?.totalPages || 1;
    const canGoPrevious = page > 1;
    const canGoNext = page < totalPages;

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Resource</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : !data?.audits || data.audits.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No audit logs found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.audits.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-mono text-sm">
                                        {new Date(entry.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{entry.userName}</TableCell>
                                    <TableCell>
                                        <code className="px-2 py-1 bg-muted rounded text-sm">
                                            {entry.action}
                                        </code>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{entry.resource}</TableCell>
                                    <TableCell className="max-w-md truncate text-muted-foreground">
                                        {entry.details || '—'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {data?.audits?.length || 0} of {data?.total || 0} entries
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p - 1)}
                        disabled={!canGoPrevious}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <div className="text-sm">
                        Page {page} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!canGoNext}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
