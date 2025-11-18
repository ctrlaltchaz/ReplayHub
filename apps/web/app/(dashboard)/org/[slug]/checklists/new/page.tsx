'use client';

import { useOrgUsers } from '@/app/(dashboard)/org/[slug]/runsheets/hooks/useOrgUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { ChecklistScope, ChecklistTemplateItem, CreateChecklistDto } from '@/types/checklist';
import { useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    ListChecks,
    Loader2,
    Minus,
    Plus,
    Search,
    Sparkles,
    Users,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useChecklistTemplates } from '../hooks/useChecklistTemplates';
import { useCreateChecklist } from '../hooks/useCreateChecklist';
import { useCreateChecklistTemplate } from '../hooks/useCreateChecklistTemplate';

interface NewChecklistPageProps {
    params: {
        slug: string;
    };
}

type BuilderStep = {
    id: string;
    label: string;
    description: string;
    icon: LucideIcon;
};

const formatScope = (value?: ChecklistScope) => {
    if (!value) return 'Not set';
    return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function NewChecklistPage({ params }: NewChecklistPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams?.get('from'); // 'template' or 'scratch'
    const type = searchParams?.get('type'); // 'checklist' or 'template'
    const templateIdFromUrl = searchParams?.get('templateId'); // Pre-selected template ID
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: templates, isLoading: templatesLoading } = useChecklistTemplates(params.slug);
    const { data: orgUsers } = useOrgUsers(params.slug);
    const createChecklistMutation = useCreateChecklist(params.slug);
    const createTemplateMutation = useCreateChecklistTemplate(params.slug);

    // Form state
    const [title, setTitle] = useState('');
    const [scope, setScope] = useState<ChecklistScope>('general');
    const [dueAt, setDueAt] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [saveAsTemplate, setSaveAsTemplate] = useState(false);
    const [items, setItems] = useState<ChecklistTemplateItem[]>([
        {
            text: '',
            category: 'General',
            assignedTo: '',
            priority: 'medium',
            estimatedMinutes: 30,
            required: true,
            evidence: false,
        },
    ]);

    // Form state for "from template" mode
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [templateSearch, setTemplateSearch] = useState('');
    const [activeStep, setActiveStep] = useState('');

    useEffect(() => {
        // If creating a template, skip template selection
        if (type === 'template') {
            return;
        }
        // Pre-select template if provided in URL
        if (templateIdFromUrl) {
            setSelectedTemplateId(templateIdFromUrl);
        }
        if (!mode || (mode !== 'template' && mode !== 'scratch')) {
            router.push(`/org/${params.slug}/checklists`);
        }
    }, [mode, type, templateIdFromUrl, router, params.slug]);

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                text: '',
                category: 'General',
                assignedTo: '',
                priority: 'medium',
                estimatedMinutes: 30,
                required: true,
                evidence: false,
            },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof ChecklistTemplateItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleRemoveLastItem = () => {
        if (items.length <= 1) return;
        setItems(items.slice(0, -1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'template' && type !== 'template' && !selectedTemplateId) {
            toast({
                title: 'Select a template',
                description: 'Choose a template before creating your checklist.',
                variant: 'destructive',
            });
            setActiveStep('template');
            document.getElementById('template')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        try {
            // Creating a template
            if (type === 'template') {
                await createTemplateMutation.mutateAsync({
                    title,
                    scope,
                    itemsJson: items,
                });
                queryClient.invalidateQueries({ queryKey: ['checklist-templates', params.slug] });
                router.push(`/org/${params.slug}/checklists?tab=templates`);
                return;
            }

            // Creating a checklist from template
            if (mode === 'template') {
                const dto: CreateChecklistDto = {
                    templateId: selectedTemplateId,
                    dueAt: dueAt || undefined,
                    assigneeId: assigneeId || undefined,
                };
                await createChecklistMutation.mutateAsync(dto);
            } else {
                // Creating a checklist from scratch
                const dto: CreateChecklistDto = {
                    title,
                    scope,
                    dueAt: dueAt || undefined,
                    assigneeId: assigneeId || undefined,
                    itemsJson: items,
                };
                await createChecklistMutation.mutateAsync(dto);

                // If "save as template" is checked, create template too
                if (saveAsTemplate) {
                    await createTemplateMutation.mutateAsync({
                        title,
                        scope,
                        itemsJson: items,
                    });
                    queryClient.invalidateQueries({ queryKey: ['checklist-templates', params.slug] });
                }
            }

            queryClient.invalidateQueries({ queryKey: ['checklists', params.slug] });
            router.push(`/org/${params.slug}/checklists`);
        } catch (error) {
            console.error('Failed to create:', error);
            toast({
                title: 'Unable to create checklist',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const isTemplate = type === 'template';
    const isFromTemplate = mode === 'template' && !isTemplate;
    const showItemsCard = isTemplate || (!isFromTemplate && mode === 'scratch');
    const finalSectionId = isTemplate ? 'publish' : 'review';

    const builderSteps = useMemo<BuilderStep[]>(() => {
        if (isTemplate) {
            return [
                {
                    id: 'details',
                    label: 'Template Details',
                    description: 'Name the template and define its scope.',
                    icon: ClipboardList,
                },
                {
                    id: 'items',
                    label: 'Tasks',
                    description: 'Lay out the steps the team must follow.',
                    icon: ListChecks,
                },
                {
                    id: 'publish',
                    label: 'Publish',
                    description: 'Review and save for everyone to use.',
                    icon: Sparkles,
                },
            ];
        }

        if (isFromTemplate) {
            return [
                {
                    id: 'template',
                    label: 'Template',
                    description: 'Pick a starting point that fits the job.',
                    icon: ClipboardList,
                },
                {
                    id: 'schedule',
                    label: 'Schedule & Owner',
                    description: 'Set timing and handoff responsibility.',
                    icon: CalendarClock,
                },
                {
                    id: 'review',
                    label: 'Review',
                    description: 'Double-check details before creating.',
                    icon: Sparkles,
                },
            ];
        }

        return [
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
                description: 'Final check before creating.',
                icon: Sparkles,
            },
        ];
    }, [isTemplate, isFromTemplate]);

    useEffect(() => {
        if (builderSteps.length > 0) {
            setActiveStep(builderSteps[0].id);
        }
    }, [builderSteps]);

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
    }, [builderSteps]);

    const filteredTemplates = useMemo(() => {
        if (!templates) return [];
        const query = templateSearch.trim().toLowerCase();
        if (!query) return templates;
        return templates.filter((template) => template.title.toLowerCase().includes(query));
    }, [templates, templateSearch]);

    const selectedTemplate = useMemo(
        () => templates?.find((template) => template.id === selectedTemplateId),
        [templates, selectedTemplateId]
    );

    const itemsCount = isFromTemplate ? selectedTemplate?.itemsJson?.length ?? 0 : items.length;
    const creationLabel = isTemplate ? 'Template' : isFromTemplate ? 'From Template' : 'From Scratch';
    const assigneeName = assigneeId
        ? orgUsers?.find((user) => user.id === assigneeId)?.displayName ?? 'Assigned'
        : 'Not assigned';

    const summaryRows = [
        { label: 'Mode', value: creationLabel },
        {
            label: isFromTemplate ? 'Template' : 'Title',
            value: isFromTemplate ? selectedTemplate?.title ?? 'Not selected' : title || 'Not set',
        },
        { label: 'Scope', value: formatScope(isFromTemplate ? selectedTemplate?.scope : scope) },
    ];

    if (showItemsCard) {
        summaryRows.push({
            label: isFromTemplate ? 'Template Tasks' : 'Items',
            value: `${itemsCount} ${itemsCount === 1 ? 'item' : 'items'}`,
        });
    }

    if (!isTemplate) {
        summaryRows.push({ label: 'Due Date', value: dueAt ? new Date(dueAt).toLocaleDateString() : 'Not set' });
        summaryRows.push({ label: 'Assignee', value: assigneeName });
    }

    if (!isTemplate && !isFromTemplate) {
        summaryRows.push({ label: 'Save as Template', value: saveAsTemplate ? 'Yes' : 'No' });
    }

    const handleStepClick = (stepId: string) => {
        setActiveStep(stepId);
        document.getElementById(stepId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const checklistItems = (
        <Card id="items">
            <CardHeader>
                <CardTitle>Checklist Tasks</CardTitle>
                <CardDescription>
                    Organize every task that needs to be completed. Group items by category, assign owners, and set
                    expectations.
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
                    <div key={index} className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
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
                                <Select
                                    value={item.priority}
                                    onValueChange={(value) => handleItemChange(index, 'priority', value)}
                                >
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
                                    value={item.assignedTo}
                                    onValueChange={(value) => handleItemChange(index, 'assignedTo', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Anyone</SelectItem>
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
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Task
                </Button>

                {!isTemplate && mode === 'scratch' && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-3">
                        <Checkbox
                            id="saveAsTemplate"
                            checked={saveAsTemplate}
                            onCheckedChange={(checked) => setSaveAsTemplate(Boolean(checked))}
                        />
                        <label htmlFor="saveAsTemplate" className="text-sm leading-tight">
                            Save this checklist as a template once it’s created
                        </label>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <div className="mb-8 space-y-4">
                <Button variant="ghost" onClick={() => router.back()} className="inline-flex items-center gap-2 px-0">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Checklists
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">
                        {isTemplate
                            ? 'Create Template'
                            : isFromTemplate
                                ? 'Create Checklist From Template'
                                : 'Create Checklist'}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-base">
                        {isTemplate
                            ? 'Build a reusable playbook your team can pull up anytime.'
                            : isFromTemplate
                                ? 'Start from a proven template, then tailor the schedule and ownership.'
                                : 'Lay out every task, set owners, and launch a clear plan for your team.'}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <form onSubmit={handleSubmit} className="space-y-6 order-1">
                    {isFromTemplate && (
                        <Card id="template">
                            <CardHeader>
                                <CardTitle>Select a Template</CardTitle>
                                <CardDescription>
                                    Browse your templates and choose the one that fits this checklist best.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search templates"
                                        className="pl-9"
                                        value={templateSearch}
                                        onChange={(e) => setTemplateSearch(e.target.value)}
                                    />
                                </div>

                                {templatesLoading ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : filteredTemplates.length > 0 ? (
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {filteredTemplates.map((template) => {
                                            const isSelected = template.id === selectedTemplateId;
                                            return (
                                                <button
                                                    key={template.id}
                                                    type="button"
                                                    onClick={() => setSelectedTemplateId(template.id)}
                                                    className={cn(
                                                        'rounded-xl border p-4 text-left transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                                                        isSelected && 'border-primary ring-2 ring-primary/40 bg-primary/5'
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <p className="font-semibold">{template.title}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {formatScope(template.scope)} •{' '}
                                                                {template.itemsJson.length} items
                                                            </p>
                                                        </div>
                                                        {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-3">
                                                        Updated {new Date(template.updatedAt).toLocaleDateString()}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <Card className="border-dashed">
                                        <CardContent className="text-center py-8 text-sm text-muted-foreground">
                                            No templates found. Create one first or try a different search.
                                        </CardContent>
                                    </Card>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {!isFromTemplate && (
                        <Card id="details">
                            <CardHeader>
                                <CardTitle>Basic Details</CardTitle>
                                <CardDescription>
                                    {isTemplate
                                        ? 'Give your template a clear name and scope.'
                                        : 'Describe what this checklist is for and who it applies to.'}
                                </CardDescription>
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
                    )}

                    {showItemsCard && checklistItems}

                    {!isTemplate && (
                        <Card id="schedule">
                            <CardHeader>
                                <CardTitle>Schedule & Ownership</CardTitle>
                                <CardDescription>
                                    Clarify when this checklist is due and who should keep it moving.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="dueAt">Due Date</Label>
                                    <Input
                                        id="dueAt"
                                        type="date"
                                        value={dueAt}
                                        onChange={(e) => setDueAt(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="assigneeId">Assigned To</Label>
                                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Unassigned</SelectItem>
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
                    )}

                    <div id={finalSectionId} className="flex flex-col gap-3 border rounded-xl p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="font-semibold">Ready to {isTemplate ? 'publish your template' : 'create this checklist'}?</p>
                            <p className="text-sm text-muted-foreground">
                                {isTemplate
                                    ? 'Once saved, the template is available to everyone with checklist permissions.'
                                    : 'You can edit any detail later if plans change.'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createChecklistMutation.isPending || createTemplateMutation.isPending}>
                                {createChecklistMutation.isPending || createTemplateMutation.isPending
                                    ? 'Saving...'
                                    : isTemplate
                                        ? 'Publish Template'
                                        : 'Create Checklist'}
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
                                                onClick={() => handleStepClick(step.id)}
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
