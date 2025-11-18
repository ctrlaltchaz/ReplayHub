'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { cn } from '@/lib/utils';
import { useMyChecklistTasks } from '../checklists/hooks/useMyChecklistTasks';
import type { ChecklistTask } from '@/types/checklist';
import { Loader2, RefreshCcw, Search, ClipboardList, AlertCircle, ExternalLink, ChevronDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TaskCard } from './components/TaskCard';
import { getApiUrl } from '@/lib/api/config';
import type { Checklist } from '@/types/checklist';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

type TaskStatusFilter = 'open' | 'completed';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high';

export default function TasksPage() {
    usePageTitle('Your Tasks');
    const params = useParams();
    const slug = params?.slug as string;
    const { orgUser } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('open');
    const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [tasks, setTasks] = useState<ChecklistTask[]>([]);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

    // Debounce search input
    useEffect(() => {
        const handle = setTimeout(() => {
            setSearchTerm(searchInput.trim());
        }, 300);

        return () => clearTimeout(handle);
    }, [searchInput]);

    // Reset pagination when filters change
    useEffect(() => {
        setCursor(undefined);
        setTasks([]);
    }, [statusFilter, priorityFilter, searchTerm, slug]);

    const queryParams = useMemo(() => ({
        status: statusFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        search: searchTerm || undefined,
        cursor,
        limit: 15,
    }), [statusFilter, priorityFilter, searchTerm, cursor]);

    const { data, isLoading, isFetching, refetch } = useMyChecklistTasks(slug, queryParams);

    // Merge pages when cursor is set
    useEffect(() => {
        if (!data) return;
        setTasks(prev => {
            if (!cursor) {
                return data.data;
            }
            const existingIds = new Set(prev.map(task => task.id));
            const next = data.data.filter(task => !existingIds.has(task.id));
            return [...prev, ...next];
        });
    }, [data, cursor]);

    const hasTasks = tasks.length > 0;
    const canLoadMore = Boolean(data?.pagination.hasMore && data.pagination.nextCursor);
    const isInitialLoading = isLoading && !cursor;

    const handleLoadMore = () => {
        if (data?.pagination.nextCursor) {
            setCursor(data.pagination.nextCursor);
        }
    };

    const handleToggleTask = async (task: ChecklistTask) => {
        if (!slug) return;
        setUpdatingTaskId(task.id);
        try {
            const detailResponse = await fetch(getApiUrl(`/org/${slug}/checklists/${task.checklistId}`), {
                credentials: 'include',
            });
            if (!detailResponse.ok) {
                throw new Error('Failed to load checklist details');
            }
            const checklist: Checklist = await detailResponse.json();
            const existingCompleted = checklist.completedItems ?? [];
            const isAlreadyCompleted = existingCompleted.some((item) => item.idx === task.itemIndex);
            const now = new Date().toISOString();
            const updatedCompletedItems = isAlreadyCompleted
                ? existingCompleted.filter((item) => item.idx !== task.itemIndex)
                : [
                    ...existingCompleted,
                    {
                        idx: task.itemIndex,
                        completedAt: now,
                        completedBy: orgUser?.id || 'current-user',
                    },
                ];

            const updateResponse = await fetch(getApiUrl(`/org/${slug}/checklists/${task.checklistId}/completed-items`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ completedItems: updatedCompletedItems }),
            });
            if (!updateResponse.ok) {
                throw new Error('Failed to update checklist item');
            }

            await Promise.all([
                refetch(),
                queryClient.invalidateQueries({ queryKey: ['checklist', slug, task.checklistId] }),
                queryClient.invalidateQueries({ queryKey: ['checklists', slug] }),
            ]);

            toast({
                title: isAlreadyCompleted ? 'Task reopened' : 'Task completed',
                description: isAlreadyCompleted
                    ? 'The task has been marked as not completed.'
                    : 'Great job! Task marked as completed.',
            });
        } catch (error: any) {
            toast({
                title: 'Update failed',
                description: error.message || 'Unable to update the task right now.',
                variant: 'destructive',
            });
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const groupedCompletedTasks = useMemo(() => {
        if (statusFilter !== 'completed') return [];
        const groups: Record<string, { checklistId: string; checklistTitle: string; completedAt?: string | null; tasks: ChecklistTask[] }> = {};
        tasks.forEach((task) => {
            const key = task.checklistId;
            if (!groups[key]) {
                groups[key] = {
                    checklistId: task.checklistId,
                    checklistTitle: task.checklistTitle || task.templateTitle || 'Checklist',
                    completedAt: task.completedAt,
                    tasks: [],
                };
            }
            if (!groups[key].completedAt || (task.completedAt && task.completedAt > groups[key].completedAt)) {
                groups[key].completedAt = task.completedAt;
            }
            groups[key].tasks.push(task);
        });
        return Object.values(groups).sort((a, b) => {
            const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            return dateB - dateA;
        });
    }, [tasks, statusFilter]);

    const toggleGroup = (groupId: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [groupId]: !prev[groupId],
        }));
    };

    return (
        <div className="container mx-auto space-y-6 p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ClipboardList className="h-6 w-6 text-muted-foreground" />
                        Your Tasks
                    </h1>
                    <p className="text-muted-foreground">
                        {orgUser ? `Tasks assigned to ${orgUser.displayName || orgUser.email}` : 'Tasks assigned to you'}
                    </p>
                </div>
                <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatusFilter)}>
                            <TabsList>
                                <TabsTrigger value="open">Open</TabsTrigger>
                                <TabsTrigger value="completed">Completed</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Priority</span>
                                <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search tasks"
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isInitialLoading && (
                <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}

            {!isInitialLoading && !hasTasks && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                    <AlertCircle className="mb-2 h-8 w-8" />
                    <p className="font-medium">No tasks found</p>
                    <p className="text-sm">
                        Try adjusting your filters or check back later for new assignments.
                    </p>
                </div>
            )}

            {hasTasks && (
                <div className="space-y-4">
                    {statusFilter === 'completed'
                        ? groupedCompletedTasks.map((group) => {
                            const isOpen = openGroups[group.checklistId] ?? false;
                            return (
                                <Card key={group.checklistId}>
                                    <CardContent className="space-y-4 pt-6">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground uppercase tracking-wide">Checklist</p>
                                                <p className="text-lg font-semibold">{group.checklistTitle}</p>
                                                {group.completedAt && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Completed {format(new Date(group.completedAt), 'PPpp')} ({formatDistanceToNow(new Date(group.completedAt), { addSuffix: true })})
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/org/${slug}/checklists/${group.checklistId}`}>
                                                        View Checklist
                                                        <ExternalLink className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => toggleGroup(group.checklistId)}
                                                    aria-label={isOpen ? 'Collapse checklist tasks' : 'Expand checklist tasks'}
                                                >
                                                    <ChevronDown className={cn('h-5 w-5 transition-transform', isOpen && 'rotate-180')} />
                                                </Button>
                                            </div>
                                        </div>
                                        {isOpen && (
                                            <div className="space-y-3 border-t pt-4">
                                                {group.tasks.map((task) => (
                                                    <TaskCard
                                                        key={task.id}
                                                        task={task}
                                                        orgSlug={slug}
                                                        onToggle={() => handleToggleTask(task)}
                                                        toggleLoading={updatingTaskId === task.id}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                        : tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                orgSlug={slug}
                                onToggle={() => handleToggleTask(task)}
                                toggleLoading={updatingTaskId === task.id}
                                compact
                            />
                        ))}
                </div>
            )}

            {hasTasks && canLoadMore && (
                <div className="flex items-center justify-center">
                    <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={isFetching}
                    >
                        {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load More'}
                    </Button>
                </div>
            )}
        </div>
    );
}
