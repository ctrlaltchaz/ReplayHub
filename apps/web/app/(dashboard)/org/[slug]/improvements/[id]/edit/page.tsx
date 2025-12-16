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
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type {
    ImpactLevel,
    ImprovementCategory,
    ImprovementPriority,
    ImprovementStatus,
    PlatformType,
    UpdateImprovementDto
} from '@/types/improvement';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useImprovement } from '../../hooks/useImprovement';
import { useUpdateImprovement } from '../../hooks/useUpdateImprovement';

export default function EditImprovementPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const orgSlug = params?.slug as string;
    const improvementId = params?.id as string;

    const { data: improvement, isLoading } = useImprovement(orgSlug, improvementId);
    const updateMutation = useUpdateImprovement(orgSlug, improvementId);

    const [formData, setFormData] = useState<UpdateImprovementDto>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (improvement) {
            // Pre-populate form with existing data
            setFormData({
                title: improvement.title,
                description: improvement.description || '',
                category: improvement.category,
                priority: improvement.priority,
                status: improvement.status,
                impactLevel: improvement.impactLevel || undefined,
                whatWentWrong: improvement.whatWentWrong || '',
                proposedSolution: improvement.proposedSolution || '',
                actualSolution: improvement.actualSolution || '',
                rootCause: improvement.rootCause || '',
                preventionSteps: improvement.preventionSteps || '',
                vodUrl: improvement.vodUrl || '',
                vodTimestamp: improvement.vodTimestamp || '',
                screenshotUrl: improvement.screenshotUrl || '',
                platformType: improvement.platformType || undefined,
                postUrl: improvement.postUrl || '',
                tags: improvement.tags || '',
            });
        }
    }, [improvement]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title || formData.title.trim().length === 0) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length > 200) {
            newErrors.title = 'Title must be less than 200 characters';
        }

        if (formData.vodUrl && !formData.vodUrl.startsWith('http')) {
            newErrors.vodUrl = 'VOD URL must be a valid URL';
        }

        if (formData.screenshotUrl && !formData.screenshotUrl.startsWith('http')) {
            newErrors.screenshotUrl = 'Screenshot URL must be a valid URL';
        }

        if (formData.postUrl && !formData.postUrl.startsWith('http')) {
            newErrors.postUrl = 'Post URL must be a valid URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: 'Validation Error',
                description: 'Please fix the errors before submitting.',
                variant: 'destructive',
            });
            return;
        }

        try {
            // Remove empty strings and convert to undefined
            const cleanedData = Object.fromEntries(
                Object.entries(formData).filter(([_, v]) => v !== '' && v !== null)
            ) as UpdateImprovementDto;

            await updateMutation.mutateAsync(cleanedData);

            toast({
                title: 'Improvement updated',
                description: 'Your changes have been saved successfully.',
            });

            router.push(`/org/${orgSlug}/improvements/${improvementId}`);
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to update improvement',
                variant: 'destructive',
            });
        }
    };

    const handleCancel = () => {
        router.push(`/org/${orgSlug}/improvements/${improvementId}`);
    };

    const isSocialMedia = formData.category === 'social_media';

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (!improvement) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <h3 className="text-lg font-semibold mb-2">Improvement Not Found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            The improvement could not be found.
                        </p>
                        <Link href={`/org/${orgSlug}/improvements`}>
                            <Button>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Improvements
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <Link href={`/org/${orgSlug}/improvements/${improvementId}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Improvement
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold">Edit Improvement</h1>
                <p className="text-muted-foreground">Update the details of this improvement</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Core details about the improvement</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={formData.title || ''}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Brief description of the improvement"
                                maxLength={200}
                                disabled={updateMutation.isPending}
                            />
                            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed description (optional)"
                                rows={3}
                                disabled={updateMutation.isPending}
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
                                    disabled={updateMutation.isPending}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="stream_production">Stream Production</SelectItem>
                                        <SelectItem value="broadcast_technical">Broadcast Technical</SelectItem>
                                        <SelectItem value="event_operations">Event Operations</SelectItem>
                                        <SelectItem value="communication">Communication</SelectItem>
                                        <SelectItem value="content_quality">Content Quality</SelectItem>
                                        <SelectItem value="viewer_experience">Viewer Experience</SelectItem>
                                        <SelectItem value="equipment">Equipment</SelectItem>
                                        <SelectItem value="process">Process</SelectItem>
                                        <SelectItem value="social_media">Social Media</SelectItem>
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
                                    disabled={updateMutation.isPending}
                                >
                                    <SelectTrigger id="priority">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: ImprovementStatus) =>
                                        setFormData({ ...formData, status: value })
                                    }
                                    disabled={updateMutation.isPending}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="proposed">Proposed</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="implemented">Implemented</SelectItem>
                                        <SelectItem value="dismissed">Dismissed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="impactLevel">Impact Level</Label>
                                <Select
                                    value={formData.impactLevel || ''}
                                    onValueChange={(value: ImpactLevel | '') =>
                                        setFormData({
                                            ...formData,
                                            impactLevel: value === '' ? undefined : (value as ImpactLevel),
                                        })
                                    }
                                    disabled={updateMutation.isPending}
                                >
                                    <SelectTrigger id="impactLevel">
                                        <SelectValue placeholder="Select impact level (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        <SelectItem value="viewer_facing">Viewer Facing</SelectItem>
                                        <SelectItem value="internal">Internal</SelectItem>
                                        <SelectItem value="minimal">Minimal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Analysis & Solution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Analysis & Solution</CardTitle>
                        <CardDescription>What happened and how to fix it</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="whatWentWrong">What Went Wrong</Label>
                            <Textarea
                                id="whatWentWrong"
                                value={formData.whatWentWrong || ''}
                                onChange={e => setFormData({ ...formData, whatWentWrong: e.target.value })}
                                placeholder="Describe what went wrong..."
                                rows={4}
                                disabled={updateMutation.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="proposedSolution">Proposed Solution</Label>
                            <Textarea
                                id="proposedSolution"
                                value={formData.proposedSolution || ''}
                                onChange={e => setFormData({ ...formData, proposedSolution: e.target.value })}
                                placeholder="How should this be fixed or improved?"
                                rows={4}
                                disabled={updateMutation.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rootCause">Root Cause</Label>
                            <Textarea
                                id="rootCause"
                                value={formData.rootCause || ''}
                                onChange={e => setFormData({ ...formData, rootCause: e.target.value })}
                                placeholder="What was the underlying cause?"
                                rows={3}
                                disabled={updateMutation.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="actualSolution">Actual Solution (after implementation)</Label>
                            <Textarea
                                id="actualSolution"
                                value={formData.actualSolution || ''}
                                onChange={e => setFormData({ ...formData, actualSolution: e.target.value })}
                                placeholder="What was actually implemented?"
                                rows={4}
                                disabled={updateMutation.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="preventionSteps">Prevention Steps</Label>
                            <Textarea
                                id="preventionSteps"
                                value={formData.preventionSteps || ''}
                                onChange={e => setFormData({ ...formData, preventionSteps: e.target.value })}
                                placeholder="How can this be prevented in the future?"
                                rows={3}
                                disabled={updateMutation.isPending}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* VOD & Media */}
                <Card>
                    <CardHeader>
                        <CardTitle>VOD & Media References</CardTitle>
                        <CardDescription>Links to recordings and screenshots</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="vodUrl">VOD URL</Label>
                            <Input
                                id="vodUrl"
                                type="url"
                                value={formData.vodUrl || ''}
                                onChange={e => setFormData({ ...formData, vodUrl: e.target.value })}
                                placeholder="https://twitch.tv/videos/..."
                                disabled={updateMutation.isPending}
                            />
                            {errors.vodUrl && <p className="text-sm text-red-500">{errors.vodUrl}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vodTimestamp">VOD Timestamp</Label>
                            <Input
                                id="vodTimestamp"
                                value={formData.vodTimestamp || ''}
                                onChange={e => setFormData({ ...formData, vodTimestamp: e.target.value })}
                                placeholder="1:23:45 or 5035s"
                                disabled={updateMutation.isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: HH:MM:SS, MM:SS, or seconds (e.g., 1:23:45, 5035s)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="screenshotUrl">Screenshot URL</Label>
                            <Input
                                id="screenshotUrl"
                                type="url"
                                value={formData.screenshotUrl || ''}
                                onChange={e => setFormData({ ...formData, screenshotUrl: e.target.value })}
                                placeholder="https://..."
                                disabled={updateMutation.isPending}
                            />
                            {errors.screenshotUrl && (
                                <p className="text-sm text-red-500">{errors.screenshotUrl}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media (conditional) */}
                {isSocialMedia && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Social Media Details</CardTitle>
                            <CardDescription>Platform-specific information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="platformType">Platform</Label>
                                <Select
                                    value={formData.platformType || ''}
                                    onValueChange={(value: PlatformType | '') =>
                                        setFormData({
                                            ...formData,
                                            platformType: value === '' ? undefined : (value as PlatformType),
                                        })
                                    }
                                    disabled={updateMutation.isPending}
                                >
                                    <SelectTrigger id="platformType">
                                        <SelectValue placeholder="Select platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        <SelectItem value="twitter">Twitter</SelectItem>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                        <SelectItem value="tiktok">TikTok</SelectItem>
                                        <SelectItem value="youtube">YouTube</SelectItem>
                                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                                        <SelectItem value="discord">Discord</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postUrl">Post URL</Label>
                                <Input
                                    id="postUrl"
                                    type="url"
                                    value={formData.postUrl || ''}
                                    onChange={e => setFormData({ ...formData, postUrl: e.target.value })}
                                    placeholder="https://twitter.com/..."
                                    disabled={updateMutation.isPending}
                                />
                                {errors.postUrl && <p className="text-sm text-red-500">{errors.postUrl}</p>}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Additional Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Details</CardTitle>
                        <CardDescription>Tags and metadata</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <Input
                                id="tags"
                                value={formData.tags || ''}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="audio, overlay, timing (comma-separated)"
                                disabled={updateMutation.isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                Separate multiple tags with commas
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateMutation.isPending}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
