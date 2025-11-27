'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiUrl } from '@/lib/api/config';
import type { Asset } from '@/types/asset';
import { Download, FileText, Film, Folder, Image as ImageIcon, Music, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AssetCardProps {
    asset: Asset;
    orgSlug: string;
    onClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onDownload?: () => void;
}

const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    archived: 'bg-gray-100 text-gray-800 border-gray-200',
};

// Determine file type icon
function getFileIcon(mime: string) {
    if (mime.startsWith('image/')) return ImageIcon;
    if (mime.startsWith('video/')) return Film;
    if (mime.startsWith('audio/')) return Music;
    return FileText;
}

// Format file size
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function AssetCard({ asset, orgSlug, onClick, onEdit, onDelete, onDownload }: AssetCardProps) {
    const FileIcon = getFileIcon(asset.mime);
    const fileExtension = asset.mime.split('/')[1]?.toUpperCase() || 'FILE';
    const isImage = asset.mime.startsWith('image/');
    const isVideo = asset.mime.startsWith('video/');
    const isAudio = asset.mime.startsWith('audio/');
    
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewError, setPreviewError] = useState(false);

    // Fetch preview with credentials
    useEffect(() => {
        if (isImage || isVideo) {
            const fetchPreview = async () => {
                try {
                    const url = getApiUrl(`/org/${orgSlug}/assets/${asset.id}/download`);
                    const response = await fetch(url, { credentials: 'include' });
                    
                    if (response.ok) {
                        const blob = await response.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        setPreviewUrl(blobUrl);
                    } else {
                        setPreviewError(true);
                    }
                } catch (error) {
                    console.error('Preview fetch error:', error);
                    setPreviewError(true);
                }
            };

            fetchPreview();

            // Cleanup blob URL on unmount
            return () => {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
            };
        }
    }, [asset.id, orgSlug, isImage, isVideo]);

    return (
        <Card className="hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="group relative">
                            <CardTitle
                                className="text-base cursor-pointer hover:underline line-clamp-2 break-words"
                                onClick={onClick}
                            >
                                {asset.name}
                            </CardTitle>
                            {/* Tooltip for full filename */}
                            <div className="invisible group-hover:visible absolute z-50 left-0 top-full mt-1 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-md border max-w-xs whitespace-normal break-words pointer-events-none">
                                {asset.name}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap min-w-0">
                            <Badge variant="outline" className={`capitalize text-xs ${statusColors[asset.status]}`}>
                                {asset.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">v{asset.version}</span>
                            {asset.folder && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 min-w-0 max-w-full">
                                    <Folder className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate max-w-[120px]" title={asset.folder.name}>{asset.folder.name}</span>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-start gap-1 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload?.();
                            }}
                            title="Download"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.();
                            }}
                            title="Edit"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.();
                            }}
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
                {/* File Preview/Thumbnail */}
                <div 
                    className="aspect-video rounded-md bg-muted flex items-center justify-center overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={onClick}
                >
                    {isImage ? (
                        previewError || !previewUrl ? (
                            <div className="text-center">
                                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                <span className="text-xs font-mono text-muted-foreground">IMAGE</span>
                            </div>
                        ) : (
                            <img
                                src={previewUrl}
                                alt={asset.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        )
                    ) : isVideo ? (
                        previewError || !previewUrl ? (
                            <div className="text-center">
                                <Film className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                <span className="text-xs font-mono text-muted-foreground">VIDEO</span>
                            </div>
                        ) : (
                            <div className="relative w-full h-full bg-black/5">
                                <video
                                    src={previewUrl}
                                    className="w-full h-full object-cover"
                                    preload="metadata"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                    <Film className="w-12 h-12 text-white" />
                                </div>
                            </div>
                        )
                    ) : isAudio ? (
                        <div className="text-center">
                            <Music className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                            <span className="text-xs font-mono text-muted-foreground">AUDIO</span>
                        </div>
                    ) : (
                        <div className="text-center">
                            <FileIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                            <span className="text-xs font-mono text-muted-foreground">{fileExtension}</span>
                        </div>
                    )}
                </div>

                {/* File Info - Clickable */}
                <div 
                    className="flex items-center justify-between text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={onClick}
                >
                    <span>{formatFileSize(asset.size)}</span>
                    {asset._count && asset._count.versions > 1 && (
                        <span>{asset._count.versions} versions</span>
                    )}
                </div>

                {/* Tags - Clickable */}
                {asset.tags && (
                    <div className="flex flex-wrap gap-1 cursor-pointer min-w-0" onClick={onClick}>
                        {(Array.isArray(asset.tags)
                            ? asset.tags
                            : asset.tags.split(',')
                        ).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs truncate max-w-full">
                                {typeof tag === 'string' ? tag.trim() : tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Date - Clickable */}
                <div 
                    className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={onClick}
                >
                    {new Date(asset.createdAt).toLocaleDateString()}
                </div>
            </CardContent>
        </Card>
    );
}
