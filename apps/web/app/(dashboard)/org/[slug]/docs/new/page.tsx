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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl } from '@/lib/api/config';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import type { CreateDocDto } from '@/types/docs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDocCategories } from '../hooks/useDocCategories';

export default function NewDocPage() {
    usePageTitle('New Documentation');
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: categories } = useDocCategories(slug);

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

    const [tagsInput, setTagsInput] = useState('');

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
            const response = await fetch(getApiUrl(`/org/${slug}/docs`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create doc');
            }

            const { doc } = await response.json();

            toast({
                title: 'Success',
                description: 'Documentation created successfully',
            });

            router.push(`/org/${slug}/docs/${doc.id}`);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create doc',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <Link href={`/org/${slug}/docs`}>
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Docs
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">New Documentation</h1>
                <p className="text-muted-foreground">
                    Create a new tutorial or guide for your organization
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., How to set up a tournament"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Summary *</Label>
                            <Textarea
                                id="excerpt"
                                placeholder="Brief description of this document"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                rows={3}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
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

                        <div className="grid gap-4 md:grid-cols-2">
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
                                    min="1"
                                    placeholder="e.g., 5"
                                    value={formData.estimated_read_time || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            estimated_read_time: e.target.value ? parseInt(e.target.value) : undefined,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                                id="tags"
                                placeholder="e.g., tournaments, setup, advanced"
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Content *</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RichTextEditor
                            content={formData.content}
                            onChange={(content) => setFormData({ ...formData, content })}
                            placeholder="Write your documentation content here..."
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Publishing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="publish"
                                checked={formData.status === 'published'}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        status: checked ? 'published' : 'draft',
                                    })
                                }
                            />
                            <Label htmlFor="publish" className="cursor-pointer">
                                Publish immediately (uncheck to save as draft)
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Link href={`/org/${slug}/docs`}>
                        <Button type="button" variant="outline" disabled={isSubmitting}>
                            Cancel
                        </Button>
                    </Link>
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
            </form>
        </div>
    );
}
