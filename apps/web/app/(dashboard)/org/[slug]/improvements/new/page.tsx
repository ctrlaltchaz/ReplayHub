'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import type {
    CreateImprovementDto,
    ImpactLevel,
    ImprovementCategory,
    ImprovementPriority,
    PlatformType
} from '@/types/improvement';
import { ArrowLeft, Lightbulb, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateImprovement } from '../hooks/useCreateImprovement';

const categoryLabels: Record<ImprovementCategory, string> = {
    stream_production: 'Stream Production',
    broadcast_technical: 'Broadcast Technical',
    event_operations: 'Event Operations',
    communication: 'Communication',
    content_quality: 'Content Quality',
    viewer_experience: 'Viewer Experience',
    equipment: 'Equipment',
    process: 'Process',
    social_media: 'Social Media',
};

export default function NewImprovementPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const orgSlug = params?.slug as string;
    const createMutation = useCreateImprovement(orgSlug);

    const [formData, setFormData] = useState<CreateImprovementDto>({
        title: '',
        description: '',
        category: 'stream_production',
        priority: 'medium',
        whatWentWrong: '',
        proposedSolution: '',
        vodUrl: '',
        vodTimestamp: '',
        screenshotUrl: '',
        platformType: undefined,
        postUrl: '',
        impactLevel: undefined,
        tags: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length > 200) {
            newErrors.title = 'Title must be less than 200 characters';
        }

        if (formData.vodUrl && !formData.vodUrl.match(/^https?:\/\/.+/)) {
            newErrors.vodUrl = 'VOD URL must be a valid URL';
        }

        if (formData.postUrl && !formData.postUrl.match(/^https?:\/\/.+/)) {
            newErrors.postUrl = 'Post URL must be a valid URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const dto: CreateImprovementDto = {
                title: formData.title.trim(),
                description: formData.description?.trim() || undefined,
                category: formData.category,
                priority: formData.priority,
                whatWentWrong: formData.whatWentWrong?.trim() || undefined,
                proposedSolution: formData.proposedSolution?.trim() || undefined,
                vodUrl: formData.vodUrl?.trim() || undefined,
                vodTimestamp: formData.vodTimestamp?.trim() || undefined,
                screenshotUrl: formData.screenshotUrl?.trim() || undefined,
                platformType: formData.platformType || undefined,
                postUrl: formData.postUrl?.trim() || undefined,
                impactLevel: formData.impactLevel || undefined,
                tags: formData.tags?.trim() || undefined,
            };

            const result = await createMutation.mutateAsync(dto);
            toast({
                title: 'Improvement logged',
                description: 'The improvement has been logged successfully.',
            });
            router.push(`/org/${orgSlug}/improvements/${result.id}`);
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            });
        }
    };

    const isSocialMedia = formData.category === 'social_media';

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <Link href={`/org/${orgSlug}/improvements`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Improvements
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Lightbulb className="w-8 h-8" />
                    Log New Improvement
                </h1>
                <p className="text-muted-foreground mt-2">
                    Document what went wrong and how we can improve for next time.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Provide a clear title and description of the improvement
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="Brief description of the issue"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                disabled={createMutation.isPending}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">{errors.title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Additional context about what happened..."
                                className="min-h-[100px]"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                disabled={createMutation.isPending}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value: ImprovementCategory) =>
                                        setFormData({ ...formData, category: value })
                                    }
                                    disabled={createMutation.isPending}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(categoryLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value: ImprovementPriority) =>
                                        setFormData({ ...formData, priority: value })
                                    }
                                    disabled={createMutation.isPending}
                                >
                                    <SelectTrigger id="priority">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="impactLevel">Impact Level</Label>
                            <Select
                                value={formData.impactLevel || 'none'}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        impactLevel: value === 'none' ? undefined : (value as ImpactLevel)
                                    })
                                }
                                disabled={createMutation.isPending}
                            >
                                <SelectTrigger id="impactLevel">
                                    <SelectValue placeholder="Select impact level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Not specified</SelectItem>
                                    <SelectItem value="viewer_facing">Viewer Facing</SelectItem>
                                    <SelectItem value="internal">Internal</SelectItem>
                                    <SelectItem value="minimal">Minimal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* What Went Wrong & Solutions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Analysis & Solution</CardTitle>
                        <CardDescription>
                            Describe what went wrong and how to improve
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="whatWentWrong">What Went Wrong?</Label>
                            <Textarea
                                id="whatWentWrong"
                                placeholder="Describe the problem or issue that occurred..."
                                className="min-h-[100px]"
                                value={formData.whatWentWrong}
                                onChange={(e) =>
                                    setFormData({ ...formData, whatWentWrong: e.target.value })
                                }
                                disabled={createMutation.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="proposedSolution">Proposed Solution</Label>
                            <Textarea
                                id="proposedSolution"
                                placeholder="How can we prevent this from happening again?"
                                className="min-h-[100px]"
                                value={formData.proposedSolution}
                                onChange={(e) =>
                                    setFormData({ ...formData, proposedSolution: e.target.value })
                                }
                                disabled={createMutation.isPending}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* VOD/Media References */}
                <Card>
                    <CardHeader>
                        <CardTitle>VOD & Media References</CardTitle>
                        <CardDescription>
                            Link to VODs or screenshots showing the issue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="vodUrl">VOD URL</Label>
                            <Input
                                id="vodUrl"
                                type="url"
                                placeholder="https://twitch.tv/videos/..."
                                value={formData.vodUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, vodUrl: e.target.value })
                                }
                                disabled={createMutation.isPending}
                            />
                            {errors.vodUrl && (
                                <p className="text-sm text-red-500">{errors.vodUrl}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vodTimestamp">VOD Timestamp</Label>
                            <Input
                                id="vodTimestamp"
                                placeholder="e.g., 1h 23m 45s or 01:23:45"
                                value={formData.vodTimestamp}
                                onChange={(e) =>
                                    setFormData({ ...formData, vodTimestamp: e.target.value })
                                }
                                disabled={createMutation.isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter timestamp in any format (e.g., "1:23:45", "1h 23m", "5400s")
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="screenshotUrl">Screenshot URL</Label>
                            <Input
                                id="screenshotUrl"
                                type="url"
                                placeholder="https://..."
                                value={formData.screenshotUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, screenshotUrl: e.target.value })
                                }
                                disabled={createMutation.isPending}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media (conditional) */}
                {isSocialMedia && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Social Media Details</CardTitle>
                            <CardDescription>
                                Provide details about the social media post
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="platformType">Platform</Label>
                                <Select
                                    value={formData.platformType || 'none'}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            platformType: value === 'none' ? undefined : (value as PlatformType)
                                        })
                                    }
                                    disabled={createMutation.isPending}
                                >
                                    <SelectTrigger id="platformType">
                                        <SelectValue placeholder="Select platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Not specified</SelectItem>
                                        <SelectItem value="twitter">Twitter/X</SelectItem>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="tiktok">TikTok</SelectItem>
                                        <SelectItem value="youtube">YouTube</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postUrl">Post URL</Label>
                                <Input
                                    id="postUrl"
                                    type="url"
                                    placeholder="https://twitter.com/..."
                                    value={formData.postUrl}
                                    onChange={(e) =>
                                        setFormData({ ...formData, postUrl: e.target.value })
                                    }
                                    disabled={createMutation.isPending}
                                />
                                {errors.postUrl && (
                                    <p className="text-sm text-red-500">{errors.postUrl}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Additional Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <Input
                                id="tags"
                                placeholder="stream, audio, overlay (comma-separated)"
                                value={formData.tags}
                                onChange={(e) =>
                                    setFormData({ ...formData, tags: e.target.value })
                                }
                                disabled={createMutation.isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                Add comma-separated tags to help categorize this improvement
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={createMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Log Improvement
                    </Button>
                </div>
            </form>
        </div>
    );
}
