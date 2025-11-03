'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Clock,
    Edit,
    FileText,
    Loader2,
    Tag,
    Trash2,
    User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { IncidentDialog } from '../components/IncidentDialog';
import { useDeleteIncident } from '../hooks/useDeleteIncident';
import { useIncident } from '../hooks/useIncident';

const categoryColors = {
    tech: 'bg-blue-100 text-blue-800 border-blue-200',
    comms: 'bg-purple-100 text-purple-800 border-purple-200',
    people: 'bg-green-100 text-green-800 border-green-200',
    safety: 'bg-red-100 text-red-800 border-red-200',
    other: 'bg-gray-100 text-gray-800 border-gray-200',
};

const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
};

const statusColors = {
    open: 'bg-red-100 text-red-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    dismissed: 'bg-gray-100 text-gray-800',
};

export default function IncidentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const orgSlug = params?.slug as string;
    const incidentId = params?.id as string;

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const { data: incident, isLoading, error } = useIncident(orgSlug, incidentId);
    const deleteMutation = useDeleteIncident(orgSlug);

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(incidentId);
            toast({
                title: 'Incident deleted',
                description: 'The incident has been deleted successfully.',
            });
            router.push(`/org/${orgSlug}/incidents`);
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to delete incident',
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

    if (error || !incident) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Incident Not Found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {error instanceof Error ? error.message : 'The incident could not be found.'}
                        </p>
                        <Link href={`/org/${orgSlug}/incidents`}>
                            <Button>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Incidents
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href={`/org/${orgSlug}/incidents`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Incidents
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(true)}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setDeleteConfirmOpen(true)}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className={categoryColors[incident.category]}>
                                        {incident.category}
                                    </Badge>
                                    <Badge variant="outline" className={severityColors[incident.severity]}>
                                        {incident.severity}
                                    </Badge>
                                    <Badge variant="outline" className={statusColors[incident.status]}>
                                        {incident.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl">{incident.title}</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Description */}
                        {incident.description && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Description
                                </h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {incident.description}
                                </p>
                            </div>
                        )}

                        <Separator />

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Event */}
                            {incident.event && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Related Event
                                    </h3>
                                    <Link
                                        href={`/org/${orgSlug}/events/${incident.event.id}`}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        {incident.event.title}
                                    </Link>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDate(incident.event.startAt)}
                                    </p>
                                </div>
                            )}

                            {/* Owner */}
                            {incident.owner && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Assigned Owner
                                    </h3>
                                    <p className="text-sm">{incident.owner.displayName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {incident.owner.email}
                                    </p>
                                </div>
                            )}

                            {/* Created By */}
                            <div>
                                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Reported By
                                </h3>
                                <p className="text-sm">
                                    {incident.createdByUser?.displayName || 'Unknown'}
                                </p>
                                {incident.createdByUser?.email && (
                                    <p className="text-xs text-muted-foreground">
                                        {incident.createdByUser.email}
                                    </p>
                                )}
                            </div>

                            {/* Timestamps */}
                            <div>
                                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Timeline
                                </h3>
                                <div className="space-y-1 text-sm">
                                    <p>
                                        <span className="text-muted-foreground">Created:</span>{' '}
                                        {formatDate(incident.createdAt)}
                                    </p>
                                    <p>
                                        <span className="text-muted-foreground">Updated:</span>{' '}
                                        {formatDate(incident.updatedAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {incident.tags && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        Tags
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{incident.tags}</p>
                                </div>
                            </>
                        )}

                        {/* RCA */}
                        {incident.rcaJson && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="text-sm font-semibold mb-2">
                                        Root Cause Analysis
                                    </h3>
                                    <pre className="text-sm text-muted-foreground bg-muted p-4 rounded-md overflow-x-auto">
                                        {JSON.stringify(incident.rcaJson, null, 2)}
                                    </pre>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Edit Dialog */}
            <IncidentDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                mode="edit"
                orgSlug={orgSlug}
                incident={incident}
            />

            {/* Delete Confirmation Dialog */}
            {deleteConfirmOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                                Delete Incident
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Are you sure you want to delete this incident? This action cannot be undone.
                            </p>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteConfirmOpen(false)}
                                    disabled={deleteMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
