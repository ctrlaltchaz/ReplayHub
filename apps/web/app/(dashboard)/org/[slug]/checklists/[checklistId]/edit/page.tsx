'use client';

import { useOrgUsers } from '@/app/(dashboard)/org/[slug]/runsheets/hooks/useOrgUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { ChecklistScope, ChecklistTemplateItem } from '@/types/checklist';
import { ArrowLeft, ClipboardList, ListChecks, Loader2, Minus, Plus, Sparkles, Users, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useChecklist } from '../../hooks/useChecklist';
import { useUpdateChecklist } from '../../hooks/useUpdateChecklist';

interface EditChecklistPageProps {
    params: {
        slug: string;
        checklistId: string;
    };
}

type BuilderStep = {
    id: string;
    label: string;
    description: string;
    icon: LucideIcon;
};

const UNASSIGNED_VALUE = 'unassigned';

const formatScope = (value?: ChecklistScope) => {
    if (!value) return 'Not set';
    return value.charAt(0).toUpperCase() + value.slice(1);
};

const DEFAULT_ITEM: ChecklistTemplateItem = {
    text: '',
    category: 'General',
    assignedTo: '',
    priority: 'medium',
    estimatedMinutes: 30,
    required: true,
    evidence: false,
};

const builderSteps: BuilderStep[] = [
    {
        id: 'details',
        label: 'Checklist Details',
        description: 'Set the basics for this checklist.',
        icon: ClipboardList,
    },
    {
        id: 'items',
        label: 'Tasks',
        description: 'Add everything that needs to get done.',
        icon: ListChecks,
    },
    {
        id: 'schedule',
        label: 'Schedule & Owner',
        description: 'Assign ownership and timelines.',
        icon: Users,
    },
    {
        id: 'review',
        label: 'Review',
        description: 'Final check before saving.',
        icon: Sparkles,
    },
];

export default function EditChecklistPage({ params }: EditChecklistPageProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { data: checklist, isLoading, error } = useChecklist(params.slug, params.checklistId);
    const updateChecklist = useUpdateChecklist(params.slug, params.checklistId);
    const { data: orgUsers } = useOrgUsers(params.slug);

    const [title, setTitle] = useState('');
    const [scope, setScope] = useState<ChecklistScope>('general');
    const [dueAt, setDueAt] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [items, setItems] = useState<ChecklistTemplateItem[]>([{ ...DEFAULT_ITEM }]);
    const [activeStep, setActiveStep] = useState(builderSteps[0].id);

    useEffect(() => {
        if (!checklist) return;

        if (checklist.templateId) {
            return;
        }

        setTitle(checklist.title || '');
        setScope(checklist.scope || 'general');
        setDueAt(checklist.dueAt ? checklist.dueAt.split('T')[0] : '');
        setAssigneeId(checklist.assigneeId || '');
        const seeds =
            Array.isArray(checklist.itemsJson) && checklist.itemsJson.length > 0
                ? checklist.itemsJson
                : [{ ...DEFAULT_ITEM }];
        setItems(seeds);
    }, [checklist]);

    useEffect(() => {
        const sections = builderSteps
            .map((step) => document.getElementById(step.id))
            .filter((el): el is HTMLElement => Boolean(el));

        if (!sections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const inView = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop)[0];
                if (inView) {
                    setActiveStep(inView.target.id);
                }
            },
            { threshold: 0.2, rootMargin: '-20% 0px -60% 0px' }
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    const handleAddItem = () => {
        setItems([...items, { ...DEFAULT_ITEM }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof ChecklistTemplateItem, value: any) => {
        const next = [...items];
        next[index] = { ...next[index], [field]: value };
        setItems(next);
    };

    const handleRemoveLastItem = () => {
        if (items.length <= 1) return;
        setItems(items.slice(0, -1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast({ title: 'Title required', description: 'Add a name so the team recognizes this checklist.', variant: 'destructive' });
            setActiveStep('details');
            document.getElementById('details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        const validItems = items.filter((item) => item.text.trim());
        if (validItems.length === 0) {
            toast({ title: 'Add at least one task', description: 'Every checklist needs something to do.', variant: 'destructive' });
            setActiveStep('items');
            document.getElementById('items')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        try {
            await updateChecklist.mutateAsync({
                title: title.trim(),
                scope,
                dueAt: dueAt || undefined,
                assigneeId: assigneeId || undefined,
                itemsJson: validItems,
            });
            toast({ title: 'Checklist updated', description: 'Your edits are live.' });
            router.push(`/org/${params.slug}/checklists/${params.checklistId}`);
        } catch (err) {
            console.error(err);
            toast({
                title: 'Unable to update checklist',
                description: 'Please try again or refresh the page.',
                variant: 'destructive',
            });
        }
    };

    const isTemplateBased = Boolean(checklist?.templateId);

    const assigneeName = assigneeId
        ? orgUsers?.find((user) => user.id === assigneeId)?.displayName ?? 'Assigned'
        : 'Not assigned';

    const summaryRows = useMemo(
        () => [
            { label: 'Title', value: title || 'Untitled checklist' },
            { label: 'Scope', value: formatScope(scope) },
            { label: 'Items', value: `${items.length} ${items.length === 1 ? 'item' : 'items'}` },
            { label: 'Due Date', value: dueAt ? new Date(dueAt).toLocaleDateString() : 'Not set' },
            { label: 'Assignee', value: assigneeName },
        ],
        [title, scope, items.length, dueAt, assigneeName]
    );

    const checklistItems = (
        <Card id="items">
            <CardHeader>
                <CardTitle>Checklist Tasks</CardTitle>
                <CardDescription>
                    Organize every task that needs to be completed. Group items by category, assign owners, and set expectations.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative">
                <div className="sticky top-4 z-20 flex justify-end">
                    <div className="flex items-center gap-2 rounded-full border bg-background/95 px-3 py-2 shadow-sm">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tasks</span>
                        <Button type="button" size="icon" variant="outline" onClick={handleRemoveLastItem} disabled={items.length <= 1}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="icon" onClick={handleAddItem}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {items.map((item, index) => (
                    <div key={`item-${index}`} className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground">Item {index + 1}</p>
                                {item.category && <p className="text-xs text-muted-foreground/70">{item.category}</p>}
                            </div>
                            {items.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveItem(index)}
                                    aria-label={`Remove item ${index + 1}`}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Task</Label>
                            <Input
                                value={item.text}
                                onChange={(e) => handleItemChange(index, 'text', e.target.value)}
                                placeholder="Describe the task"
                                required
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-sm">Category</Label>
                                <Input
                                    value={item.category}
                                    onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                    placeholder="e.g., Pre-Match"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">Priority</Label>
                                <Select value={item.priority} onValueChange={(value) => handleItemChange(index, 'priority', value)}>
                                    <SelectTrigger>
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

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-sm">Assigned To</Label>
                                <Select
                                    value={item.assignedTo || UNASSIGNED_VALUE}
                                    onValueChange={(value) =>
                                        handleItemChange(index, 'assignedTo', value === UNASSIGNED_VALUE ? '' : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={UNASSIGNED_VALUE}>Anyone</SelectItem>
                                        {orgUsers?.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.displayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">Est. Time (minutes)</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.estimatedMinutes}
                                    onChange={(e) =>
                                        handleItemChange(
                                            index,
                                            'estimatedMinutes',
                                            Number.parseInt(e.target.value, 10) || 0
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={item.required}
                                    onChange={(e) => handleItemChange(index, 'required', e.target.checked)}
                                />
                                Required
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={item.evidence}
                                    onChange={(e) => handleItemChange(index, 'evidence', e.target.checked)}
                                />
                                Requires Evidence
                            </label>
                        </div>
                    </div>
                ))}

                <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                    Add Another Task
                </Button>
            </CardContent>
        </Card>
    );

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error || !checklist) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-lg text-muted-foreground mb-4">Checklist not found</p>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    if (isTemplateBased) {
        return (
            <div className="container mx-auto p-6 max-w-3xl">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2 px-0">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Template-Based Checklist</CardTitle>
                        <CardDescription>
                            This checklist comes directly from a template. Edit the template to update new runs, or finish this run from the checklist view.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            If you need a standalone version you can edit, create a new checklist from scratch.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => router.push(`/org/${params.slug}/checklists/${params.checklistId}`)}>
                                Back to Checklist
                            </Button>
                            <Button onClick={() => router.push(`/org/${params.slug}/checklists/new?type=template`)}>Create Template</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <div className="mb-8 space-y-4">
                <Button variant="ghost" onClick={() => router.push(`/org/${params.slug}/checklists/${params.checklistId}`)} className="inline-flex items-center gap-2 px-0">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Checklist
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Checklist</h1>
                    <p className="text-muted-foreground mt-2 text-base">
                        Update tasks, timing, or ownership with the same guided builder you use when creating a checklist.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <form onSubmit={handleSubmit} className="space-y-6 order-1">
                    <Card id="details">
                        <CardHeader>
                            <CardTitle>Basic Details</CardTitle>
                            <CardDescription>Rename the checklist or adjust its scope.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Match Day Setup"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="scope">Scope *</Label>
                                <Select value={scope} onValueChange={(value) => setScope(value as ChecklistScope)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select scope" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="event">Event</SelectItem>
                                        <SelectItem value="room">Room</SelectItem>
                                        <SelectItem value="kit">Kit</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {checklistItems}

                    <Card id="schedule">
                        <CardHeader>
                            <CardTitle>Schedule & Ownership</CardTitle>
                            <CardDescription>Clarify when this checklist is due and who should keep it moving.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="dueAt">Due Date</Label>
                                <Input id="dueAt" type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="assigneeId">Assigned To</Label>
                                <Select
                                    value={assigneeId || UNASSIGNED_VALUE}
                                    onValueChange={(value) => setAssigneeId(value === UNASSIGNED_VALUE ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                                        {orgUsers?.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.displayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <div id="review" className="flex flex-col gap-3 border rounded-xl p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="font-semibold">Ready to save your changes?</p>
                            <p className="text-sm text-muted-foreground">Updates apply immediately. You can always come back and adjust.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => router.push(`/org/${params.slug}/checklists/${params.checklistId}`)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateChecklist.isPending}>
                                {updateChecklist.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>

                <aside className="space-y-4 order-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Builder Progress</CardTitle>
                            <CardDescription>Jump between sections without losing your place.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-3">
                                {builderSteps.map((step, index) => {
                                    const StepIcon = step.icon;
                                    const isActive = activeStep === step.id;
                                    return (
                                        <li key={step.id}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveStep(step.id);
                                                    document.getElementById(step.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }}
                                                className={cn(
                                                    'w-full rounded-lg border px-3 py-2 text-left transition hover:border-primary/40',
                                                    isActive && 'border-primary bg-primary/5'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={cn(
                                                            'h-8 w-8 rounded-full border flex items-center justify-center text-sm font-semibold',
                                                            isActive ? 'border-primary text-primary' : 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <StepIcon className="h-4 w-4 text-muted-foreground" />
                                                            <p className="font-medium">{step.label}</p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{step.description}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ol>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Checklist Summary</CardTitle>
                            <CardDescription>A quick snapshot of what you’ve configured so far.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-3 text-sm">
                                {summaryRows.map((row) => (
                                    <div key={row.label} className="flex items-start justify-between gap-3">
                                        <dt className="text-muted-foreground">{row.label}</dt>
                                        <dd className="font-medium text-right">{row.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
