"use client";

import { formatDistanceToNow } from "date-fns";
import { Copy, ExternalLink, Image, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

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
    useCreateDisplayBoard,
    useDeleteDisplayBoard,
    useDisplayBoards,
} from "./hooks/useDisplayBoards";

export default function DisplayBoardsListPage() {
    usePageTitle("Display Boards");
    const params = useParams();
    const slug = params?.slug as string;
    const router = useRouter();
    const { toast } = useToast();

    const { data: boards, isLoading } = useDisplayBoards(slug);
    const createMutation = useCreateDisplayBoard(slug);
    const deleteMutation = useDeleteDisplayBoard(slug);

    const [createOpen, setCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        interval: 5000,
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const board = await createMutation.mutateAsync(formData);
            toast({
                title: "Display board created",
                description: "You can now upload images to your board.",
            });
            setCreateOpen(false);
            setFormData({ name: "", description: "", interval: 5000 });
            router.push(`/org/${slug}/display-boards/${board.id}`);
        } catch (error) {
            toast({
                title: "Failed to create board",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This will permanently delete all images.`)) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(id);
            toast({
                title: "Board deleted",
                description: `"${name}" has been permanently deleted.`,
            });
        } catch (error) {
            toast({
                title: "Failed to delete board",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive",
            });
        }
    };

    const copyPublicUrl = (publicUrl: string) => {
        const fullUrl = `${window.location.origin}${publicUrl}`;
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

    return (
        <PermissionGuard required={PERMISSIONS.DISPLAY_BOARDS.VIEW}>
            <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Display Boards</h1>
                        <p className="text-muted-foreground mt-1">
                            Create image slideshows for digital signage
                        </p>
                    </div>
                    <PermissionGuard required={PERMISSIONS.DISPLAY_BOARDS.MANAGE}>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Board
                        </Button>
                    </PermissionGuard>
                </div>

                {boards && boards.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Image className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No display boards yet</h3>
                            <p className="text-muted-foreground text-center max-w-md mb-4">
                                Create your first display board to start cycling through images on digital signage.
                            </p>
                            <PermissionGuard required={PERMISSIONS.DISPLAY_BOARDS.MANAGE}>
                                <Button onClick={() => setCreateOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Display Board
                                </Button>
                            </PermissionGuard>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {boards?.map((board) => (
                            <Card key={board.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 flex-1">
                                            <CardTitle className="line-clamp-1">{board.name}</CardTitle>
                                            {board.description && (
                                                <CardDescription className="line-clamp-2">
                                                    {board.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <Badge variant={board.status === "active" ? "default" : "secondary"}>
                                            {board.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Images</span>
                                        <span className="font-medium">{board.imageCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Interval</span>
                                        <span className="font-medium">{board.interval / 1000}s</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Updated {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => copyPublicUrl(board.publicUrl)}
                                        >
                                            <Copy className="h-3 w-3 mr-2" />
                                            Copy Link
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <a href={board.publicUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </Button>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="flex-1"
                                            asChild
                                        >
                                            <Link href={`/org/${slug}/display-boards/${board.id}`}>
                                                Manage
                                            </Link>
                                        </Button>
                                        <PermissionGuard required={PERMISSIONS.DISPLAY_BOARDS.MANAGE}>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(board.id, board.name)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </PermissionGuard>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>Create Display Board</DialogTitle>
                            <DialogDescription>
                                Set up a new image slideshow for digital signage
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="Lobby Display"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Main entrance signage..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="interval">
                                    Display Interval: {formData.interval / 1000} seconds
                                </Label>
                                <input
                                    type="range"
                                    id="interval"
                                    min="1000"
                                    max="30000"
                                    step="1000"
                                    value={formData.interval}
                                    onChange={(e) =>
                                        setFormData({ ...formData, interval: parseInt(e.target.value) })
                                    }
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground">
                                    How long each image displays before transitioning
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending || !formData.name.trim()}>
                                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Create Board
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </PermissionGuard>
    );
}
