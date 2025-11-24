"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { getApiUrl } from "@/lib/api/config";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useCreatePassword } from "./hooks/useCreatePassword";
import { usePassword } from "./hooks/usePassword";
import { usePasswords } from "./hooks/usePasswords";
import { useUpdatePassword } from "./hooks/useUpdatePassword";
import { usePasswordAuditLogs } from "./hooks/usePasswordAuditLogs";
import type { CreatePasswordPayload, PasswordEntry } from "@/types/passwords";
import { Copy, Eye, EyeOff, FileClock, Lock, PenLine, Plus, RefreshCw, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function TagList({ tags }: { tags: string[] }) {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
          {tag}
        </span>
      ))}
    </div>
  );
}

type PasswordFormValues = {
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  tags?: string[];
};

function PasswordForm({
  initial,
  onSubmit,
  submitting,
  requirePassword,
}: {
  initial?: Partial<CreatePasswordPayload>;
  submitting: boolean;
  requirePassword?: boolean;
  onSubmit: (payload: PasswordFormValues) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState(initial?.password ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordValue = password.trim();
    onSubmit({
      title: title.trim(),
      username: username.trim() || undefined,
      password: passwordValue ? passwordValue : undefined,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Prod DB Credentials"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="service-user"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={requirePassword}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://admin.example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Additional context, MFA hints, etc."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="comma,separated,tags"
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function PasswordRow({
  entry,
  onView,
  onEdit,
  onDelete,
  onViewLogs,
}: {
  entry: PasswordEntry;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewLogs: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            {entry.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{entry.username || "No username"}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Updated {formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={onView} aria-label="View password">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onViewLogs} aria-label="View audit logs">
            <FileClock className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Edit password">
            <PenLine className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Delete password">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {entry.url && (
          <p className="text-sm">
            <span className="text-muted-foreground">URL: </span>
            <a
              href={entry.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {entry.url}
            </a>
          </p>
        )}
        {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
        <TagList tags={entry.tags} />
      </CardContent>
    </Card>
  );
}

export default function PasswordsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<PasswordEntry | null>(null);
  const [viewingId, setViewingId] = useState<string | undefined>();
  const [viewingLogsId, setViewingLogsId] = useState<string | undefined>();
  const [reveal, setReveal] = useState(false);

  const { data: passwords, isLoading, refetch } = usePasswords(slug, search);
  const { data: viewingPassword, isFetching: loadingPassword } = usePassword(
    slug,
    viewingId,
    Boolean(viewingId)
  );
  const { data: auditLogs, isFetching: loadingAudit } = usePasswordAuditLogs(
    slug,
    viewingLogsId,
    Boolean(viewingLogsId)
  );

  const createMutation = useCreatePassword(slug);
  const updateMutation = useUpdatePassword(slug, editing?.id || "");
  const deleteMutation = useMutation({
    mutationFn: async (passwordId: string) => {
      const response = await fetch(getApiUrl(`/org/${slug}/passwords/${passwordId}`), {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to delete password");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passwords", slug] });
    },
  });

  const filtered = useMemo(() => passwords || [], [passwords]);

  const handleCreate = async (payload: PasswordFormValues) => {
    if (!payload.password) {
      toast({
        title: "Password required",
        description: "Please provide a password value.",
        variant: "destructive",
      });
      return;
    }
    try {
      await createMutation.mutateAsync(payload as CreatePasswordPayload);
      toast({ title: "Saved", description: "Password entry created." });
      setShowCreate(false);
    } catch (err) {
      toast({
        title: "Unable to save",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (payload: PasswordFormValues) => {
    if (!editing) return;
    try {
      await updateMutation.mutateAsync(payload);
      toast({ title: "Updated", description: "Password entry updated." });
      setEditing(null);
    } catch (err) {
      toast({
        title: "Unable to update",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (entry: PasswordEntry) => {
    try {
      await deleteMutation.mutateAsync(entry.id);
      toast({ title: "Deleted", description: `${entry.title} removed.` });
    } catch (err) {
      toast({
        title: "Unable to delete",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async (value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Unable to copy", variant: "destructive" });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Passwords</h1>
          <p className="text-muted-foreground mt-2 text-base">
            Securely store credentials and track every view.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Password</DialogTitle>
              </DialogHeader>
              <PasswordForm
                submitting={createMutation.isPending}
                onSubmit={handleCreate}
                requirePassword
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, username, or tag"
          className="md:w-72"
        />
      </div>

      <Separator />

      {isLoading ? (
        <p className="text-muted-foreground">Loading passwords...</p>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            No passwords yet. Add your first entry to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((entry) => (
            <PasswordRow
              key={entry.id}
              entry={entry}
              onView={() => {
                setViewingId(entry.id);
                setReveal(false);
              }}
              onEdit={() => setEditing(entry)}
              onDelete={() => handleDelete(entry)}
              onViewLogs={() => setViewingLogsId(entry.id)}
            />
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(viewingId)}
        onOpenChange={(open) => (!open ? setViewingId(undefined) : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewingPassword?.title || "Password"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {viewingPassword?.username || "No username"}
            </p>
            {viewingPassword?.url && (
              <a
                className="text-sm text-primary hover:underline"
                href={viewingPassword.url}
                target="_blank"
                rel="noreferrer"
              >
                {viewingPassword.url}
              </a>
            )}
            <div className="flex items-center gap-2">
              <Input
                type={reveal ? "text" : "password"}
                value={viewingPassword?.password || ""}
                readOnly
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setReveal((prev) => !prev)}
                aria-label="Toggle visibility"
              >
                {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(viewingPassword?.password)}
                aria-label="Copy password"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {viewingPassword?.notes && (
              <p className="text-sm text-muted-foreground">{viewingPassword.notes}</p>
            )}
            <TagList tags={viewingPassword?.tags || []} />
            <p className="text-xs text-muted-foreground">
              Last viewed{" "}
              {viewingPassword?.lastViewedAt
                ? formatDistanceToNow(new Date(viewingPassword.lastViewedAt), { addSuffix: true })
                : "just now"}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => (!open ? setEditing(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Password</DialogTitle>
          </DialogHeader>
          {editing && (
            <PasswordForm
              submitting={updateMutation.isPending}
              initial={{ ...editing, password: "" }}
              requirePassword={false}
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewingLogsId)}
        onOpenChange={(open) => (!open ? setViewingLogsId(undefined) : null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Access Logs</DialogTitle>
          </DialogHeader>
          {loadingAudit ? (
            <p className="text-sm text-muted-foreground">Loading logs...</p>
          ) : auditLogs && auditLogs.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-auto">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between border rounded-lg p-3 bg-muted/50"
                >
                  <div>
                    <p className="font-medium capitalize">{log.action.toLowerCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.membership?.displayName || log.membership?.email || "Unknown user"}
                    </p>
                    {log.ipAddress && (
                      <p className="text-xs text-muted-foreground mt-1">IP: {log.ipAddress}</p>
                    )}
                    {log.userAgent && (
                      <p className="text-xs text-muted-foreground">Agent: {log.userAgent}</p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No logs yet.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
