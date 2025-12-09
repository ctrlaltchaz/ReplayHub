'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl } from '@/lib/api/config';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { ArrowLeft, Calendar, Clock, Edit, Tag, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGlobalDoc } from '../hooks/useGlobalDoc';

export default function GlobalDocViewPage() {
    const params = useParams();
    const router = useRouter();
    const docId = params?.docId as string;
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const { data: doc, isLoading } = useGlobalDoc(docId);

    usePageTitle(doc?.title || 'Loading...');

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this platform documentation? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(getApiUrl(`/admin/docs/${docId}`), {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete doc');
            }

            toast({
                title: 'Success',
                description: 'Platform documentation deleted successfully',
            });

            router.push('/admin/docs');
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
                    <Link href="/admin/docs">
                        <Button className="mt-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Docs
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const getDifficultyColor = (difficulty: string | null) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-500 text-white';
            case 'intermediate':
                return 'bg-yellow-500 text-white';
            case 'advanced':
                return 'bg-red-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/admin/docs">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Docs
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Link href={`/admin/docs/${docId}/edit`}>
                        <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>

            {/* Content */}
            <Card>
                <CardHeader>
                    <div className="space-y-4">
                        {/* Title */}
                        <div className="flex items-start justify-between">
                            <h1 className="text-4xl font-bold tracking-tight">{doc.title}</h1>
                        </div>

                        {/* Excerpt */}
                        {doc.excerpt && (
                            <p className="text-xl text-muted-foreground">{doc.excerpt}</p>
                        )}

                        {/* Metadata Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="border-blue-500 text-blue-500">
                                Platform Doc
                            </Badge>
                            {doc.status && (
                                <Badge
                                    variant={doc.status === 'published' ? 'default' : 'outline'}
                                    className={doc.status === 'draft' ? 'border-yellow-500 text-yellow-500' : ''}
                                >
                                    {doc.status}
                                </Badge>
                            )}
                            {doc.difficulty && (
                                <Badge className={getDifficultyColor(doc.difficulty)}>
                                    {doc.difficulty}
                                </Badge>
                            )}
                            {doc.category && (
                                <Badge variant="secondary">
                                    {doc.category.icon} {doc.category.name}
                                </Badge>
                            )}
                        </div>

                        {/* Metadata Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {doc.estimatedReadTime && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{doc.estimatedReadTime} min read</span>
                                </div>
                            )}
                            {doc.publishedAt && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        Published {new Date(doc.publishedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {doc.author && (
                                <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    <span>{doc.author.name || doc.author.email}</span>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {doc.tags.map((tag) => (
                                    <Badge key={tag} variant="outline">
                                        <Tag className="mr-1 h-3 w-3" />
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Content - Rendered as Markdown/HTML */}
                    <div
                        className="prose prose-slate max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: doc.content }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
