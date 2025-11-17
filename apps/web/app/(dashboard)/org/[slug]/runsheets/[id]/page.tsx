'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { apiDelete, apiGet, apiPut } from "@/lib/api/client";
import { exportRunsheetToPDF } from "@/lib/export/exportRunsheetToPDF";
import type { RunsheetItem } from "@/types/runsheet";
import type { CreateRunsheetTemplateDto } from "@/types/runsheet-template-full";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Check, CheckCircle, Clock, Copy, Download, Edit, FileText, GripVertical, Lock, Plus, RotateCcw, Save, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAddRunsheetItems } from "../hooks/useAddRunsheetItems";
import { useApproveRunsheet } from "../hooks/useApproveRunsheet";
import { useCreateRunsheetTemplate } from "../hooks/useCreateRunsheetTemplate";
import { useDeleteRunsheet } from "../hooks/useDeleteRunsheet";
import { useDuplicateRunsheet } from "../hooks/useDuplicateRunsheet";
import { useLockRunsheet } from "../hooks/useLockRunsheet";
import { useOrgUsers } from "../hooks/useOrgUsers";
import { useReorderRunsheetItems } from "../hooks/useReorderRunsheetItems";
import { useRunsheet } from "../hooks/useRunsheet";
import { useUnapproveRunsheet } from "../hooks/useUnapproveRunsheet";
import { useUpdateRunsheet } from "../hooks/useUpdateRunsheet";
import { AddItemDialog } from "./components/AddItemDialog";
import { ApproveRunsheetDialog } from "./components/ApproveRunsheetDialog";
import { DeleteItemDialog } from "./components/DeleteItemDialog";
import { DeleteRunsheetDialog } from "./components/DeleteRunsheetDialog";
import { EditItemDialog } from "./components/EditItemDialog";
import { LockRunsheetDialog } from "./components/LockRunsheetDialog";
import { RunsheetEditDialog } from "./components/RunsheetEditDialog";
import { SaveAsTemplateDialog } from "./components/SaveAsTemplateDialog";
import { UnapproveRunsheetDialog } from "./components/UnapproveRunsheetDialog";

interface SortableItemProps {
    item: RunsheetItem;
    index: number;
    isLocked: boolean;
    formatDuration: (ms: number) => string;
    calculateCumulativeTime: (index: number) => number;
    onEdit: (item: RunsheetItem) => void;
    onDelete: (item: RunsheetItem) => void;
    orgUsers?: Array<{ id: string; displayName: string; email: string }>;
    showCheckmark?: boolean;
}

function SortableItem({ item, index, isLocked, formatDuration, calculateCumulativeTime, onEdit, onDelete, orgUsers, showCheckmark }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id, disabled: isLocked });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        >
            {!isLocked && (
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing pt-1 text-muted-foreground hover:text-foreground"
                >
                    <GripVertical className="h-5 w-5" />
                </div>
            )}
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
                <span className="text-xs text-muted-foreground">#{item.idx}</span>
                <div className="text-sm font-mono font-semibold">
                    {formatDuration(calculateCumulativeTime(index))}
                </div>
            </div>
            <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold font-montserrat">{item.title}</h4>
                        {showCheckmark && (
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        )}
                        {item.type && (
                            <Badge variant="outline" className="text-xs capitalize">
                                {item.type}
                            </Badge>
                        )}
                        {item.priority && item.priority !== 'normal' && (
                            <Badge
                                variant={item.priority === 'critical' ? 'destructive' : item.priority === 'high' ? 'default' : 'secondary'}
                                className="text-xs capitalize"
                            >
                                {item.priority}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(item.durationMs)}</span>
                        </div>
                        {!isLocked && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onEdit(item)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => onDelete(item)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Item metadata row */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {item.ownerId && (
                        <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            <span>{orgUsers?.find(u => u.id === item.ownerId)?.displayName || item.ownerId}</span>
                        </div>
                    )}
                    {item.location && (
                        <div className="flex items-center gap-1">
                            <span className="font-medium">📍</span>
                            <span>{item.location}</span>
                        </div>
                    )}
                    {item.equipment && (
                        <div className="flex items-center gap-1">
                            <span className="font-medium">🔧</span>
                            <span>{item.equipment}</span>
                        </div>
                    )}
                </div>

                {item.notes && (
                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                )}
            </div>
        </div>
    );
}

export default function RunsheetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const runsheetId = params?.id as string;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showUnapproveDialog, setShowUnapproveDialog] = useState(false);
    const [showLockDialog, setShowLockDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAddItemDialog, setShowAddItemDialog] = useState(false);
    const [showEditItemDialog, setShowEditItemDialog] = useState(false);
    const [showDeleteItemDialog, setShowDeleteItemDialog] = useState(false);
    const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<RunsheetItem | null>(null);
    const [reorderedItemIds, setReorderedItemIds] = useState<Set<string>>(new Set());

    const { data: runsheet, isLoading, error } = useRunsheet(slug, runsheetId);
    const { data: orgUsers } = useOrgUsers(slug);
    const updateMutation = useUpdateRunsheet(slug, runsheetId);
    const approveMutation = useApproveRunsheet(slug, runsheetId);
    const unapproveM = useUnapproveRunsheet(slug, runsheetId);
    const lockMutation = useLockRunsheet(slug, runsheetId);
    const deleteMutation = useDeleteRunsheet(slug);
    const addItemsMutation = useAddRunsheetItems(slug, runsheetId);
    const reorderMutation = useReorderRunsheetItems(slug, runsheetId);
    const duplicateMutation = useDuplicateRunsheet(slug);
    const createTemplateMutation = useCreateRunsheetTemplate(slug);

    // Fetch event if runsheet has eventId
    const { data: event } = useQuery({
        queryKey: ['event', slug, runsheet?.eventId],
        queryFn: () => apiGet<any>(`/org/${slug}/events/${runsheet?.eventId}`),
        enabled: !!runsheet?.eventId && !!slug,
    });

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleUpdateTitle = async (data: { title: string; eventId?: string }) => {
        try {
            await updateMutation.mutateAsync(data);
            toast({ title: "Runsheet updated", description: "The runsheet has been updated." });
            setShowEditDialog(false);
        } catch (error) {
            toast({
                title: "Failed to update runsheet",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleApprove = async () => {
        try {
            await approveMutation.mutateAsync();
            toast({ title: "Runsheet approved", description: "The runsheet has been approved." });
            setShowApproveDialog(false);
        } catch (error) {
            toast({
                title: "Failed to approve runsheet",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleLock = async () => {
        try {
            await lockMutation.mutateAsync();
            toast({ title: "Runsheet locked", description: "The runsheet has been locked." });
            setShowLockDialog(false);
        } catch (error) {
            toast({
                title: "Failed to lock runsheet",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleUnapprove = async () => {
        try {
            await unapproveM.mutateAsync();
            toast({ title: "Runsheet unapproved", description: "The runsheet has been returned to draft status." });
            setShowUnapproveDialog(false);
        } catch (error) {
            toast({
                title: "Failed to unapprove runsheet",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(runsheetId);
            toast({ title: "Runsheet deleted", description: "The runsheet has been permanently deleted." });
            setShowDeleteDialog(false);
            // Navigate back to runsheets list
            router.push(`/org/${slug}/runsheets`);
        } catch (error) {
            toast({
                title: "Failed to delete runsheet",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleDuplicate = async () => {
        try {
            const newRunsheet = await duplicateMutation.mutateAsync(runsheetId);
            toast({
                title: "Runsheet duplicated",
                description: "A copy of the runsheet has been created."
            });
            // Navigate to the new runsheet
            window.location.href = `/org/${slug}/runsheets/${newRunsheet.id}`;
        } catch (error) {
            toast({
                title: "Failed to duplicate runsheet",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
        }
    };

    const handleExportPDF = () => {
        if (!runsheet) return;

        try {
            exportRunsheetToPDF(runsheet, event?.name);
            toast({
                title: "PDF exported",
                description: "The runsheet has been downloaded as a PDF."
            });
        } catch (error) {
            toast({
                title: "Failed to export PDF",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
        }
    };

    const handleCreateTemplate = async (data: CreateRunsheetTemplateDto) => {
        try {
            await createTemplateMutation.mutateAsync(data);
            toast({
                title: "Template saved",
                description: "This runsheet has been saved as a template."
            });
            setShowSaveTemplateDialog(false);
        } catch (error) {
            toast({
                title: "Failed to save template",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleAddItem = async (data: {
        title: string;
        type?: string;
        ownerId: string;
        durationMs: number;
        location?: string;
        equipment?: string;
        priority?: 'low' | 'normal' | 'high' | 'critical';
        notes: string;
    }) => {
        try {
            // Calculate next idx
            const items = runsheet?.items || [];
            const maxIdx = items.length > 0 ? Math.max(...items.map(i => i.idx)) : 0;

            await addItemsMutation.mutateAsync({
                items: [{
                    idx: maxIdx + 1,
                    title: data.title,
                    type: data.type,
                    ownerId: data.ownerId || undefined,
                    durationMs: data.durationMs,
                    location: data.location,
                    equipment: data.equipment,
                    priority: data.priority,
                    notes: data.notes || undefined,
                }]
            });
            toast({ title: "Item added", description: "The item has been added to the runsheet." });
            setShowAddItemDialog(false);
        } catch (error) {
            toast({
                title: "Failed to add item",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleEditItem = async (data: {
        title: string;
        type?: string;
        ownerId: string;
        durationMs: number;
        location?: string;
        equipment?: string;
        priority?: 'low' | 'normal' | 'high' | 'critical';
        notes: string;
    }) => {
        if (!selectedItem) return;

        try {
            await apiPut(`/org/${slug}/runsheets/${runsheetId}/items/${selectedItem.id}`, {
                title: data.title,
                type: data.type,
                ownerId: data.ownerId || undefined,
                durationMs: data.durationMs,
                location: data.location,
                equipment: data.equipment,
                priority: data.priority,
                notes: data.notes || undefined,
            });
            toast({ title: "Item updated", description: "The item has been updated." });
            setShowEditItemDialog(false);
            setSelectedItem(null);
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['runsheet', slug, runsheetId] });
        } catch (error) {
            toast({
                title: "Failed to update item",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleDeleteItem = async () => {
        if (!selectedItem) return;

        try {
            await apiDelete(`/org/${slug}/runsheets/${runsheetId}/items/${selectedItem.id}`);
            toast({ title: "Item deleted", description: "The item has been removed from the runsheet." });
            setShowDeleteItemDialog(false);
            setSelectedItem(null);
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['runsheet', slug, runsheetId] });
        } catch (error) {
            toast({
                title: "Failed to delete item",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id || !runsheet?.items) return;

        const items = [...runsheet.items];
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        // Reorder locally for optimistic update
        const reorderedItems = arrayMove(items, oldIndex, newIndex);

        try {
            // Send new order to backend
            await reorderMutation.mutateAsync({
                itemIds: reorderedItems.map(item => item.id)
            });

            // Show checkmark on all items
            const allItemIds = new Set(reorderedItems.map(item => item.id));
            setReorderedItemIds(allItemIds);

            // Hide checkmarks after 2 seconds
            setTimeout(() => {
                setReorderedItemIds(new Set());
            }, 2000);
        } catch (error) {
            toast({
                title: "Failed to reorder items",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
            draft: { variant: "secondary", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
            approved: { variant: "default", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
            locked: { variant: "outline", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
        };
        const config = variants[status] || variants.draft;
        return <Badge variant={config.variant} className={config.className}>{status.toUpperCase()}</Badge>;
    };

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const calculateCumulativeTime = (index: number) => {
        if (!runsheet?.items) return 0;
        return runsheet.items.slice(0, index + 1).reduce((acc, item) => acc + item.durationMs, 0);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-muted animate-pulse rounded" />
                        <div className="flex-1 space-y-2">
                            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                <div className="h-6 w-2/3 bg-muted animate-pulse rounded" />
                                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error || !runsheet) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/org/${slug}/runsheets`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Error</h1>
                            <p className="text-muted-foreground">Failed to load runsheet</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isLocked = runsheet.status === 'locked';
    const isDraft = runsheet.status === 'draft';
    const items = runsheet.items || [];

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/org/${slug}/runsheets`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold tracking-tight font-montserrat">
                                {runsheet.title}
                            </h1>
                            {getStatusBadge(runsheet.status)}
                            {isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Revision {runsheet.revision} • Created {format(new Date(runsheet.createdAt), "MMM d, yyyy")}
                            {event && (
                                <> • <span className="text-foreground font-medium">{event.name}</span></>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowSaveTemplateDialog(true)}>
                            <Save className="h-4 w-4 mr-2" />
                            Save as Template
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportPDF}>
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={duplicateMutation.isPending}>
                            <Copy className="h-4 w-4 mr-2" />
                            {duplicateMutation.isPending ? "Duplicating..." : "Duplicate"}
                        </Button>
                        {!isLocked && (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                {isDraft ? (
                                    <Button variant="default" size="sm" onClick={() => setShowApproveDialog(true)}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={() => setShowUnapproveDialog(true)}>
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Unapprove
                                    </Button>
                                )}
                                <Button variant="secondary" size="sm" onClick={() => setShowLockDialog(true)}>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Lock
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Runsheet Items */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Runsheet Items</CardTitle>
                                <CardDescription>
                                    {items.length} {items.length === 1 ? 'item' : 'items'} in schedule
                                </CardDescription>
                            </div>
                            {!isLocked && (
                                <Button size="sm" onClick={() => setShowAddItemDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {items.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No items yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Add items to build your runsheet schedule
                                </p>
                                {!isLocked && (
                                    <Button onClick={() => setShowAddItemDialog(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add First Item
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={items.map(item => item.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2">
                                        {items.map((item, index) => (
                                            <SortableItem
                                                key={item.id}
                                                item={item}
                                                index={index}
                                                isLocked={isLocked}
                                                formatDuration={formatDuration}
                                                calculateCumulativeTime={calculateCumulativeTime}
                                                orgUsers={orgUsers}
                                                showCheckmark={reorderedItemIds.has(item.id)}
                                                onEdit={(item) => {
                                                    setSelectedItem(item);
                                                    setShowEditItemDialog(true);
                                                }}
                                                onDelete={(item) => {
                                                    setSelectedItem(item);
                                                    setShowDeleteItemDialog(true);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </CardContent>
                </Card>

                {/* Dialogs */}
                <RunsheetEditDialog
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                    currentTitle={runsheet.title}
                    currentEventId={runsheet.eventId}
                    onSubmit={handleUpdateTitle}
                    isLoading={updateMutation.isPending}
                />
                <ApproveRunsheetDialog
                    open={showApproveDialog}
                    onOpenChange={setShowApproveDialog}
                    runsheetTitle={runsheet.title}
                    onConfirm={handleApprove}
                    isLoading={approveMutation.isPending}
                />
                <LockRunsheetDialog
                    open={showLockDialog}
                    onOpenChange={setShowLockDialog}
                    runsheetTitle={runsheet.title}
                    onConfirm={handleLock}
                    isLoading={lockMutation.isPending}
                />
                <UnapproveRunsheetDialog
                    open={showUnapproveDialog}
                    onOpenChange={setShowUnapproveDialog}
                    runsheetTitle={runsheet.title}
                    onConfirm={handleUnapprove}
                    isLoading={unapproveM.isPending}
                />
                <DeleteRunsheetDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    runsheetTitle={runsheet.title}
                    onConfirm={handleDelete}
                    isLoading={deleteMutation.isPending}
                />
                <AddItemDialog
                    open={showAddItemDialog}
                    onOpenChange={setShowAddItemDialog}
                    onSubmit={handleAddItem}
                    isLoading={addItemsMutation.isPending}
                />
                <EditItemDialog
                    open={showEditItemDialog}
                    onOpenChange={setShowEditItemDialog}
                    item={selectedItem}
                    onSubmit={handleEditItem}
                    isLoading={false}
                />
                <DeleteItemDialog
                    open={showDeleteItemDialog}
                    onOpenChange={setShowDeleteItemDialog}
                    itemTitle={selectedItem?.title || ""}
                    onConfirm={handleDeleteItem}
                    isLoading={false}
                />
                <SaveAsTemplateDialog
                    open={showSaveTemplateDialog}
                    onOpenChange={setShowSaveTemplateDialog}
                    runsheetId={runsheetId}
                    runsheetTitle={runsheet.title}
                    itemCount={items.length}
                    onSubmit={handleCreateTemplate}
                    isLoading={createTemplateMutation.isPending}
                />
            </div>
        </div>
    );
}
