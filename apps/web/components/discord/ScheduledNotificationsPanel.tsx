"use client";

import { useEffect, useMemo, useState } from "react";
import { ChannelSelector } from "@/components/discord/ChannelSelector";
import { AppButton } from "@/components/ui/AppButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DiscordScheduledNotification,
  useCreateScheduledNotification,
  useDeleteScheduledNotification,
  useDiscordRoles,
  useRunScheduledNotification,
  useScheduledNotifications,
  useUpdateScheduledNotification,
  useUpdateScheduledNotificationStatus,
} from "@/lib/hooks/useDiscord";
import { format } from "date-fns";
import { CalendarClock, Clock, Pause, Play, Plus, RefreshCw, Send, Trash2 } from "lucide-react";

type FormState = {
  id?: string;
  name: string;
  channelId: string;
  title: string;
  description: string;
  color: string;
  firstRunAt: string;
  recurrenceType: "none" | "daily" | "weekly";
  recurrenceInterval: number;
  timezone: string;
  mentionRoleId?: string;
  mentionEveryone: boolean;
  endAfterRuns?: number;
};

const defaultTimezone =
  typeof Intl !== "undefined" && Intl.DateTimeFormat().resolvedOptions().timeZone
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC";

const emptyForm: FormState = {
  name: "",
  channelId: "",
  title: "",
  description: "",
  color: "#5865F2",
  firstRunAt: "",
  recurrenceType: "none",
  recurrenceInterval: 1,
  timezone: defaultTimezone,
  mentionEveryone: false,
};

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return date.toISOString().slice(0, 16);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return format(new Date(value), "PPpp");
}

function recurrenceLabel(notification: DiscordScheduledNotification) {
  if (notification.recurrenceType === "daily") {
    return `Daily • every ${notification.recurrenceInterval} day(s)`;
  }
  if (notification.recurrenceType === "weekly") {
    return `Weekly • every ${notification.recurrenceInterval} week(s)`;
  }
  return "One-time";
}

function statusBadge(status: DiscordScheduledNotification["status"]) {
  const map: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    active: { label: "Active", variant: "default" },
    running: { label: "Running", variant: "default" },
    paused: { label: "Paused", variant: "secondary" },
    completed: { label: "Completed", variant: "outline" },
  };
  const entry = map[status] || map.active;
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

export function ScheduledNotificationsPanel({
  slug,
  disabled,
}: {
  slug: string;
  disabled?: boolean;
}) {
  const { data: notifications, isLoading, error, refetch } = useScheduledNotifications(slug);
  const { data: roles } = useDiscordRoles(slug, !disabled);
  const createMutation = useCreateScheduledNotification(slug);
  const updateMutation = useUpdateScheduledNotification(slug);
  const deleteMutation = useDeleteScheduledNotification(slug);
  const statusMutation = useUpdateScheduledNotificationStatus(slug);
  const runNowMutation = useRunScheduledNotification(slug);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!dialogOpen) {
      setForm(emptyForm);
      setFormError(null);
    }
  }, [dialogOpen]);

  const isEditing = !!form.id;

  const handleSubmit = async () => {
    if (!form.name || !form.channelId || !form.title || !form.firstRunAt) {
      setFormError("Name, channel, title, and first send time are required.");
      return;
    }

    const payload = {
      name: form.name,
      channelId: form.channelId,
      title: form.title,
      description: form.description || undefined,
      color: form.color || undefined,
      firstRunAt: new Date(form.firstRunAt).toISOString(),
      recurrenceType: form.recurrenceType,
      recurrenceInterval: form.recurrenceInterval,
      timezone: form.timezone || defaultTimezone,
      mentionEveryone: form.mentionEveryone,
      mentionRoleId: form.mentionRoleId || undefined,
      endAfterRuns: form.endAfterRuns,
    };

    setFormError(null);

    try {
      if (isEditing && form.id) {
        await updateMutation.mutateAsync({ id: form.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setDialogOpen(false);
      setForm(emptyForm);
      refetch();
    } catch (err: any) {
      setFormError(err.message || "Unable to save notification");
    }
  };

  const onEdit = (item: DiscordScheduledNotification) => {
    setForm({
      id: item.id,
      name: item.name,
      channelId: item.channelId,
      title: item.embedTitle,
      description: item.embedDescription || "",
      color: item.embedColor ? `#${item.embedColor.toString(16).padStart(6, "0")}` : "",
      firstRunAt: toLocalInput(item.firstRunAt || item.nextRunAt || undefined),
      recurrenceType: item.recurrenceType,
      recurrenceInterval: item.recurrenceInterval,
      timezone: item.timezone || defaultTimezone,
      mentionEveryone: item.mentionEveryone,
      mentionRoleId: item.mentionRoleId || undefined,
      endAfterRuns: item.endAfterRuns || undefined,
    });
    setDialogOpen(true);
  };

  const handlePauseResume = async (item: DiscordScheduledNotification) => {
    const nextStatus = item.status === "paused" ? "active" : "paused";
    await statusMutation.mutateAsync({ id: item.id, status: nextStatus });
  };

  const timeHint = useMemo(() => {
    if (!form.firstRunAt) return null;
    try {
      return format(new Date(form.firstRunAt), "PPpp");
    } catch {
      return null;
    }
  }, [form.firstRunAt]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Custom Discord Notifications
          </CardTitle>
          <CardDescription>
            Schedule recurring or one-off Discord messages from this organisation.
          </CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <AppButton disabled={disabled} className="gap-2">
              <Plus className="h-4 w-4" />
              New Notification
            </AppButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit notification" : "New notification"}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Define a message, pick a channel, and choose when it should send.
              </p>
            </DialogHeader>
            <div className="grid gap-3">
              {formError && <div className="text-sm text-red-600">{formError}</div>}
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Weekly reminder"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Message title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Don't forget scrims tonight!"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Message body</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Include key details, links, or checklists."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Embed color (hex)</Label>
                <Input
                  id="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="#5865F2"
                />
              </div>
              <div className="grid gap-2">
                <Label>Target channel</Label>
                <ChannelSelector
                  slug={slug}
                  value={form.channelId}
                  onChange={(value) => setForm({ ...form, channelId: value })}
                  disabled={disabled}
                  placeholder="Select a text channel"
                />
              </div>
              <div className="grid gap-2">
                <Label>When to send</Label>
                <Input
                  type="datetime-local"
                  value={form.firstRunAt}
                  onChange={(e) => setForm({ ...form, firstRunAt: e.target.value })}
                />
                {timeHint && (
                  <span className="text-xs text-muted-foreground">Local time: {timeHint}</span>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Repeat</Label>
                <div className="flex items-center gap-3">
                  <Select
                    value={form.recurrenceType}
                    onValueChange={(value) =>
                      setForm({ ...form, recurrenceType: value as FormState["recurrenceType"] })
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Repeat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">One-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.recurrenceType !== "none" && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Every</Label>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        className="w-20"
                        value={form.recurrenceInterval}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            recurrenceInterval: Math.max(1, Number(e.target.value)),
                          })
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        {form.recurrenceType === "daily" ? "day(s)" : "week(s)"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone">Timezone (label only)</Label>
                <Input
                  id="timezone"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  placeholder="America/New_York"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endAfterRuns">End after</Label>
                <Input
                  id="endAfterRuns"
                  type="number"
                  min={1}
                  placeholder="Optional number of sends"
                  value={form.endAfterRuns ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      endAfterRuns: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    id="mentionEveryone"
                    checked={form.mentionEveryone}
                    onCheckedChange={(checked) => setForm({ ...form, mentionEveryone: checked })}
                  />
                  <Label htmlFor="mentionEveryone">Ping everyone</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">or role:</Label>
                  <Select
                    value={form.mentionRoleId || ""}
                    onValueChange={(value) =>
                      setForm({ ...form, mentionRoleId: value || undefined })
                    }
                    disabled={!roles || roles.length === 0}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={roles?.length ? "Pick a role" : "No roles"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No role ping</SelectItem>
                      {(roles || []).map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <AppButton
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </AppButton>
              <AppButton
                onClick={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
                disabled={disabled}
              >
                {isEditing ? "Save changes" : "Create notification"}
              </AppButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {disabled && (
          <div className="text-sm text-muted-foreground">
            Link your Discord bot first to schedule messages.
          </div>
        )}
        {error && (
          <div className="text-sm text-red-600">
            Failed to load scheduled notifications: {(error as any)?.message || "Unknown error"}
          </div>
        )}
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading notifications…</div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="border border-border rounded-lg p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.name}</span>
                    {statusBadge(item.status)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Next run: {formatDate(item.nextRunAt)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {recurrenceLabel(item)} • Channel:{" "}
                    <span className="font-mono">{item.channelId}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Message: {item.embedTitle}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AppButton
                    variant="outline"
                    size="sm"
                    onClick={() => runNowMutation.mutate(item.id)}
                    disabled={disabled}
                    className="gap-1"
                  >
                    <Send className="h-4 w-4" />
                    Send now
                  </AppButton>
                  <AppButton
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                    disabled={disabled}
                    className="gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Edit
                  </AppButton>
                  <AppButton
                    variant="outline"
                    size="sm"
                    onClick={() => handlePauseResume(item)}
                    disabled={disabled || statusMutation.isPending}
                    className="gap-1"
                  >
                    {item.status === "paused" ? (
                      <>
                        <Play className="h-4 w-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    )}
                  </AppButton>
                  <AppButton
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("Delete this scheduled notification?")) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                    disabled={disabled}
                    className="gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No scheduled notifications yet.</div>
        )}
      </CardContent>
    </Card>
  );
}
