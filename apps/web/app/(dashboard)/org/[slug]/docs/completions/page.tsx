'use client';

import { PermissionGuard } from '@/components/permissions/PermissionGuard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiUrl } from '@/lib/api/config';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import type { DocCompletion } from '@/types/docs';
import { ArrowLeft, BookOpen, Calendar, CheckCircle2, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MyCompletionsPage() {
    usePageTitle('My Completions');
    const params = useParams();
    const slug = params?.slug as string;

    const [completions, setCompletions] = useState<DocCompletion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCompletions = async () => {
            try {
                const response = await fetch(getApiUrl(`/org/${slug}/docs/my/completions`), {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch completions');
                }

                const data = await response.json();
                setCompletions(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompletions();
    }, [slug]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <PermissionGuard required="docs.view">
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/org/${slug}/docs`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Completions</h1>
                        <p className="text-muted-foreground">
                            Track your progress through the documentation
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-64" />
                                    <Skeleton className="h-4 w-32" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : error ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-destructive">Error</CardTitle>
                            <CardDescription>{error}</CardDescription>
                        </CardHeader>
                    </Card>
                ) : completions.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No completions yet</CardTitle>
                            <CardDescription>
                                Start reading documentation and mark tutorials as complete to track your
                                progress.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href={`/org/${slug}/docs`}>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Browse Documentation
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Completed
                                    </CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{completions.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Documentation articles
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Last Completed
                                    </CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {completions.length > 0
                                            ? new Date(
                                                completions[0].completedAt
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            })
                                            : 'N/A'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Most recent</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {
                                            completions.filter((c) => {
                                                const completedDate = new Date(c.completedAt);
                                                const now = new Date();
                                                return (
                                                    completedDate.getMonth() === now.getMonth() &&
                                                    completedDate.getFullYear() === now.getFullYear()
                                                );
                                            }).length
                                        }
                                    </div>
                                    <p className="text-xs text-muted-foreground">Completed this month</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Completed Documentation</h2>
                            {completions.map((completion) => (
                                <Card key={completion.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    {completion.doc?.title || 'Untitled Document'}
                                                </CardTitle>
                                                <CardDescription>
                                                    Completed on {formatDate(completion.completedAt)}
                                                </CardDescription>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/org/${slug}/docs/${completion.docId}`}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    View Document
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    {completion.notes && (
                                        <CardContent>
                                            <div className="rounded-lg bg-muted p-4">
                                                <p className="text-sm font-medium mb-1">Notes:</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {completion.notes}
                                                </p>
                                            </div>
                                        </CardContent>
                                    )}
                                    {completion.doc && (
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                                {completion.doc.difficulty && (
                                                    <Badge variant="outline">
                                                        {completion.doc.difficulty}
                                                    </Badge>
                                                )}
                                                {completion.doc.estimatedReadTime && (
                                                    <Badge variant="outline">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        {completion.doc.estimatedReadTime} min
                                                    </Badge>
                                                )}
                                                {completion.doc.category && (
                                                    <Badge variant="outline">
                                                        {completion.doc.category.icon}{' '}
                                                        {completion.doc.category.name}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </PermissionGuard>
    );
}
