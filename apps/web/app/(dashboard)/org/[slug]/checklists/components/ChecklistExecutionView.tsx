'use client';

import { useOrgUsers } from '@/app/(dashboard)/org/[slug]/runsheets/hooks/useOrgUsers';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { Checklist, ChecklistTemplateItem } from '@/types/checklist';
import { ChevronDown, ChevronRight, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useUpdateChecklistItems } from '../hooks/useUpdateChecklistItems';

interface ChecklistExecutionViewProps {
    checklist: Checklist;
    orgSlug: string;
}

export function ChecklistExecutionView({ checklist, orgSlug }: ChecklistExecutionViewProps) {
    const { toast } = useToast();
    const { orgUser } = useAuth();
    const { data: orgUsers } = useOrgUsers(orgSlug);
    const updateChecklistItems = useUpdateChecklistItems(orgSlug, checklist.id);
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

    const items = useMemo(() => {
        // Check standalone checklist items first, then template items
        return Array.isArray(checklist.itemsJson)
            ? checklist.itemsJson
            : Array.isArray(checklist.template?.itemsJson)
                ? checklist.template.itemsJson
                : [];
    }, [checklist.itemsJson, checklist.template?.itemsJson]);

    const itemsByCategory = useMemo(() => {
        const grouped = new Map<string, { item: ChecklistTemplateItem; index: number }[]>();

        items.forEach((item, index) => {
            const category = item.category || 'Uncategorized';
            if (!grouped.has(category)) {
                grouped.set(category, []);
            }
            grouped.get(category)!.push({ item, index });
        });

        return grouped;
    }, [items]);

    const completedIndices = useMemo(() => {
        return new Set(checklist.completedItems.map((ci) => ci.idx));
    }, [checklist.completedItems]);

    const totalItems = items.length;
    const completedCount = checklist.completedItems.length;
    const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

    const toggleCategory = (category: string) => {
        const newCollapsed = new Set(collapsedCategories);
        if (newCollapsed.has(category)) {
            newCollapsed.delete(category);
        } else {
            newCollapsed.add(category);
        }
        setCollapsedCategories(newCollapsed);
    };

    const toggleItem = async (index: number) => {
        const isCompleted = completedIndices.has(index);
        let newCompletedItems;

        if (isCompleted) {
            // Remove completion
            newCompletedItems = checklist.completedItems.filter((ci) => ci.idx !== index);
        } else {
            // Add completion
            newCompletedItems = [
                ...checklist.completedItems,
                {
                    idx: index,
                    completedAt: new Date().toISOString(),
                    completedBy: orgUser?.id || 'current-user',
                },
            ];
        }

        try {
            await updateChecklistItems.mutateAsync(newCompletedItems);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update checklist',
                variant: 'destructive',
            });
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'default';
            case 'low':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <div className="space-y-4">
            {/* Progress Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{checklist.title || checklist.template?.title || 'Checklist'}</CardTitle>
                        <Badge variant={checklist.status === 'done' ? 'default' : 'secondary'}>
                            {checklist.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {completedCount} of {totalItems} completed
                        </span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    {checklist.dueAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <Clock className="w-4 h-4" />
                            Due: {new Date(checklist.dueAt).toLocaleString()}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Checklist Items by Category */}
            {Array.from(itemsByCategory.entries()).map(([category, categoryItems]) => {
                const isCollapsed = collapsedCategories.has(category);
                const categoryCompleted = categoryItems.filter((ci) =>
                    completedIndices.has(ci.index)
                ).length;

                return (
                    <Card key={category}>
                        <CardHeader className="cursor-pointer" onClick={() => toggleCategory(category)}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {isCollapsed ? (
                                        <ChevronRight className="w-5 h-5" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5" />
                                    )}
                                    <CardTitle className="text-lg">{category}</CardTitle>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {categoryCompleted}/{categoryItems.length}
                                </span>
                            </div>
                        </CardHeader>
                        {!isCollapsed && (
                            <CardContent className="space-y-3">
                                {categoryItems.map(({ item, index }) => {
                                    const isCompleted = completedIndices.has(index);
                                    const completionMeta = checklist.completedItems.find((ci) => ci.idx === index);
                                    const isAssignedToMe = Boolean(item.assignedTo && orgUser?.id === item.assignedTo);
                                    const assignedName = item.assignedTo
                                        ? orgUsers?.find((user) => user.id === item.assignedTo)?.displayName ||
                                        orgUsers?.find((user) => user.id === item.assignedTo)?.email ||
                                        'member'
                                        : null;
                                    return (
                                        <div
                                            key={index}
                                            className={cn(
                                                'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                                                isCompleted ? 'bg-muted/50' : 'bg-background',
                                                isAssignedToMe && !isCompleted && 'border-primary/60 bg-primary/5'
                                            )}
                                        >
                                            <Checkbox
                                                checked={isCompleted}
                                                onCheckedChange={() => toggleItem(index)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 space-y-2">
                                                <p
                                                    className={`text-sm ${isCompleted
                                                        ? 'line-through text-muted-foreground'
                                                        : ''
                                                        }`}
                                                >
                                                    {item.text}
                                                    {item.required && (
                                                        <span className="text-destructive ml-1">*</span>
                                                    )}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {item.priority && (
                                                        <Badge
                                                            variant={getPriorityColor(item.priority)}
                                                            className="text-xs"
                                                        >
                                                            {item.priority}
                                                        </Badge>
                                                    )}
                                                    {item.estimatedMinutes && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3" />
                                                            {item.estimatedMinutes}m
                                                        </div>
                                                    )}
                                                    {item.assignedTo && (
                                                        <Badge
                                                            variant={isAssignedToMe ? 'secondary' : 'outline'}
                                                            className="flex items-center gap-1 text-xs"
                                                        >
                                                            <User className="w-3 h-3" />
                                                            <span>
                                                                {isAssignedToMe
                                                                    ? 'Assigned to you'
                                                                    : `Assigned to ${assignedName}`}
                                                            </span>
                                                        </Badge>
                                                    )}
                                                    {item.evidence && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Evidence Required
                                                        </Badge>
                                                    )}
                                                    {completionMeta?.completedAt && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Completed at {format(new Date(completionMeta.completedAt), 'PP p')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}
