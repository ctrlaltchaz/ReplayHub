"use client";

import { formatDistanceToNow } from "date-fns";
import { Film, Loader2, Pencil, Trash2, Wand2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PermissionGuard } from "@/components/permissions/PermissionGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { PERMISSIONS } from "@/lib/permissions/utils";
import type { LiveGraphic } from "@/types/live-graphics";
import {
  useCreateLiveGraphic,
  useDeleteLiveGraphic,
  useLiveGraphics,
  useUpdateLiveGraphic,
} from "./hooks/useLiveGraphics";

export default function LiveGraphicsListPage() {
  usePageTitle("Live Graphics");
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { toast } = useToast();

  const { data: graphics, isLoading } = useLiveGraphics(slug);
  const createMutation = useCreateLiveGraphic(slug);
  const deleteMutation = useDeleteLiveGraphic(slug);
  const updateMetaMutation = useUpdateLiveGraphic(slug);

  const [draftForm, setDraftForm] = useState({ name: "", description: "" });
  const [editingGraphic, setEditingGraphic] = useState<LiveGraphic | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  useEffect(() => {
    if (editingGraphic) {
      setEditForm({
        name: editingGraphic.name ?? "",
        description: editingGraphic.description ?? "",
      });
    }
  }, [editingGraphic]);

  const handleCreateDraft = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await createMutation.mutateAsync({
        name: draftForm.name,
        description: draftForm.description,
      });
      toast({
        title: "Draft created",
        description: "We generated a control snippet and overlay codes.",
      });
      setDraftForm({ name: "", description: "" });
      router.push(`/org/${slug}/live-graphics/${created.id}`);
    } catch (error) {
      toast({
        title: "Create failed",
        description: error instanceof Error ? error.message : "Unable to create draft",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (graphic: LiveGraphic) => {
    const confirmed = window.confirm(`Delete ${graphic.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(graphic.id);
      toast({ title: "Deleted", description: `${graphic.name} has been removed.` });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unable to delete overlay",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingGraphic) return;

    try {
      await updateMetaMutation.mutateAsync({
        id: editingGraphic.id,
        name: editForm.name,
        description: editForm.description,
      });
      toast({ title: "Overlay updated", description: "Details saved successfully." });
      setEditingGraphic(null);
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to update overlay",
        variant: "destructive",
      });
    }
  };

  const sortedGraphics = useMemo(() => {
    return [...(graphics ?? [])].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [graphics]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          <Wand2 className="h-4 w-4" />
          Overlay control hub
        </div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Film className="h-8 w-8 text-primary" />
          Live Graphics
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          Browse every overlay, rename it, delete it, or jump into the full control screen for live
          updates and embed instructions.
        </p>
      </div>

      <PermissionGuard required={PERMISSIONS.LIVE_GRAPHICS_MANAGE}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Create live graphic draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateDraft}>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Grand Finals Lower Third"
                  value={draftForm.name}
                  onChange={(e) => setDraftForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Where this overlay is used or any notes"
                  value={draftForm.description}
                  onChange={(e) =>
                    setDraftForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate overlay code & open controls
              </Button>
            </form>
          </CardContent>
        </Card>
      </PermissionGuard>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>All live graphics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage overlays from here; the detailed control panel now lives on each overlay’s
                page.
              </p>
            </div>
            <Badge variant="secondary">{sortedGraphics.length} overlays</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <div className="space-y-2">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          )}
          {!isLoading && sortedGraphics.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No overlays yet. Generate your first draft above.
            </p>
          )}
          {!isLoading &&
            sortedGraphics.map((graphic) => (
              <div key={graphic.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-base">{graphic.name}</p>
                      <Badge variant={graphic.status === "active" ? "default" : "outline"}>
                        {graphic.status === "active" ? "Ready" : "Draft"}
                      </Badge>
                    </div>
                    {graphic.description && (
                      <p className="text-sm text-muted-foreground">{graphic.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(graphic.updatedAt))} ago · Public code{" "}
                      {graphic.publicCode.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/org/${slug}/live-graphics/${graphic.id}`}>Manage</Link>
                    </Button>
                    <PermissionGuard required={PERMISSIONS.LIVE_GRAPHICS_MANAGE}>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingGraphic(graphic)}
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(graphic)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      <EditOverlayDialog
        open={!!editingGraphic}
        onOpenChange={(open) => {
          if (!open) setEditingGraphic(null);
        }}
        name={editForm.name}
        description={editForm.description}
        onChange={setEditForm}
        onSubmit={handleEditSubmit}
        loading={updateMetaMutation.isPending}
      />
    </div>
  );
}

function EditOverlayDialog({
  open,
  onOpenChange,
  name,
  description,
  onChange,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description: string;
  onChange: (value: { name: string; description: string }) => void;
  onSubmit: (event: React.FormEvent) => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit overlay details</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => onChange({ name: e.target.value, description })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => onChange({ name, description: e.target.value })}
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
