'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Film, Image as ImageIcon, Music, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useUploadAsset } from '../hooks/useUploadAsset';

interface UploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgSlug: string;
    onSuccess?: () => void;
}

interface FileWithProgress {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

// Get file icon based on mime type
function getFileIcon(type: string) {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Film;
    if (type.startsWith('audio/')) return Music;
    return FileText;
}

// Format file size
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function UploadDialog({ open, onOpenChange, orgSlug, onSuccess }: UploadDialogProps) {
    const [files, setFiles] = useState<FileWithProgress[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();
    const uploadAsset = useUploadAsset(orgSlug);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            addFiles(selectedFiles);
        }
    }, []);

    const addFiles = (newFiles: File[]) => {
        const fileItems: FileWithProgress[] = newFiles.map(file => ({
            file,
            progress: 0,
            status: 'pending',
        }));
        setFiles(prev => [...prev, ...fileItems]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async () => {
        const pendingFiles = files.filter(f => f.status === 'pending');

        for (let i = 0; i < files.length; i++) {
            const fileItem = files[i];
            if (fileItem.status !== 'pending') continue;

            // Update status to uploading
            setFiles(prev => prev.map((f, idx) =>
                idx === i ? { ...f, status: 'uploading' as const, progress: 0 } : f
            ));

            try {
                // Simulate progress (since we don't have real progress tracking yet)
                const progressInterval = setInterval(() => {
                    setFiles(prev => prev.map((f, idx) =>
                        idx === i && f.progress < 90
                            ? { ...f, progress: f.progress + 10 }
                            : f
                    ));
                }, 100);

                await uploadAsset.mutateAsync(fileItem.file);

                clearInterval(progressInterval);

                // Mark as success
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'success' as const, progress: 100 } : f
                ));
            } catch (error: any) {
                // Mark as error
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? {
                        ...f,
                        status: 'error' as const,
                        error: error.message || 'Upload failed',
                        progress: 0
                    } : f
                ));
            }
        }

        // Check if all uploads completed
        const allCompleted = files.every(f => f.status === 'success' || f.status === 'error');
        if (allCompleted) {
            const successCount = files.filter(f => f.status === 'success').length;
            const errorCount = files.filter(f => f.status === 'error').length;

            if (successCount > 0) {
                toast({
                    title: 'Upload Complete',
                    description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
                });
                onSuccess?.();
            }

            if (errorCount > 0 && successCount === 0) {
                toast({
                    title: 'Upload Failed',
                    description: `${errorCount} file(s) failed to upload`,
                    variant: 'destructive',
                });
            }

            // Clear files and close dialog after a short delay
            setTimeout(() => {
                setFiles([]);
                onOpenChange(false);
            }, 1500);
        }
    };

    const hasFiles = files.length > 0;
    const hasPendingFiles = files.some(f => f.status === 'pending');
    const isUploading = files.some(f => f.status === 'uploading');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Upload Assets</DialogTitle>
                    <DialogDescription>
                        Upload images, videos, documents, or audio files
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Drag and Drop Area */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                            }`}
                    >
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm font-medium mb-2">
                            Drag and drop files here, or click to select
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                            Supports: Images, Videos, Audio, Documents (Max 100MB)
                        </p>
                        <Label htmlFor="file-upload" className="cursor-pointer">
                            <Button type="button" variant="outline" asChild>
                                <span>Select Files</span>
                            </Button>
                        </Label>
                        <Input
                            id="file-upload"
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileSelect}
                            accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.txt"
                        />
                    </div>

                    {/* File List */}
                    {hasFiles && (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {files.map((fileItem, index) => {
                                const FileIcon = getFileIcon(fileItem.file.type);
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 border rounded-lg"
                                    >
                                        <FileIcon className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {fileItem.file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(fileItem.file.size)}
                                            </p>
                                            {fileItem.status === 'uploading' && (
                                                <Progress value={fileItem.progress} className="h-1 mt-1" />
                                            )}
                                            {fileItem.status === 'error' && (
                                                <p className="text-xs text-destructive mt-1">{fileItem.error}</p>
                                            )}
                                            {fileItem.status === 'success' && (
                                                <p className="text-xs text-green-600 mt-1">Uploaded successfully</p>
                                            )}
                                        </div>
                                        {fileItem.status === 'pending' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => removeFile(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setFiles([]);
                                onOpenChange(false);
                            }}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={uploadFiles}
                            disabled={!hasPendingFiles || isUploading}
                        >
                            {isUploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} File(s)`}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
