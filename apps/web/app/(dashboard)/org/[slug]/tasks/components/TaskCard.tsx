'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { ChecklistTask } from '@/types/checklist';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { CheckCircle2, ClipboardCheck, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface TaskCardProps {
    task: ChecklistTask;
    orgSlug: string;
    onToggle: () => void;
    toggleLoading?: boolean;
    compact?: boolean;
}

export function TaskCard({ task, orgSlug, onToggle, toggleLoading, compact = false }: TaskCardProps) {
    const dueDate = task.dueAt ? new Date(task.dueAt) : null;
    const completedDate = task.completedAt ? new Date(task.completedAt) : null;
    const isOverdue = Boolean(dueDate && !completedDate && isPast(dueDate));
    const checklistTitle = task.checklistTitle || task.templateTitle || 'Checklist';
    const checklistUrl = `/org/${orgSlug}/checklists/${task.checklistId}`;
    const status = task.completedAt ? 'completed' : 'open';
    const assignmentContext = task.assignedOrgUserId
        ? 'Directly assigned to you'
        : 'Checklist assigned to you';

    if (compact) {
        return (
            <Card className="shadow-sm">
                <CardContent className="space-y-3 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-semibold text-sm flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                                {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {checklistTitle} · Item #{task.itemIndex + 1}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox checked={Boolean(task.completedAt)} onCheckedChange={onToggle} disabled={toggleLoading} />
                            <span className="text-xs text-muted-foreground">
                                {task.completedAt ? 'Completed' : 'Mark complete'}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {dueDate ? (
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{format(dueDate, 'PP')}</span>
                                {!completedDate && (
                                    <span>({formatDistanceToNow(dueDate, { addSuffix: true })})</span>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>No due date</span>
                            </div>
                        )}
                        {task.priority && (
                            <Badge variant="outline" className="capitalize">
                                {task.priority} priority
                            </Badge>
                        )}
                        {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{assignmentContext}</span>
                        <Button asChild variant="ghost" size="sm">
                            <Link href={checklistUrl}>
                                View
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-col gap-3 space-y-0 border-b sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                        <span>{task.title}</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {checklistTitle} · Item #{task.itemIndex + 1}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={status === 'completed' ? 'secondary' : 'default'}>
                        {status === 'completed' ? 'Completed' : 'Open'}
                    </Badge>
                    {task.priority && (
                        <Badge variant="outline" className="capitalize">
                            {task.priority} priority
                        </Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                        {task.checklistStatus}
                    </Badge>
                    {isOverdue && (
                        <Badge variant="destructive">
                            Overdue
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {dueDate ? (
                            <>
                                <span>{format(dueDate, 'PPp')}</span>
                                {!completedDate && (
                                    <span className="text-xs">
                                        ({formatDistanceToNow(dueDate, { addSuffix: true })})
                                    </span>
                                )}
                            </>
                        ) : (
                            <span>No due date</span>
                        )}
                    </div>
                    {completedDate && (
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>
                                Completed at {format(completedDate, 'PP p')} ({formatDistanceToNow(completedDate, { addSuffix: true })})
                            </span>
                        </div>
                    )}
                </div>
                <div className="text-xs text-muted-foreground">
                    {assignmentContext}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm">
                        <p className="font-medium">Checklist</p>
                        <p className="text-muted-foreground">{checklistTitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={Boolean(task.completedAt)}
                            onCheckedChange={onToggle}
                            disabled={toggleLoading}
                        />
                        <span className="text-sm">
                            {task.completedAt ? 'Completed' : 'Mark as completed'}
                        </span>
                        <Button asChild variant="outline" size="sm">
                            <Link href={checklistUrl}>
                                View
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
