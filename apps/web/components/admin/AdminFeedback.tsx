'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    AlertCircle,
    Bug,
    CheckCircle,
    Clock,
    Lightbulb,
    Loader2,
    MessageSquare,
    Search,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface FeedbackSubmission {
    id: string;
    type: 'BUG' | 'SUGGESTION';
    title: string;
    description: string;
    category?: string;
    status: 'PENDING' | 'REVIEWING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    comments: FeedbackComment[];
}

interface FeedbackComment {
    id: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
    admin: {
        id: string;
        name: string | null;
        email: string;
    };
}

interface FeedbackListResponse {
    submissions: FeedbackSubmission[];
    total: number;
    page: number;
    totalPages: number;
}

interface UpdateFeedbackDto {
    status?: string;
    priority?: string;
}

export function AdminFeedback() {
    const [selectedSubmission, setSelectedSubmission] = useState<FeedbackSubmission | null>(null);
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        priority: '',
        search: '',
    });
    const [commentContent, setCommentContent] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [updateData, setUpdateData] = useState<UpdateFeedbackDto>({});

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: response, isLoading } = useQuery<FeedbackListResponse>({
        queryKey: ['admin-feedback', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.status) params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);
            if (filters.search) params.append('search', filters.search);

            const res = await fetch(`/api/admin/feedback?${params.toString()}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to fetch feedback');
            return res.json();
        },
        staleTime: 30 * 1000,
    });

    const submissions = response?.submissions || [];

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateFeedbackDto }) => {
            const res = await fetch(`/api/admin/feedback/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update feedback');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
            toast({
                title: 'Success',
                description: 'Feedback updated successfully',
            });
            setUpdateData({});
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Failed to update feedback',
                variant: 'destructive',
            });
        },
    });

    const commentMutation = useMutation({
        mutationFn: async ({
            id,
            content,
            isInternal,
        }: {
            id: string;
            content: string;
            isInternal: boolean;
        }) => {
            const res = await fetch(`/api/admin/feedback/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content, isInternal }),
            });
            if (!res.ok) throw new Error('Failed to add comment');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
            toast({
                title: 'Success',
                description: 'Comment added successfully',
            });
            setCommentContent('');
            setIsInternal(false);
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Failed to add comment',
                variant: 'destructive',
            });
        },
    });

    const handleUpdateSubmission = () => {
        if (!selectedSubmission || Object.keys(updateData).length === 0) return;
        updateMutation.mutate({ id: selectedSubmission.id, data: updateData });
    };

    const handleAddComment = () => {
        if (!selectedSubmission || !commentContent.trim()) return;
        commentMutation.mutate({
            id: selectedSubmission.id,
            content: commentContent,
            isInternal,
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="h-4 w-4" />;
            case 'REVIEWING':
                return <Search className="h-4 w-4" />;
            case 'IN_PROGRESS':
                return <AlertCircle className="h-4 w-4" />;
            case 'RESOLVED':
                return <CheckCircle className="h-4 w-4" />;
            case 'REJECTED':
                return <XCircle className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'REVIEWING':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'IN_PROGRESS':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'RESOLVED':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'REJECTED':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return '';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'HIGH':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'LOW':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
            default:
                return '';
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label>Search</Label>
                            <Input
                                placeholder="Search by title..."
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters({ ...filters, search: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={filters.type}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All types</SelectItem>
                                    <SelectItem value="BUG">Bugs</SelectItem>
                                    <SelectItem value="SUGGESTION">Suggestions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, status: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="REVIEWING">Reviewing</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                                value={filters.priority}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, priority: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All priorities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All priorities</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submissions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : !submissions || submissions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No feedback submissions found
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {submissions.map((submission) => (
                                <div
                                    key={submission.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                                    onClick={() => setSelectedSubmission(submission)}
                                >
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            {submission.type === 'BUG' ? (
                                                <Bug className="h-4 w-4 text-red-500" />
                                            ) : (
                                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                                            )}
                                            <h4 className="font-medium">{submission.title}</h4>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{submission.user.name || submission.user.email}</span>
                                            <span>•</span>
                                            <span>
                                                {format(
                                                    new Date(submission.createdAt),
                                                    'MMM d, yyyy'
                                                )}
                                            </span>
                                            {submission.category && (
                                                <>
                                                    <span>•</span>
                                                    <span>{submission.category}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getPriorityColor(submission.priority)}>
                                            {submission.priority}
                                        </Badge>
                                        <Badge
                                            className={`flex items-center gap-1 ${getStatusColor(submission.status)}`}
                                        >
                                            {getStatusIcon(submission.status)}
                                            {submission.status.replace('_', ' ')}
                                        </Badge>
                                        {submission.comments.length > 0 && (
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                {submission.comments.length}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {selectedSubmission && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2">
                                    {selectedSubmission.type === 'BUG' ? (
                                        <Bug className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                                    )}
                                    <DialogTitle>{selectedSubmission.title}</DialogTitle>
                                </div>
                                <DialogDescription>
                                    Submitted by {selectedSubmission.user.name || selectedSubmission.user.email} on{' '}
                                    {format(new Date(selectedSubmission.createdAt), 'PPP')}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* Description */}
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                                        {selectedSubmission.description}
                                    </div>
                                </div>

                                {/* Metadata */}
                                {selectedSubmission.metadata && (
                                    <div className="space-y-2">
                                        <Label>Metadata</Label>
                                        <div className="p-4 bg-muted rounded-lg space-y-1 text-sm">
                                            {selectedSubmission.metadata.browser && (
                                                <div>
                                                    <span className="font-medium">Browser:</span>{' '}
                                                    {selectedSubmission.metadata.browser}
                                                </div>
                                            )}
                                            {selectedSubmission.metadata.url && (
                                                <div>
                                                    <span className="font-medium">URL:</span>{' '}
                                                    {selectedSubmission.metadata.url}
                                                </div>
                                            )}
                                            {selectedSubmission.metadata.orgSlug && (
                                                <div>
                                                    <span className="font-medium">Organization:</span>{' '}
                                                    {selectedSubmission.metadata.orgSlug}
                                                </div>
                                            )}
                                            {selectedSubmission.metadata.screen && (
                                                <div>
                                                    <span className="font-medium">Screen:</span>{' '}
                                                    {selectedSubmission.metadata.screen}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Update Status/Priority */}
                                <div className="space-y-4">
                                    <Label>Update Status or Priority</Label>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm">Status</Label>
                                            <Select
                                                value={updateData.status || selectedSubmission.status}
                                                onValueChange={(value) =>
                                                    setUpdateData({ ...updateData, status: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PENDING">Pending</SelectItem>
                                                    <SelectItem value="REVIEWING">Reviewing</SelectItem>
                                                    <SelectItem value="IN_PROGRESS">
                                                        In Progress
                                                    </SelectItem>
                                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm">Priority</Label>
                                            <Select
                                                value={
                                                    updateData.priority || selectedSubmission.priority
                                                }
                                                onValueChange={(value) =>
                                                    setUpdateData({ ...updateData, priority: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="LOW">Low</SelectItem>
                                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                                    <SelectItem value="HIGH">High</SelectItem>
                                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleUpdateSubmission}
                                        disabled={
                                            Object.keys(updateData).length === 0 ||
                                            updateMutation.isPending
                                        }
                                    >
                                        {updateMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update'
                                        )}
                                    </Button>
                                </div>

                                {/* Comments */}
                                <div className="space-y-4">
                                    <Label>Comments</Label>
                                    {selectedSubmission.comments.length === 0 ? (
                                        <div className="text-sm text-muted-foreground text-center py-4">
                                            No comments yet
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedSubmission.comments.map((comment) => (
                                                <div
                                                    key={comment.id}
                                                    className={`p-4 rounded-lg ${comment.isInternal
                                                        ? 'bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500'
                                                        : 'bg-muted'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-medium text-sm">
                                                            {comment.admin.name || comment.admin.email}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(
                                                                new Date(comment.createdAt),
                                                                'PPp'
                                                            )}
                                                        </span>
                                                        {comment.isInternal && (
                                                            <Badge
                                                                variant="destructive"
                                                                className="text-xs"
                                                            >
                                                                Internal
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm whitespace-pre-wrap">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Comment */}
                                    <div className="space-y-3">
                                        <Textarea
                                            placeholder="Add a comment..."
                                            value={commentContent}
                                            onChange={(e) => setCommentContent(e.target.value)}
                                            rows={3}
                                        />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="internal"
                                                    checked={isInternal}
                                                    onChange={(e) => setIsInternal(e.target.checked)}
                                                    className="rounded"
                                                />
                                                <Label htmlFor="internal" className="text-sm">
                                                    Internal comment (not visible to user)
                                                </Label>
                                            </div>
                                            <Button
                                                onClick={handleAddComment}
                                                disabled={
                                                    !commentContent.trim() ||
                                                    commentMutation.isPending
                                                }
                                            >
                                                {commentMutation.isPending ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Adding...
                                                    </>
                                                ) : (
                                                    'Add Comment'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
