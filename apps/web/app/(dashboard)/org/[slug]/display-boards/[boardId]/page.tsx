"use client";

import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    ArrowLeft,
    Copy,
    ExternalLink,
    GripVertical,
    Image as ImageIcon,
    Loader2,
    Settings,
    Trash2,
    Upload
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { PermissionGuard } from "@/components/permissions/PermissionGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { PERMISSIONS } from "@/lib/permissions/utils";
import {
    DisplayBoardImage,
    useDeleteImage,
    useDisplayBoard,
    useReorderImages,
    useUpdateDisplayBoard,
    useUploadImage,
} from "../hooks/useDisplayBoards";

function SortableImageItem({ image, slug, boardId, onDelete }: { image: DisplayBoardImage; slug: string; boardId: string; onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const imageUrl = `/api/org/${slug}/display-boards/${boardId}/images/${image.id}/file`;

    return (
        <div ref={setNodeRef} style={style}>
            <Card className={isDragging ? "shadow-lg" : ""}>
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <button
                            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-2"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className="h-5 w-5" />
                        </button>
                        <div className="flex-1 space-y-3">
                            <img
                                src={imageUrl}
                                alt={image.fileName}
                                className="w-full max-w-sm h-auto rounded-lg border"
                            />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">{image.fileName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(image.fileSize / 1024).toFixed(1)} KB · Position {image.order + 1}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => onDelete(image.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function DisplayBoardDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const boardId = params?.boardId as string;
    const router = useRouter();
    const { toast } = useToast();

    const { data: board, isLoading } = useDisplayBoard(slug, boardId);
    const updateMutation = useUpdateDisplayBoard(slug);
    const uploadMutation = useUploadImage(slug, boardId);
    const deleteMutation = useDeleteImage(slug, boardId);
    const reorderMutation = useReorderImages(slug, boardId);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        interval: 5000,
        transition: "fade",
        status: "active",
    });
    const [localImages, setLocalImages] = useState<DisplayBoardImage[]>([]);

    usePageTitle(board?.name || "Display Board");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Sync form data and local images when board loads
    useEffect(() => {
        if (board) {
            setFormData({
                name: board.name,
                description: board.description || "",
                interval: board.interval,
                transition: board.transition || "fade",
                status: board.status,
            });
            setLocalImages(board.images);
        }
    }, [board]);

    const handleFileUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            for (const file of Array.from(files)) {
                try {
                    await uploadMutation.mutateAsync(file);
                    toast({
                        title: "Image uploaded",
                        description: `${file.name} has been added to the board.`,
                    });
                } catch (error) {
                    toast({
                        title: "Upload failed",
                        description: error instanceof Error ? error.message : "Failed to upload image",
                        variant: "destructive",
                    });
                }
            }

            e.target.value = "";
        },
        [uploadMutation, toast]
    );

    const handleDeleteImage = async (imageId: string) => {
        if (!confirm("Delete this image? This cannot be undone.")) return;

        try {
            await deleteMutation.mutateAsync(imageId);
            toast({
                title: "Image deleted",
                description: "The image has been removed from the board.",
            });
        } catch (error) {
            toast({
                title: "Delete failed",
                description: error instanceof Error ? error.message : "Failed to delete image",
                variant: "destructive",
            });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = localImages.findIndex((img) => img.id === active.id);
        const newIndex = localImages.findIndex((img) => img.id === over.id);

        const reordered = arrayMove(localImages, oldIndex, newIndex);
        setLocalImages(reordered);

        try {
            await reorderMutation.mutateAsync(reordered.map((img) => img.id));
            toast({
                title: "Order updated",
                description: "Image display order has been saved.",
            });
        } catch (error) {
            setLocalImages(board?.images || []);
            toast({
                title: "Reorder failed",
                description: error instanceof Error ? error.message : "Failed to update order",
                variant: "destructive",
            });
        }
    };

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMutation.mutateAsync({ id: boardId, ...formData });
            toast({
                title: "Settings updated",
                description: "Display board settings have been saved.",
            });
            setSettingsOpen(false);
        } catch (error) {
            toast({
                title: "Update failed",
                description: error instanceof Error ? error.message : "Failed to update settings",
                variant: "destructive",
            });
        }
    };

    const copyPublicUrl = () => {
        if (!board) return;
        const fullUrl = `${window.location.origin}${board.publicUrl}`;
        navigator.clipboard.writeText(fullUrl);
        toast({
            title: "Link copied",
            description: "Public viewer URL copied to clipboard",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!board) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Board not found</h2>
                <p className="text-muted-foreground mt-2">The display board you're looking for doesn't exist.</p>
                <Button asChild className="mt-4">
                    <Link href={`/org/${slug}/display-boards`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Boards
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <PermissionGuard required={PERMISSIONS.DISPLAY_BOARDS.VIEW}>
            <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/org/${slug}/display-boards`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                </div>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{board.name}</h1>
                            <Badge variant={board.status === "active" ? "default" : "secondary"}>
                                {board.status}
                            </Badge>
                        </div>
                        {board.description && (
                            <p className="text-muted-foreground mt-2">{board.description}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                            {board.imageCount} images · {board.interval / 1000}s interval
                        </p>
                    </div>
                    <PermissionGuard required={PERMISSIONS.DISPLAY_BOARDS.MANAGE}>
                        <Button variant="outline" onClick={() => setSettingsOpen(true)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                    </PermissionGuard>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Public Link</CardTitle>
                        <CardDescription>Share this link to display the slideshow</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex gap-2">
                            <Input
                                readOnly
                                value={`${typeof window !== "undefined" ? window.location.origin : ""}${board.publicUrl}`}
                                className="font-mono text-sm"
                            />
                            <Button variant="outline" onClick={copyPublicUrl}>
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" asChild>
                                <a href={board.publicUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <PermissionGuard required={PERMISSIONS.DISPLAY_BOARDS.MANAGE}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Images</CardTitle>
                            <CardDescription>Add images to the slideshow (JPEG, PNG, GIF, WebP - max 10MB)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileUpload}
                                    disabled={uploadMutation.isPending}
                                />
                            </label>
                        </CardContent>
                    </Card>
                </PermissionGuard>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Images ({localImages.length})</CardTitle>
                                <CardDescription>Drag to reorder how images display</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {localImages.length === 0 ? (
                            <div className="text-center py-12">
                                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No images uploaded yet</p>
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={localImages.map((img) => img.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-2">
                                        {localImages.map((image) => (
                                            <SortableImageItem key={image.id} image={image} slug={slug} boardId={boardId} onDelete={handleDeleteImage} />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent>
                    <form onSubmit={handleUpdateSettings}>
                        <DialogHeader>
                            <DialogTitle>Board Settings</DialogTitle>
                            <DialogDescription>Update display board configuration</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-interval">
                                    Display Interval: {formData.interval / 1000} seconds
                                </Label>
                                <input
                                    type="range"
                                    id="edit-interval"
                                    min="1000"
                                    max="30000"
                                    step="1000"
                                    value={formData.interval}
                                    onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-transition">Transition Effect</Label>
                                <select
                                    id="edit-transition"
                                    value={formData.transition}
                                    onChange={(e) => setFormData({ ...formData, transition: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="fade">Fade</option>
                                    <option value="slide">Slide</option>
                                    <option value="zoom">Zoom</option>
                                    <option value="none">None (Instant)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <select
                                    id="edit-status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </PermissionGuard>
    );
}
