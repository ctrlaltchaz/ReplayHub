'use client';

import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl } from '@/lib/api/config';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import type { UpdateDocDto } from '@/types/docs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDoc } from '../../hooks/useDoc';
import { useDocCategories } from '../../hooks/useDocCategories';

export default function EditDocPage() {
    usePageTitle('Edit Documentation');
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const docId = params?.docId as string;
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: doc, isLoading: docLoading } = useDoc(slug, docId);
    const { data: categories } = useDocCategories(slug);

    const [formData, setFormData] = useState<UpdateDocDto>({
        title: '',
        content: '',
        excerpt: '',
        category_id: '',
        status: 'draft',
        difficulty: undefined,
        estimated_read_time: undefined,
    });

    const [tagsInput, setTagsInput] = useState('');

    // Initialize form when doc loads
    useEffect(() => {
        if (doc) {
            setFormData({
                title: doc.title,
                content: doc.content,
                excerpt: doc.excerpt || '',
                category_id: doc.categoryId,
                status: doc.status,
                difficulty: doc.difficulty || undefined,
                estimated_read_time: doc.estimatedReadTime || undefined,
            });
            setTagsInput((doc.tags || []).join(', '));
        }
    }, [doc]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(getApiUrl(`/org/${slug}/docs/${docId}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update documentation');
            }

            toast({
                title: 'Success',
                description: 'Documentation updated successfully',
            });

            router.push(`/org/${slug}/docs/${docId}`);
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to update documentation',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (docLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-8 w-64" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="space-y-6 p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Document not found</h2>
                    <p className="text-muted-foreground mt-2">
                        The document you're looking for doesn't exist or you don't have permission to edit it.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href={`/org/${slug}/docs`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Documentation
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Only allow editing org docs, not global platform docs
    if (doc.organisationId === null) {
        return (
            <div className="space-y-6 p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Cannot edit platform documentation</h2>
                    <p className="text-muted-foreground mt-2">
                        Platform documentation can only be edited by global administrators.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href={`/org/${slug}/docs/${docId}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Document
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/org/${slug}/docs/${docId}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Documentation</h1>
                    <p className="text-muted-foreground">Update your organization's documentation</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Document Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="Getting Started with the Platform"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Summary *</Label>
                            <Textarea
                                id="excerpt"
                                value={formData.excerpt}
                                onChange={(e) =>
                                    setFormData({ ...formData, excerpt: e.target.value })
                                }
                                placeholder="A brief overview of what this document covers..."
                                rows={3}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content *</Label>
                            <RichTextEditor
                                content={formData.content || ''}
                                onChange={(content) => setFormData({ ...formData, content })}
                                placeholder="Write your documentation content here..."
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category_id}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, category_id: value })
                                    }
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories
                                            ?.filter((cat) => cat.organisationId !== null)
                                            .map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <Select
                                    value={formData.difficulty || ''}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            difficulty: value as 'beginner' | 'intermediate' | 'advanced',
                                        })
                                    }
                                >
                                    <SelectTrigger id="difficulty">
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags</Label>
                                <Input
                                    id="tags"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                    placeholder="tutorial, setup, advanced (comma-separated)"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="readTime">Estimated Read Time (minutes)</Label>
                                <Input
                                    id="readTime"
                                    type="number"
                                    min="1"
                                    value={formData.estimated_read_time || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            estimated_read_time: e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined,
                                        })
                                    }
                                    placeholder="5"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="published"
                                checked={formData.status === 'published'}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        status: checked ? 'published' : 'draft',
                                    })
                                }
                            />
                            <Label htmlFor="published">Publish this document</Label>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Documentation
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/org/${slug}/docs/${docId}`)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
