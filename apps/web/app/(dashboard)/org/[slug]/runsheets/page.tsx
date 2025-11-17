'use client';

import { PermissionGuard } from "@/components/permissions/PermissionGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { PERMISSIONS } from "@/lib/permissions/utils";
import type { CreateRunsheetDto, RunsheetQueryDto } from "@/types/runsheet";
import { format } from "date-fns";
import { Calendar, Clock, FileText, FolderOpen, Lock, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { DeleteRunsheetDialog } from "./[id]/components/DeleteRunsheetDialog";
import { RunsheetCreateDialog } from "./components/RunsheetCreateDialog";
import { useCreateRunsheet } from "./hooks/useCreateRunsheet";
import { useDeleteRunsheet } from "./hooks/useDeleteRunsheet";
import { useRunsheetsList } from "./hooks/useRunsheetsList";

export default function RunsheetsPage() {
    usePageTitle('Runsheets');
    const params = useParams();
    const slug = params?.slug as string;
    const { toast } = useToast();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedRunsheetId, setSelectedRunsheetId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<RunsheetQueryDto>({});

    const { data: runsheetsData, isLoading } = useRunsheetsList(slug, filters);
    const createMutation = useCreateRunsheet(slug);
    const deleteMutation = useDeleteRunsheet(slug);

    const runsheets = runsheetsData?.data || [];

    // Debug: log runsheet data to see event field
    console.log('Runsheets data:', runsheets.map(r => ({
        title: r.title,
        eventId: r.eventId,
        event: r.event
    })));

    // Filter by search query (client-side)
    const filteredRunsheets = runsheets.filter(runsheet =>
        runsheet.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateRunsheet = async (data: CreateRunsheetDto & { templateId?: string }) => {
        try {
            console.log('[Frontend] Creating runsheet with data:', data);
            await createMutation.mutateAsync(data);
            toast({ title: "Runsheet created", description: "Your runsheet has been created successfully." });
            setShowCreateDialog(false);
        } catch (error) {
            console.error('[Frontend] Failed to create runsheet:', error);
            console.error('[Frontend] Request data was:', data);
            if (error && typeof error === 'object' && 'response' in error) {
                console.error('[Frontend] Response error:', (error as any).response);
            }
            toast({
                title: "Failed to create runsheet",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleDeleteRunsheet = async () => {
        if (!selectedRunsheetId) return;
        try {
            await deleteMutation.mutateAsync(selectedRunsheetId);
            toast({
                title: "Runsheet deleted",
                description: "The runsheet has been permanently deleted."
            });
            setShowDeleteDialog(false);
            setSelectedRunsheetId(null);
        } catch (error) {
            toast({
                title: "Failed to delete runsheet",
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

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <FileText className="h-6 w-6" />
                            Runsheets
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            Create and manage event runsheets and schedules
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <PermissionGuard required={PERMISSIONS.RUNSHEETS_EDIT}>
                            <Link href={`/org/${slug}/runsheets/templates`}>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    <FolderOpen className="h-4 w-4 mr-2" />
                                    Manage Templates
                                </Button>
                            </Link>
                        </PermissionGuard>
                        <PermissionGuard required={PERMISSIONS.RUNSHEETS_EDIT}>
                            <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Runsheet
                            </Button>
                        </PermissionGuard>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search runsheets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Status Filter */}
                            <Select
                                value={filters.status || "all"}
                                onValueChange={(value) => {
                                    const newFilters = { ...filters };
                                    if (value === "all") {
                                        delete newFilters.status;
                                    } else {
                                        newFilters.status = value as "draft" | "approved" | "locked";
                                    }
                                    setFilters(newFilters);
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="locked">Locked</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Runsheets List */}
                {isLoading ? (
                    <div className="grid gap-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <div className="h-6 w-2/3 bg-muted animate-pulse rounded" />
                                        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                                        <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredRunsheets.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    {searchQuery || filters.status ? "No runsheets found" : "No runsheets yet"}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchQuery || filters.status
                                        ? "Try adjusting your filters"
                                        : "Create your first runsheet to get started"}
                                </p>
                                {!searchQuery && !filters.status && (
                                    <PermissionGuard required={PERMISSIONS.RUNSHEETS_EDIT}>
                                        <Button onClick={() => setShowCreateDialog(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Runsheet
                                        </Button>
                                    </PermissionGuard>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filteredRunsheets.map((runsheet) => (
                            <Card key={runsheet.id} className="hover:bg-muted/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <Link href={`/org/${slug}/runsheets/${runsheet.id}`} className="flex-1 min-w-0">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold text-lg font-montserrat">
                                                        {runsheet.title}
                                                    </h3>
                                                    {getStatusBadge(runsheet.status)}
                                                    {runsheet.status === 'locked' && (
                                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    {runsheet.event?.title && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>Linked to {runsheet.event.title}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>
                                                            {runsheet.items?.length || 0} items
                                                        </span>
                                                    </div>
                                                    <span>
                                                        Revision {runsheet.revision}
                                                    </span>
                                                </div>

                                                <div className="text-xs text-muted-foreground">
                                                    Created {format(new Date(runsheet.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Delete button - only show if not locked */}
                                        {runsheet.status !== 'locked' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedRunsheetId(runsheet.id);
                                                    setShowDeleteDialog(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <RunsheetCreateDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSubmit={handleCreateRunsheet}
                isLoading={createMutation.isPending}
            />

            <DeleteRunsheetDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDeleteRunsheet}
                isLoading={deleteMutation.isPending}
                runsheetTitle={
                    selectedRunsheetId
                        ? runsheets.find(r => r.id === selectedRunsheetId)?.title || "this runsheet"
                        : "this runsheet"
                }
            />
        </div>
    );
}
