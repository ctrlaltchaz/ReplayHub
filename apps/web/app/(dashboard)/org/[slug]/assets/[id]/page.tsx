'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl } from '@/lib/api/config';
import {
    ArrowLeft,
    Calendar,
    Check,
    Clock,
    Download,
    Edit2,
    FileText,
    Film,
    HardDrive,
    Image as ImageIcon,
    Loader2,
    Music,
    Tag,
    Trash2,
    Upload,
    User,
    X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApproveAsset } from '../hooks/useApproveAsset';
import { useAsset } from '../hooks/useAsset';
import { useDeleteAsset } from '../hooks/useDeleteAsset';
import { useRejectAsset } from '../hooks/useRejectAsset';

export default function AssetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const slug = params?.slug as string;
    const assetId = params?.id as string;

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(true);

    const { data: asset, isLoading } = useAsset(slug, assetId);
    const deleteAsset = useDeleteAsset(slug);
    const approveAsset = useApproveAsset(slug);
    const rejectAsset = useRejectAsset(slug);

    // Fetch preview with credentials
    useEffect(() => {
        if (asset && (asset.mime.startsWith('image/') || asset.mime.startsWith('video/') || asset.mime.startsWith('audio/'))) {
            setPreviewLoading(true);
            const fetchPreview = async () => {
                try {
                    const url = getApiUrl(`/org/${slug}/assets/${asset.id}/download`);
                    const response = await fetch(url, { credentials: 'include' });
                    
                    if (response.ok) {
                        const blob = await response.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        setPreviewUrl(blobUrl);
                    }
                } catch (error) {
                    console.error('Preview fetch error:', error);
                } finally {
                    setPreviewLoading(false);
                }
            };

            fetchPreview();

            // Cleanup blob URL on unmount
            return () => {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
            };
        } else {
            setPreviewLoading(false);
        }
    }, [asset, slug]);

    const handleDownload = () => {
        if (!asset) return;
        const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/org/${slug}/assets/${asset.id}/download`;
        window.open(downloadUrl, '_blank');
    };

    const handleDelete = async () => {
        try {
            await deleteAsset.mutateAsync(assetId);
            toast({
                title: 'Asset Deleted',
                description: 'The asset has been deleted successfully.',
            });
            router.push(`/org/${slug}/assets`);
        } catch (error: any) {
            toast({
                title: 'Delete Failed',
                description: error.message || 'Failed to delete asset',
                variant: 'destructive',
            });
        }
    };

    const handleApprove = async () => {
        try {
            await approveAsset.mutateAsync(assetId);
            toast({
                title: 'Asset Approved',
                description: 'The asset has been approved and is now active.',
            });
            setApproveDialogOpen(false);
        } catch (error: any) {
            toast({
                title: 'Approval Failed',
                description: error.message || 'Failed to approve asset',
                variant: 'destructive',
            });
        }
    };

    const handleReject = async () => {
        try {
            await rejectAsset.mutateAsync(assetId);
            toast({
                title: 'Asset Rejected',
                description: 'The asset has been rejected and archived.',
            });
            setRejectDialogOpen(false);
        } catch (error: any) {
            toast({
                title: 'Rejection Failed',
                description: error.message || 'Failed to reject asset',
                variant: 'destructive',
            });
        }
    };

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    // Format date
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get file icon based on mime type
    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return ImageIcon;
        if (type.startsWith('video/')) return Film;
        if (type.startsWith('audio/')) return Music;
        return FileText;
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500';
            case 'pending':
                return 'bg-yellow-500';
            case 'archived':
                return 'bg-gray-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Asset Not Found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            The asset you're looking for doesn't exist.
                        </p>
                        <Button onClick={() => router.push(`/org/${slug}/assets`)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Assets
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const FileIcon = getFileIcon(asset.mime);
    const isImage = asset.mime.startsWith('image/');
    const isVideo = asset.mime.startsWith('video/');
    const isAudio = asset.mime.startsWith('audio/');

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/org/${slug}/assets`)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{asset.name}</h1>
                            <p className="text-sm text-muted-foreground">Version {asset.version}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Approval Actions for Pending Assets */}
                        {asset.status === 'pending' && (
                            <>
                                <Button
                                    variant="default"
                                    onClick={() => setApproveDialogOpen(true)}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setRejectDialogOpen(true)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Reject
                                </Button>
                            </>
                        )}

                        {/* Standard Actions */}
                        <Button variant="outline" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                        <Button variant="outline" onClick={() => router.push(`/org/${slug}/assets/${asset.id}/edit`)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(true)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Preview Section */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {previewLoading ? (
                                    <div className="flex items-center justify-center py-12 bg-muted rounded-lg">
                                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : isImage ? (
                                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt={asset.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                                                <p className="text-sm text-muted-foreground">Failed to load preview</p>
                                            </div>
                                        )}
                                    </div>
                                ) : isVideo ? (
                                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                        {previewUrl ? (
                                            <video
                                                controls
                                                className="w-full h-full"
                                                src={previewUrl}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <Film className="w-16 h-16 text-muted-foreground mb-4" />
                                                <p className="text-sm text-muted-foreground">Failed to load preview</p>
                                            </div>
                                        )}
                                    </div>
                                ) : isAudio ? (
                                    <div className="flex flex-col items-center justify-center py-12 bg-muted rounded-lg">
                                        <Music className="w-16 h-16 text-muted-foreground mb-4" />
                                        {previewUrl ? (
                                            <audio
                                                controls
                                                className="w-full max-w-md"
                                                src={previewUrl}
                                            >
                                                Your browser does not support the audio tag.
                                            </audio>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Failed to load audio</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 bg-muted rounded-lg">
                                        <FileIcon className="w-16 h-16 text-muted-foreground mb-4" />
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Preview not available for this file type
                                        </p>
                                        <Button onClick={handleDownload}>
                                            <Download className="w-4 h-4 mr-2" />
                                            Download to View
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-6">
                        {/* Status & Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <Badge className={getStatusColor(asset.status)}>
                                        {asset.status}
                                    </Badge>
                                </div>

                                <div className="flex items-start justify-between">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        File Type
                                    </span>
                                    <span className="text-sm font-medium text-right">{asset.mime}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <HardDrive className="w-4 h-4" />
                                        Size
                                    </span>
                                    <span className="text-sm font-medium">{formatFileSize(asset.size)}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Version
                                    </span>
                                    <span className="text-sm font-medium">{asset.version}</span>
                                </div>

                                <div className="flex items-start justify-between">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Created By
                                    </span>
                                    <span className="text-sm font-medium text-right">
                                        {asset.createdBy?.name || asset.createdBy?.email || 'Unknown'}
                                    </span>
                                </div>

                                <div className="flex items-start justify-between">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Created
                                    </span>
                                    <span className="text-sm font-medium text-right">
                                        {formatDate(asset.createdAt)}
                                    </span>
                                </div>

                                {asset.updatedAt !== asset.createdAt && (
                                    <div className="flex items-start justify-between">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Updated
                                        </span>
                                        <span className="text-sm font-medium text-right">
                                            {formatDate(asset.updatedAt)}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        {asset.tags && (Array.isArray(asset.tags) ? asset.tags.length > 0 : asset.tags) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        Tags
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {(Array.isArray(asset.tags)
                                            ? asset.tags
                                            : asset.tags.split(',')
                                        ).map((tag) => (
                                            <Badge key={tag} variant="secondary">
                                                {typeof tag === 'string' ? tag.trim() : tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Version History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Version History
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/org/${slug}/assets/${asset.id}/versions`)}
                                    >
                                        View All
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Current version: v{asset.version}
                                    </p>
                                    {asset._count?.versions && asset._count.versions > 1 && (
                                        <Badge variant="secondary">
                                            {asset._count.versions} versions
                                        </Badge>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => router.push(`/org/${slug}/assets/${asset.id}/versions/upload`)}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload New Version
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Asset</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{asset.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteAsset.isPending}
                        >
                            {deleteAsset.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Confirmation Dialog */}
            <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Asset</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve "{asset.name}"? It will become active and visible to all users.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={approveAsset.isPending}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {approveAsset.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Approve
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Confirmation Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Asset</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject "{asset.name}"? It will be archived and hidden from normal view.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={rejectAsset.isPending}
                        >
                            {rejectAsset.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Rejecting...
                                </>
                            ) : (
                                <>
                                    <X className="w-4 h-4 mr-2" />
                                    Reject
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
