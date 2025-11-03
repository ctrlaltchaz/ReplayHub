'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import type { Asset, AssetStatus } from '@/types/asset';
import { useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, Plus, Search, Tag, Tags, Trash2, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AssetCard } from './components/AssetCard';
import { BulkActionsDialog } from './components/BulkActionsDialog';
import { UploadDialog } from './components/UploadDialog';
import { useAssets } from './hooks/useAssets';
import { useAssetTags } from './hooks/useAssetTags';
import { useDeleteAsset } from './hooks/useDeleteAsset';

export default function AssetsPage() {
    usePageTitle('Assets');
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const slug = params?.slug as string;
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
    const [bulkAction, setBulkAction] = useState<'tags' | 'status' | null>(null);
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);

    const { data: response, isLoading } = useAssets(slug, {
        q: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
    });

    const { data: tagsResponse } = useAssetTags(slug);
    const allTags = tagsResponse?.tags || [];
    const deleteAsset = useDeleteAsset(slug);

    const assets = response?.data || [];

    // Filter assets by selected tags (client-side for now)
    const filteredAssets = selectedTags.length > 0
        ? assets.filter((asset) => {
            const assetTags = Array.isArray(asset.tags)
                ? asset.tags
                : typeof asset.tags === 'string'
                    ? asset.tags.split(',').map((t) => t.trim().toLowerCase())
                    : [];
            return selectedTags.every((tag) => assetTags.includes(tag.toLowerCase()));
        })
        : assets;

    // Calculate stats
    const stats = filteredAssets.length > 0
        ? {
            total: filteredAssets.length,
            active: filteredAssets.filter((a) => a.status === 'active').length,
            pending: filteredAssets.filter((a) => a.status === 'pending').length,
            archived: filteredAssets.filter((a) => a.status === 'archived').length,
            totalSize: filteredAssets.reduce((sum, a) => sum + a.size, 0),
        }
        : { total: 0, active: 0, pending: 0, archived: 0, totalSize: 0 };

    // Format total size
    const formatTotalSize = (bytes: number): string => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    const handleDownload = (asset: Asset) => {
        const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/org/${slug}/assets/${asset.id}/download`;
        window.open(downloadUrl, '_blank');
    };

    const handleUploadSuccess = () => {
        // Invalidate and refetch assets
        queryClient.invalidateQueries({ queryKey: ['assets', slug] });
        queryClient.invalidateQueries({ queryKey: ['asset-tags', slug] });
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const clearTagFilters = () => {
        setSelectedTags([]);
    };

    const toggleAssetSelection = (assetId: string) => {
        setSelectedAssets((prev) => {
            const next = new Set(prev);
            if (next.has(assetId)) {
                next.delete(assetId);
            } else {
                next.add(assetId);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedAssets.size === filteredAssets.length) {
            setSelectedAssets(new Set());
        } else {
            setSelectedAssets(new Set(filteredAssets.map((a) => a.id)));
        }
    };

    const handleBulkAction = async (action: 'tags' | 'status', value: string[] | AssetStatus) => {
        setIsProcessingBulk(true);
        let successCount = 0;
        let errorCount = 0;

        for (const assetId of selectedAssets) {
            try {
                const url = `${process.env.NEXT_PUBLIC_API_URL}/org/${slug}/assets/${assetId}`;
                const updateData = action === 'tags'
                    ? { tags: value as string[] }
                    : { status: value as AssetStatus };

                await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                    credentials: 'include',
                });
                successCount++;
            } catch (error) {
                errorCount++;
            }
        }

        setIsProcessingBulk(false);
        setBulkAction(null);
        setSelectedAssets(new Set());

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['assets', slug] });
        queryClient.invalidateQueries({ queryKey: ['asset-tags', slug] });

        toast({
            title: 'Bulk Update Complete',
            description: `${successCount} asset(s) updated${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
    };

    const handleBulkDelete = async () => {
        if (selectedAssets.size === 0) return;

        if (!confirm(`Delete ${selectedAssets.size} asset(s)? This cannot be undone.`)) {
            return;
        }

        setIsProcessingBulk(true);
        let successCount = 0;
        let errorCount = 0;

        for (const assetId of selectedAssets) {
            try {
                await deleteAsset.mutateAsync(assetId);
                successCount++;
            } catch (error) {
                errorCount++;
            }
        }

        setIsProcessingBulk(false);
        setSelectedAssets(new Set());

        toast({
            title: 'Bulk Delete Complete',
            description: `${successCount} asset(s) deleted${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
    };

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <FileText className="w-6 h-6" />
                            Asset Library
                        </h1>
                        <p className="text-muted-foreground">Manage your digital assets and media files</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {stats.pending > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/org/${slug}/assets/pending`)}
                            >
                                <Badge variant="secondary" className="mr-2">
                                    {stats.pending}
                                </Badge>
                                Review Pending
                            </Button>
                        )}
                        <Button onClick={() => setUploadDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Upload Asset
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Total Assets</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                            <p className="text-xs text-muted-foreground">Active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
                            <p className="text-xs text-muted-foreground">Archived</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{formatTotalSize(stats.totalSize)}</div>
                            <p className="text-xs text-muted-foreground">Total Size</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tag Cloud */}
                {allTags.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Popular Tags
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {allTags.slice(0, 15).map(({ tag, count }) => (
                                    <Badge
                                        key={tag}
                                        variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
                                        className="cursor-pointer hover:bg-primary/80"
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag} ({count})
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Search and Filters */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AssetStatus | 'all')}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Active Tag Filters */}
                    {selectedTags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-muted-foreground">Filtering by:</span>
                            {selectedTags.map((tag) => (
                                <Badge key={tag} variant="default" className="gap-1">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className="ml-1 hover:bg-primary-foreground/20 rounded-full"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearTagFilters}
                                className="h-7"
                            >
                                Clear all
                            </Button>
                        </div>
                    )}
                </div>

                {/* Bulk Actions Toolbar */}
                {selectedAssets.size > 0 && (
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Checkbox
                                        checked={selectedAssets.size === filteredAssets.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                    <span className="text-sm font-medium">
                                        {selectedAssets.size} asset(s) selected
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setBulkAction('tags')}
                                        disabled={isProcessingBulk}
                                    >
                                        <Tags className="w-4 h-4 mr-2" />
                                        Edit Tags
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setBulkAction('status')}
                                        disabled={isProcessingBulk}
                                    >
                                        Change Status
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                        disabled={isProcessingBulk}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedAssets(new Set())}
                                        disabled={isProcessingBulk}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Assets Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredAssets && filteredAssets.length > 0 ? (
                    <>
                        {/* Select All Option */}
                        {filteredAssets.length > 1 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Checkbox
                                    checked={selectedAssets.size === filteredAssets.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                                <span>Select all {filteredAssets.length} assets</span>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredAssets.map((asset) => (
                                <div key={asset.id} className="relative">
                                    {/* Selection Checkbox */}
                                    <div className="absolute top-2 left-2 z-10">
                                        <Checkbox
                                            checked={selectedAssets.has(asset.id)}
                                            onCheckedChange={() => toggleAssetSelection(asset.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="bg-background"
                                        />
                                    </div>
                                    <AssetCard
                                        asset={asset}
                                        orgSlug={slug}
                                        onClick={() => router.push(`/org/${slug}/assets/${asset.id}`)}
                                        onDownload={() => handleDownload(asset)}
                                        onEdit={() => router.push(`/org/${slug}/assets/${asset.id}/edit`)}
                                        onDelete={async () => {
                                            if (confirm(`Delete "${asset.name}"? This cannot be undone.`)) {
                                                try {
                                                    await deleteAsset.mutateAsync(asset.id);
                                                    toast({
                                                        title: 'Asset Deleted',
                                                        description: 'The asset has been deleted successfully.',
                                                    });
                                                } catch (error: any) {
                                                    toast({
                                                        title: 'Delete Failed',
                                                        description: error.message || 'Failed to delete asset',
                                                        variant: 'destructive',
                                                    });
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Assets</h3>
                            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                                {searchQuery || statusFilter !== 'all' || selectedTags.length > 0
                                    ? 'No assets match your search criteria.'
                                    : 'Get started by uploading your first asset.'}
                            </p>
                            {selectedTags.length > 0 && (
                                <Button variant="outline" onClick={clearTagFilters} className="mb-2">
                                    Clear Tag Filters
                                </Button>
                            )}
                            <Button onClick={() => setUploadDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Upload Asset
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Upload Dialog */}
            <UploadDialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                orgSlug={slug}
                onSuccess={handleUploadSuccess}
            />

            {/* Bulk Actions Dialog */}
            <BulkActionsDialog
                open={bulkAction !== null}
                onOpenChange={(open) => !open && setBulkAction(null)}
                action={bulkAction}
                onConfirm={handleBulkAction}
                isProcessing={isProcessingBulk}
                selectedCount={selectedAssets.size}
            />
        </div>
    );
}
