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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl } from '@/lib/api/config';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import type { UpdateDocDto } from '@/types/docs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGlobalDoc } from '../../hooks/useGlobalDoc';
import { useGlobalDocCategories } from '../../hooks/useGlobalDocCategories';

export default function EditGlobalDocPage() {
    const params = useParams();
    const router = useRouter();
    const docId = params?.docId as string;
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: doc, isLoading } = useGlobalDoc(docId);
    const { data: categories } = useGlobalDocCategories();

    usePageTitle(doc ? `Edit ${doc.title}` : 'Loading...');

    const [formData, setFormData] = useState<UpdateDocDto>({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        category_id: '',
        status: 'draft',
        difficulty: undefined,
        estimated_read_time: undefined,
    });

    useEffect(() => {
        if (doc) {
            setFormData({
                title: doc.title,
                slug: '', // Slug is not returned from API, keep empty
                content: doc.content,
                excerpt: doc.excerpt || '',
                category_id: doc.categoryId,
                status: doc.status,
                difficulty: doc.difficulty || undefined,
                estimated_read_time: doc.estimatedReadTime || undefined,
            });
        }
    }, [doc]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title?.trim()) {
            toast({ title: 'Error', description: 'Title is required', variant: 'destructive' });
            return;
        }

        if (!formData.content?.trim()) {
            toast({ title: 'Error', description: 'Content is required', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(getApiUrl(`/admin/docs/${docId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update doc');
            }

            toast({
                title: 'Success',
                description: 'Platform documentation updated successfully',
            });

            router.push(`/admin/docs/${docId}`);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update documentation',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Doc not found</h2>
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

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href={`/admin/docs/${docId}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Doc
                        </Button>
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">Edit Platform Documentation</h1>
                    <p className="text-muted-foreground">
                        Update global documentation visible to all organizations
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Documentation Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Getting Started Guide"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug *</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="getting-started-guide"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Excerpt</Label>
                            <Textarea
                                id="excerpt"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                placeholder="Brief summary..."
                                rows={2}
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
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.icon} {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: any) =>
                                        setFormData({ ...formData, status: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <Select
                                    value={formData.difficulty || ''}
                                    onValueChange={(value: any) =>
                                        setFormData({ ...formData, difficulty: value || undefined })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="readTime">Estimated Read Time (minutes)</Label>
                                <Input
                                    id="readTime"
                                    type="number"
                                    value={formData.estimated_read_time || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            estimated_read_time: e.target.value ? parseInt(e.target.value) : undefined,
                                        })
                                    }
                                    placeholder="5"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content *</Label>
                            <RichTextEditor
                                content={formData.content || ''}
                                onChange={(content) => setFormData({ ...formData, content })}
                                placeholder="Write your documentation content here..."
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Documentation'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
