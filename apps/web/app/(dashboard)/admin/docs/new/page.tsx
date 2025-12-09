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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl } from '@/lib/api/config';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import type { CreateDocDto } from '@/types/docs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGlobalDocCategories } from '../hooks/useGlobalDocCategories';

export default function NewGlobalDocPage() {
    usePageTitle('New Platform Documentation');
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: categories } = useGlobalDocCategories();

    const [formData, setFormData] = useState<CreateDocDto>({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        category_id: '',
        status: 'draft',
        difficulty: undefined,
        estimated_read_time: undefined,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast({ title: 'Error', description: 'Title is required', variant: 'destructive' });
            return;
        }

        if (!formData.content.trim()) {
            toast({ title: 'Error', description: 'Content is required', variant: 'destructive' });
            return;
        }

        if (!formData.category_id) {
            toast({ title: 'Error', description: 'Category is required', variant: 'destructive' });
            return;
        }

        // Generate slug from title if not provided
        const slug_value = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        if (!slug_value) {
            toast({ title: 'Error', description: 'Slug is required', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(getApiUrl('/admin/docs'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    slug: slug_value,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create doc');
            }

            const { doc } = await response.json();

            toast({
                title: 'Success',
                description: 'Platform documentation created successfully',
            });

            router.push(`/admin/docs/${doc.id}`);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create documentation',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/docs">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Docs
                        </Button>
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">New Platform Documentation</h1>
                    <p className="text-muted-foreground">
                        Create global documentation visible to all organizations
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
                                placeholder="getting-started-guide (auto-generated from title if empty)"
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
                                content={formData.content}
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
                                        Creating...
                                    </>
                                ) : (
                                    'Create Documentation'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
