'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Download,
    FileText,
    Loader2,
    Upload,
    User,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useAsset } from '../../hooks/useAsset';
import { useAssetVersions } from '../../hooks/useAssetVersions';

export default function AssetVersionsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const assetId = params?.id as string;

    const { data: asset, isLoading: assetLoading } = useAsset(slug, assetId);
    const { data: versionsResponse, isLoading: versionsLoading } = useAssetVersions(slug, assetId);

    const versions = versionsResponse?.versions || [];

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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDownloadVersion = (versionId: string) => {
        const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/org/${slug}/assets/${assetId}/versions/${versionId}/download`;
        window.open(downloadUrl, '_blank');
    };

    if (assetLoading || versionsLoading) {
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
                        <Button onClick={() => router.push(`/org/${slug}/assets`)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Assets
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/org/${slug}/assets/${assetId}`)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <Clock className="w-6 h-6" />
                                Version History
                            </h1>
                            <p className="text-sm text-muted-foreground">{asset.name}</p>
                        </div>
                    </div>
                    <Button onClick={() => router.push(`/org/${slug}/assets/${assetId}/versions/upload`)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New Version
                    </Button>
                </div>

                {/* Current Version Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Current Version</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Version</p>
                            <Badge variant="default" className="mt-1">
                                v{asset.version}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">File Size</p>
                            <p className="text-sm font-medium mt-1">{formatFileSize(asset.size)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Last Updated</p>
                            <p className="text-sm font-medium mt-1">
                                {formatDate(asset.updatedAt)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant="secondary" className="mt-1 capitalize">
                                {asset.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Version History Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Versions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {versions.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-sm text-muted-foreground">
                                    No version history available
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Version</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Uploaded By</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {versions.map((version, index) => {
                                        const isLatest = index === 0;
                                        return (
                                            <TableRow key={version.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">
                                                            v{versions.length - index}
                                                        </span>
                                                        {isLatest && (
                                                            <Badge variant="default" className="text-xs">
                                                                Current
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatFileSize(version.size)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {version.createdBy?.name ||
                                                                version.createdBy?.email ||
                                                                'Unknown'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                                        {formatDate(version.createdAt)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownloadVersion(version.id)}
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
