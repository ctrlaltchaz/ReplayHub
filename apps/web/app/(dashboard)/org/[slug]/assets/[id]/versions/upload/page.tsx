'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, Loader2, Upload } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAsset } from '../../../hooks/useAsset';
import { useUploadAsset } from '../../../hooks/useUploadAsset';

export default function UploadVersionPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const slug = params?.slug as string;
    const assetId = params?.id as string;

    const { data: asset, isLoading: assetLoading } = useAsset(slug, assetId);
    const uploadAsset = useUploadAsset(slug);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !asset) return;

        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
        }, 200);

        try {
            // Create a file with the same name as the original asset
            // This will trigger version creation on the backend
            const versionFile = new File([selectedFile], asset.name, {
                type: selectedFile.type,
            });

            await uploadAsset.mutateAsync({ file: versionFile });

            clearInterval(progressInterval);
            setUploadProgress(100);

            toast({
                title: 'Version Uploaded',
                description: 'New version has been uploaded successfully.',
            });

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['asset', slug, assetId] });
            queryClient.invalidateQueries({ queryKey: ['asset-versions', slug, assetId] });
            queryClient.invalidateQueries({ queryKey: ['assets', slug] });

            // Redirect after short delay
            setTimeout(() => {
                router.push(`/org/${slug}/assets/${assetId}/versions`);
            }, 1000);
        } catch (error: any) {
            clearInterval(progressInterval);
            toast({
                title: 'Upload Failed',
                description: error.message || 'Failed to upload new version',
                variant: 'destructive',
            });
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    if (assetLoading) {
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
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/org/${slug}/assets/${assetId}/versions`)}
                        disabled={isUploading}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Upload className="w-6 h-6" />
                            Upload New Version
                        </h1>
                        <p className="text-sm text-muted-foreground">{asset.name}</p>
                    </div>
                </div>

                {/* Current Version Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Current Version Info</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Version</p>
                            <p className="text-sm font-medium mt-1">v{asset.version}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">File Size</p>
                            <p className="text-sm font-medium mt-1">{formatFileSize(asset.size)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">File Type</p>
                            <p className="text-sm font-medium mt-1">{asset.mime}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className="text-sm font-medium mt-1 capitalize">{asset.status}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Upload Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Select New Version</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="file">File</Label>
                            <Input
                                id="file"
                                type="file"
                                onChange={handleFileSelect}
                                disabled={isUploading}
                                accept={asset.mime.split('/')[0] + '/*'}
                            />
                            <p className="text-xs text-muted-foreground">
                                Select a file of the same type ({asset.mime}) to upload as a new version
                            </p>
                        </div>

                        {selectedFile && (
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium">{selectedFile.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Type: {selectedFile.type}
                                </p>
                            </div>
                        )}

                        {isUploading && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} />
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/org/${slug}/assets/${assetId}/versions`)}
                                disabled={isUploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Version
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">About Versions:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Uploading creates version {asset.version + 1}</li>
                                <li>Previous versions are preserved and can be downloaded</li>
                                <li>The new version becomes the current active version</li>
                                <li>All metadata (name, tags, status) are preserved</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
