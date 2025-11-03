'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import type { Asset } from '@/types/asset';
import { Check, FileText, Loader2, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AssetCard } from '../components/AssetCard';
import { useApproveAsset } from '../hooks/useApproveAsset';
import { useAssets } from '../hooks/useAssets';
import { useRejectAsset } from '../hooks/useRejectAsset';

export default function PendingAssetsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const slug = params?.slug as string;

    const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
    const [processingBulk, setProcessingBulk] = useState(false);

    const { data: response, isLoading } = useAssets(slug, {
        status: 'pending',
        limit: 100,
    });

    const approveAsset = useApproveAsset(slug);
    const rejectAsset = useRejectAsset(slug);

    const assets = response?.data || [];

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
        if (selectedAssets.size === assets.length) {
            setSelectedAssets(new Set());
        } else {
            setSelectedAssets(new Set(assets.map((a) => a.id)));
        }
    };

    const handleBulkApprove = async () => {
        if (selectedAssets.size === 0) return;

        setProcessingBulk(true);
        let successCount = 0;
        let errorCount = 0;

        for (const assetId of selectedAssets) {
            try {
                await approveAsset.mutateAsync(assetId);
                successCount++;
            } catch (error) {
                errorCount++;
            }
        }

        setProcessingBulk(false);
        setSelectedAssets(new Set());

        toast({
            title: 'Bulk Approval Complete',
            description: `${successCount} asset(s) approved${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
    };

    const handleBulkReject = async () => {
        if (selectedAssets.size === 0) return;

        setProcessingBulk(true);
        let successCount = 0;
        let errorCount = 0;

        for (const assetId of selectedAssets) {
            try {
                await rejectAsset.mutateAsync(assetId);
                successCount++;
            } catch (error) {
                errorCount++;
            }
        }

        setProcessingBulk(false);
        setSelectedAssets(new Set());

        toast({
            title: 'Bulk Rejection Complete',
            description: `${successCount} asset(s) rejected${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
    };

    const handleDownload = (asset: Asset) => {
        const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/org/${slug}/assets/${asset.id}/download`;
        window.open(downloadUrl, '_blank');
    };

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <FileText className="w-6 h-6" />
                            Pending Assets
                        </h1>
                        <p className="text-muted-foreground">
                            Review and approve assets waiting for approval
                        </p>
                    </div>
                    {selectedAssets.size > 0 && (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                {selectedAssets.size} selected
                            </Badge>
                            <Button
                                onClick={handleBulkApprove}
                                disabled={processingBulk}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Approve Selected
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleBulkReject}
                                disabled={processingBulk}
                                className="text-destructive hover:text-destructive"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Reject Selected
                            </Button>
                        </div>
                    )}
                </div>

                {/* Select All */}
                {assets.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={selectedAssets.size === assets.length && assets.length > 0}
                            onCheckedChange={toggleSelectAll}
                        />
                        <label className="text-sm text-muted-foreground cursor-pointer" onClick={toggleSelectAll}>
                            Select all ({assets.length})
                        </label>
                    </div>
                )}

                {/* Assets Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : assets && assets.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {assets.map((asset) => (
                            <div key={asset.id} className="relative">
                                <div className="absolute top-3 left-3 z-10">
                                    <Checkbox
                                        checked={selectedAssets.has(asset.id)}
                                        onCheckedChange={() => toggleAssetSelection(asset.id)}
                                        className="bg-background"
                                    />
                                </div>
                                <AssetCard
                                    orgSlug={slug}
                                    asset={asset}
                                    onClick={() => router.push(`/org/${slug}/assets/${asset.id}`)}
                                    onDownload={() => handleDownload(asset)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Pending Assets</h3>
                            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                                All assets have been reviewed. New uploads will appear here for approval.
                            </p>
                            <Button onClick={() => router.push(`/org/${slug}/assets`)}>
                                View All Assets
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
