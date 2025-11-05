'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import type { Checklist, ChecklistTemplateItem } from '@/types/checklist';
import { ChevronDown, ChevronRight, Clock, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useUpdateChecklist } from '../hooks/useUpdateChecklist';

interface ChecklistExecutionViewProps {
    checklist: Checklist;
    orgSlug: string;
}

export function ChecklistExecutionView({ checklist, orgSlug }: ChecklistExecutionViewProps) {
    const { toast } = useToast();
    const updateChecklist = useUpdateChecklist(orgSlug, checklist.id);
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
                    completedBy: 'current-user', // TODO: Get from auth context
                },
            ];
        }

        try {
            await updateChecklist.mutateAsync({
                completedItems: newCompletedItems,
            });
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
                        <CardTitle>{checklist.template?.title || 'Checklist'}</CardTitle>
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
                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-start gap-3 p-3 rounded-lg border ${isCompleted ? 'bg-muted/50' : 'bg-background'
                                                }`}
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
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <User className="w-3 h-3" />
                                                            <span className="text-muted-foreground">
                                                                Assigned
                                                            </span>
                                                        </div>
                                                    )}
                                                    {item.evidence && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Evidence Required
                                                        </Badge>
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
