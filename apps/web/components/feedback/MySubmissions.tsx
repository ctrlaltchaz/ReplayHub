'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Bug, Calendar, Lightbulb, MessageSquare } from 'lucide-react';

interface FeedbackSubmission {
    id: string;
    type: 'BUG' | 'SUGGESTION';
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string | null;
    createdAt: string;
    comments: Array<{
        id: string;
        comment: string;
        admin: {
            id: string;
            name: string;
        };
        createdAt: string;
    }>;
}

interface FeedbackResponse {
    submissions: FeedbackSubmission[];
    total: number;
    page: number;
    totalPages: number;
}

const statusColors: Record<string, string> = {
    NEW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    IN_REVIEW: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    IN_PROGRESS: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    RESOLVED: 'bg-green-500/10 text-green-500 border-green-500/20',
    CLOSED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    WONTFIX: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const priorityColors: Record<string, string> = {
    LOW: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    MEDIUM: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    HIGH: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    CRITICAL: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export function MySubmissions() {
    const { data: response, isLoading } = useQuery<FeedbackResponse>({
        queryKey: ['my-feedback-submissions'],
        queryFn: async () => {
            const response = await fetch('/api/feedback/my-submissions', {
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to fetch submissions');
            return response.json();
        },
        staleTime: 30 * 1000, // 30 seconds
    });

    const submissions = response?.submissions || [];

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!submissions || submissions.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                    <p className="text-muted-foreground text-center">
                        You haven't submitted any feedback yet. Use the form above to report bugs or suggest features.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {submissions.map((submission) => (
                <Card key={submission.id}>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                                {submission.type === 'BUG' ? (
                                    <Bug className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                ) : (
                                    <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-lg mb-2">{submission.title}</CardTitle>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className={statusColors[submission.status]}>
                                            {submission.status.replace('_', ' ')}
                                        </Badge>
                                        <Badge variant="outline" className={priorityColors[submission.priority]}>
                                            {submission.priority}
                                        </Badge>
                                        {submission.category && (
                                            <Badge variant="outline">{submission.category}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(submission.createdAt), 'MMM d, yyyy')}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {submission.description}
                            </p>

                            {submission.comments && submission.comments.length > 0 && (
                                <div className="border-t pt-4 space-y-3">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Admin Responses
                                    </h4>
                                    {submission.comments.map((comment) => (
                                        <div key={comment.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{comment.admin.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {comment.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
