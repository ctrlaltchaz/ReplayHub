'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Asset } from '@/types/asset';
import { Download, FileText, Film, Image as ImageIcon, Music, Pencil, Trash2 } from 'lucide-react';

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

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle
                            className="text-lg cursor-pointer hover:underline truncate"
                            onClick={onClick}
                        >
                            {asset.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`capitalize text-xs ${statusColors[asset.status]}`}>
                                {asset.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">v{asset.version}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload?.();
                            }}
                            title="Download"
                        >
                            <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.();
                            }}
                            title="Edit"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.();
                            }}
                            title="Delete"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent
                className="space-y-3 cursor-pointer"
                onClick={onClick}
            >
                {/* File Preview/Thumbnail */}
                <div className="aspect-video rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {isImage ? (
                        <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/org/${orgSlug}/assets/${asset.id}/download`}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : isVideo ? (
                        <div className="relative w-full h-full bg-black/5">
                            <video
                                src={`${process.env.NEXT_PUBLIC_API_URL}/org/${orgSlug}/assets/${asset.id}/download`}
                                className="w-full h-full object-cover"
                                preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Film className="w-12 h-12 text-white" />
                            </div>
                        </div>
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

                {/* File Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(asset.size)}</span>
                    {asset._count && asset._count.versions > 1 && (
                        <span>{asset._count.versions} versions</span>
                    )}
                </div>

                {/* Tags */}
                {asset.tags && (
                    <div className="flex flex-wrap gap-1">
                        {(Array.isArray(asset.tags)
                            ? asset.tags
                            : asset.tags.split(',')
                        ).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                                {typeof tag === 'string' ? tag.trim() : tag}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="text-xs text-muted-foreground">
                    {new Date(asset.createdAt).toLocaleDateString()}
                </div>
            </CardContent>
        </Card>
    );
}
