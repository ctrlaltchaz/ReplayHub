'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions/utils';
import type {
    ImpactLevel,
    ImprovementCategory,
    ImprovementPriority,
    ImprovementStatus
} from '@/types/improvement';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    ExternalLink,
    Lightbulb,
    Loader2,
    Play,
    Tag,
    Trash2,
    User,
    Video
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDeleteImprovement } from '../hooks/useDeleteImprovement';
import { useImprovement } from '../hooks/useImprovement';

const categoryColors: Record<ImprovementCategory, string> = {
    stream_production: 'bg-purple-100 text-purple-800 border-purple-200',
    broadcast_technical: 'bg-blue-100 text-blue-800 border-blue-200',
    event_operations: 'bg-green-100 text-green-800 border-green-200',
    communication: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    content_quality: 'bg-pink-100 text-pink-800 border-pink-200',
    viewer_experience: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    equipment: 'bg-orange-100 text-orange-800 border-orange-200',
    process: 'bg-teal-100 text-teal-800 border-teal-200',
    social_media: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

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

const priorityColors: Record<ImprovementPriority, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
};

const statusColors: Record<ImprovementStatus, string> = {
    proposed: 'bg-gray-100 text-gray-800',
    accepted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    implemented: 'bg-green-100 text-green-800',
    dismissed: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<ImprovementStatus, string> = {
    proposed: 'Proposed',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    implemented: 'Implemented',
    dismissed: 'Dismissed',
};

const impactLabels: Record<ImpactLevel, string> = {
    viewer_facing: 'Viewer Facing',
    internal: 'Internal',
    minimal: 'Minimal',
};

export default function ImprovementDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { hasPermission } = usePermissions();
    const orgSlug = params?.slug as string;
    const improvementId = params?.id as string;

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const { data: improvement, isLoading, error } = useImprovement(orgSlug, improvementId);
    const deleteMutation = useDeleteImprovement(orgSlug);

    const canEdit = hasPermission(PERMISSIONS.IMPROVEMENTS_EDIT);
    const canDelete = hasPermission(PERMISSIONS.IMPROVEMENTS_DELETE);

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(improvementId);
            toast({
                title: 'Improvement deleted',
                description: 'The improvement has been deleted successfully.',
            });
            router.push(`/org/${orgSlug}/improvements`);
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to delete improvement',
                variant: 'destructive',
            });
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error || !improvement) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Lightbulb className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Improvement Not Found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {error instanceof Error ? error.message : 'The improvement could not be found.'}
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

    const tags = improvement.tags ? improvement.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href={`/org/${orgSlug}/improvements`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Improvements
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        {canEdit && (
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/org/${orgSlug}/improvements/${improvementId}/edit`)}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                variant="destructive"
                                onClick={() => setDeleteConfirmOpen(true)}
                                disabled={deleteMutation.isPending}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Dialog */}
                {deleteConfirmOpen && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2">Delete Improvement?</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Are you sure you want to delete this improvement? This action cannot be undone.
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 mr-2" />
                                    )}
                                    Delete
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteConfirmOpen(false)}
                                    disabled={deleteMutation.isPending}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Title and Badges */}
                <div>
                    <h1 className="text-3xl font-bold mb-3">{improvement.title}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={categoryColors[improvement.category]}>
                            {categoryLabels[improvement.category]}
                        </Badge>
                        <Badge className={priorityColors[improvement.priority]}>
                            {improvement.priority} priority
                        </Badge>
                        <Badge className={statusColors[improvement.status]}>
                            {statusLabels[improvement.status]}
                        </Badge>
                        {improvement.impactLevel && (
                            <Badge variant="outline">
                                {impactLabels[improvement.impactLevel]}
                            </Badge>
                        )}
                        {improvement.vodUrl && (
                            <Badge variant="outline" className="gap-1">
                                <Video className="w-3 h-3" />
                                VOD Available
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Description */}
                {improvement.description && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {improvement.description}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* What Went Wrong */}
                    {improvement.whatWentWrong && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">What Went Wrong</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {improvement.whatWentWrong}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Proposed Solution */}
                    {improvement.proposedSolution && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Proposed Solution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {improvement.proposedSolution}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Root Cause */}
                    {improvement.rootCause && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Root Cause</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {improvement.rootCause}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actual Solution */}
                    {improvement.actualSolution && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    Actual Solution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {improvement.actualSolution}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Prevention Steps */}
                    {improvement.preventionSteps && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Prevention Steps</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {improvement.preventionSteps}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* VOD & Media */}
                {(improvement.vodUrl || improvement.screenshotUrl) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Video className="w-5 h-5" />
                                VOD & Media References
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {improvement.vodUrl && (
                                <div className="flex items-center gap-2">
                                    <Play className="w-4 h-4 text-muted-foreground" />
                                    <a
                                        href={improvement.vodUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        Watch VOD
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                    {improvement.vodTimestamp && (
                                        <span className="text-sm text-muted-foreground">
                                            @ {improvement.vodTimestamp}
                                        </span>
                                    )}
                                </div>
                            )}
                            {improvement.screenshotUrl && (
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    <a
                                        href={improvement.screenshotUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        View Screenshot
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Social Media (if applicable) */}
                {improvement.category === 'social_media' && (improvement.platformType || improvement.postUrl) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Social Media Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {improvement.platformType && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Platform:</span>
                                    <Badge variant="outline" className="capitalize">
                                        {improvement.platformType}
                                    </Badge>
                                </div>
                            )}
                            {improvement.postUrl && (
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    <a
                                        href={improvement.postUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        View Post
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Metadata */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {improvement.reporter && (
                                <div className="flex items-start gap-2">
                                    <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Reported By</div>
                                        <div className="text-sm text-muted-foreground">
                                            {improvement.reporter.displayName}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {improvement.assignee && (
                                <div className="flex items-start gap-2">
                                    <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Assigned To</div>
                                        <div className="text-sm text-muted-foreground">
                                            {improvement.assignee.displayName}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {improvement.implementer && (
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Implemented By</div>
                                        <div className="text-sm text-muted-foreground">
                                            {improvement.implementer.displayName}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {improvement.event && (
                                <div className="flex items-start gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Related Event</div>
                                        <div className="text-sm text-muted-foreground">
                                            {improvement.event.title}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {improvement.occurredAt && (
                                <div className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Occurred At</div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatDate(improvement.occurredAt)}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {improvement.implementedAt && (
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Implemented At</div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatDate(improvement.implementedAt)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator className="my-4" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Created:</span>{' '}
                                {formatDate(improvement.createdAt)}
                            </div>
                            <div>
                                <span className="text-muted-foreground">Last Updated:</span>{' '}
                                {formatDate(improvement.updatedAt)}
                            </div>
                        </div>

                        {tags.length > 0 && (
                            <>
                                <Separator className="my-4" />
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Tag className="w-4 h-4 text-muted-foreground" />
                                    {tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
