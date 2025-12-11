'use client';

import { PermissionGuard } from '@/components/permissions/PermissionGuard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl, getServerUrl } from '@/lib/api/config';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { ArrowLeft, CheckCircle2, Clock, Edit, Tag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDoc } from '../hooks/useDoc';

export default function DocViewPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const docId = params?.docId as string;
    const { toast } = useToast();
    const [markingComplete, setMarkingComplete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data: doc, isLoading } = useDoc(slug, docId);

    usePageTitle(doc?.title || 'Loading...');

    // Debug: Log the doc data
    if (doc) {
        console.log('Doc data:', doc);
        console.log('Author:', (doc as any).author);
        console.log('Created at:', (doc as any).created_at);
    }

    const handleMarkComplete = async () => {
        setMarkingComplete(true);
        try {
            const response = await fetch(getApiUrl(`/org/${slug}/docs/${docId}/complete`), {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to mark as complete');
            }

            toast({
                title: 'Tutorial completed!',
                description: 'This tutorial has been marked as completed.',
            });

            // Refresh the doc data to show completion state
            window.location.reload();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to mark tutorial as complete',
                variant: 'destructive',
            });
        } finally {
            setMarkingComplete(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this documentation? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(getApiUrl(`/org/${slug}/docs/${docId}`), {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete doc');
            }

            toast({
                title: 'Success',
                description: 'Documentation deleted successfully',
            });

            router.push(`/org/${slug}/docs`);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete documentation',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Doc not found</h2>
                    <p className="mt-2 text-muted-foreground">
                        The documentation you're looking for doesn't exist.
                    </p>
                    <Link href={`/org/${slug}/docs`}>
                        <Button className="mt-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Docs
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const isGlobalDoc = (doc as any).organisation_id === null;
    const canEdit = !isGlobalDoc; // Only org docs can be edited by org users

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <Link href={`/org/${slug}/docs`}>
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Docs
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight">{doc.title}</h1>
                    {doc.excerpt && (
                        <p className="mt-2 text-lg text-muted-foreground">{doc.excerpt}</p>
                    )}

                    {/* Metadata */}
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {doc.difficulty && (
                            <Badge variant="outline" className="capitalize">
                                {doc.difficulty}
                            </Badge>
                        )}
                        {doc.estimatedReadTime && (
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{doc.estimatedReadTime} min read</span>
                            </div>
                        )}
                        {doc.category && (
                            <Badge variant="secondary">
                                {doc.category.icon} {doc.category.name}
                            </Badge>
                        )}
                        {isGlobalDoc && (
                            <Badge variant="outline" className="border-blue-500 text-blue-500">
                                Platform Doc
                            </Badge>
                        )}
                        {!doc.publishedAt && <Badge variant="outline">Draft</Badge>}
                    </div>

                    {/* Tags */}
                    {doc.tags && doc.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {doc.tags.map((tag) => (
                                <Badge key={tag} variant="outline">
                                    <Tag className="mr-1 h-3 w-3" />
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <PermissionGuard required="docs.completions.track">
                        <Button
                            onClick={handleMarkComplete}
                            disabled={markingComplete || (doc as any).is_completed}
                            variant={(doc as any).is_completed ? "secondary" : "default"}
                        >
                            {markingComplete ? (
                                'Marking...'
                            ) : (doc as any).is_completed ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Completed
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Mark Complete
                                </>
                            )}
                        </Button>
                    </PermissionGuard>
                    {canEdit && (
                        <>
                            <PermissionGuard required="docs.edit">
                                <Link href={`/org/${slug}/docs/${docId}/edit`}>
                                    <Button variant="outline">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                            </PermissionGuard>
                            <PermissionGuard required="docs.delete">
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </Button>
                            </PermissionGuard>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <Card>
                <CardContent className="pt-6">
                    <div
                        className="prose prose-slate max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: doc.content }}
                    />
                </CardContent>
            </Card>

            {/* Metadata Footer */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-6">
                        {/* Author */}
                        {doc.author && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-3">Author</p>
                                <div className="flex items-center gap-3">
                                    {(doc.author as any).avatar ? (
                                        <img
                                            src={`${getServerUrl()}${(doc.author as any).avatar}`}
                                            alt={doc.author.name || doc.author.email || 'Author'}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                                            {doc.author.name?.[0] || doc.author.email?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium">{doc.author.name || doc.author.email || 'Unknown Author'}</p>
                                        {doc.author.email && (
                                            <p className="text-sm text-muted-foreground">{doc.author.email}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                            {(doc as any).created_at && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Created</p>
                                    <p className="text-sm">{new Date((doc as any).created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</p>
                                </div>
                            )}
                            {(doc as any).updated_at && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Last Updated</p>
                                    <p className="text-sm">{new Date((doc as any).updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</p>
                                </div>
                            )}
                            {(doc as any).published_at && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Published</p>
                                    <p className="text-sm">{new Date((doc as any).published_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
