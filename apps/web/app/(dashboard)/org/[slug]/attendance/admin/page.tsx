"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Download,
  Filter,
  LogIn,
  LogOut,
  PlusCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions/utils";
import { useToast } from "@/components/ui/use-toast";
import { useAttendanceEntries } from "@/hooks/attendance/useAttendanceEntries";
import { useProductionSessions } from "@/hooks/attendance/useProductionSessions";
import { useEventsList } from "@/hooks/events";
import type { AttendanceDepartment, AttendanceEntry, AttendanceStatus } from "@/types/attendance";
import type { AttendanceFilters } from "@/hooks/attendance/useAttendanceEntries";
import type { ProductionSession } from "@/hooks/attendance/useProductionSessions";
import { apiDelete, apiPatch, apiPost } from "@/lib/api/client";
import { useApiQuery } from "@/lib/api/query";

const DEPARTMENTS: { label: string; value: AttendanceDepartment }[] = [
  { label: "Broadcasting", value: "broadcasting" },
  { label: "Graphics", value: "graphics" },
  { label: "Social Media", value: "social_media" },
  { label: "Production", value: "production" },
  { label: "Camera Operator", value: "camera_operator" },
  { label: "Other", value: "other" },
];

const STATUSES: { label: string; value: AttendanceStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Absent", value: "absent" },
  { label: "Auto Clocked Out", value: "auto_clocked_out" },
];

type OrgUserListItem = {
  id: string;
  displayName?: string | null;
  email?: string | null;
};

type SessionFormState = {
  name: string;
  sessionDate: string;
  windowStart: string;
  windowEnd: string;
  isRecurring: boolean;
  eventId?: string | null;
};

const UNLINKED_EVENT_VALUE = "none";

function defaultSessionDate() {
  return format(new Date(), "yyyy-MM-dd");
}

function getInitialSessionForm(date: string): SessionFormState {
  return {
    name: "",
    sessionDate: date,
    windowStart: "12:00",
    windowEnd: "18:00",
    isRecurring: false,
    eventId: null,
  };
}

function isoDate(date: string) {
  const parsed = new Date(date);
  return parsed.toISOString();
}

function isoDateTime(date: string, time: string) {
  const parsed = new Date(`${date}T${time}`);
  return parsed.toISOString();
}

function toDateInputValue(value: string) {
  return value.split("T")[0];
}

function toTimeInputValue(value: string) {
  return new Date(value).toISOString().substring(11, 16);
}

function addDays(date: string, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDisplay(dateString?: string) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return `${format(date, "PP")} ${format(date, "p")}`;
}

function formatTimeRange(start?: string, end?: string) {
  if (!start || !end) return "—";
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${format(startDate, "p")} – ${format(endDate, "p")}`;
}

export default function AttendanceAdminPage() {
  usePageTitle("Attendance Admin");
  const params = useParams();
  const searchParams = useSearchParams();
  const initialDate = searchParams?.get("date") ?? defaultSessionDate();
  const initialSessionFilter = searchParams?.get("sessionId") ?? undefined;
  const slug = params?.slug as string;
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const canView = hasPermission(PERMISSIONS.ATTENDANCE_VIEW);
  const canManage = hasPermission(PERMISSIONS.ATTENDANCE_MANAGE);
  const canExport = hasPermission(PERMISSIONS.ATTENDANCE_EXPORT);

  const [filters, setFilters] = useState<AttendanceFilters & { scheduledDate: string }>(() => ({
    scheduledDate: initialDate,
    status: undefined,
    department: undefined,
    lateOnly: false,
    autoClockOutOnly: false,
    sessionId: initialSessionFilter,
  }));

  const [sessionRange, setSessionRange] = useState<{ from: string; to: string }>(() => ({
    from: initialDate,
    to: initialDate,
  }));
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);

  const [sessionForm, setSessionForm] = useState<SessionFormState>(() =>
    getInitialSessionForm(filters.scheduledDate)
  );
  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ProductionSession | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ProductionSession | null>(null);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AttendanceEntry | null>(null);
  const [reviewStatus, setReviewStatus] = useState<AttendanceStatus>("approved");
  const [reviewNotes, setReviewNotes] = useState("");

  const [clockDialogOpen, setClockDialogOpen] = useState(false);
  const [clocking, setClocking] = useState(false);
  const [clockOutId, setClockOutId] = useState<string | null>(null);
  const [manualClockOrgUserId, setManualClockOrgUserId] = useState("");
  const [manualClockSessionId, setManualClockSessionId] = useState("");
  const [manualClockDepartment, setManualClockDepartment] =
    useState<AttendanceDepartment>("production");
  const [manualClockNotes, setManualClockNotes] = useState("");
  const [undoClockOutId, setUndoClockOutId] = useState<string | null>(null);

  const sessionQueryRange = showUpcomingOnly ? undefined : sessionRange;

  const { data: entries, isLoading, refetch } = useAttendanceEntries(slug, filters);
  const {
    data: sessionList = [],
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useProductionSessions(slug, sessionQueryRange);
  const { data: orgUsersResponse, isLoading: orgUsersLoading } = useApiQuery<{
    users: OrgUserListItem[];
  }>(`/org/${slug}/users?limit=200`, {
    apiOptions: { slug },
    enabled: canManage,
  });
  const orgUsers = orgUsersResponse?.users ?? [];

  const sortedSessions = useMemo(() => {
    const list = [...sessionList];
    if (showUpcomingOnly) {
      list.sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
      return list;
    }
    list.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
    return list;
  }, [sessionList, showUpcomingOnly]);
  const { data: formEvents = [] } = useEventsList(slug, {
    from: sessionForm.sessionDate,
    to: addDays(sessionForm.sessionDate, 7),
  });
  const { data: rangeEvents = [] } = useEventsList(slug, {
    from: sessionRange.from,
    to: addDays(sessionRange.to, 1),
  });

  const summary = useMemo(
    () => ({
      total: entries?.length ?? 0,
      late: entries?.filter((entry) => entry.lateFlag).length ?? 0,
      auto: entries?.filter((entry) => entry.autoClockOut).length ?? 0,
      pending: entries?.filter((entry) => entry.status === "pending").length ?? 0,
    }),
    [entries]
  );

  if (!canView) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You do not have permission to view attendance.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleOpenReview = (entry: AttendanceEntry) => {
    setSelectedEntry(entry);
    setReviewStatus(entry.status);
    setReviewNotes(entry.overrideReason || "");
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedEntry) return;
    try {
      await apiPatch(`/org/${slug}/attendance/logger/${selectedEntry.id}/review`, {
        status: reviewStatus,
        overrideReason: reviewNotes || undefined,
      });
      toast({ title: "Attendance updated" });
      setReviewDialogOpen(false);
      setSelectedEntry(null);
      refetch();
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Try again later",
        variant: "destructive",
      });
    }
  };

  const handleClockOutEntry = async (entry: AttendanceEntry) => {
    setClockOutId(entry.id);
    try {
      await apiPost(`/org/${slug}/attendance/logger/clock-out`, {
        attendanceId: entry.id,
        overrideToken: "admin-panel",
      });
      toast({
        title: "Clocked out",
        description: `Closed attendance for ${entry.orgUser?.displayName ?? "member"}.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Unable to clock out",
        description: error instanceof Error ? error.message : "Try again later",
        variant: "destructive",
      });
    } finally {
      setClockOutId(null);
    }
  };

  const handleUndoClockOutEntry = async (entry: AttendanceEntry) => {
    setUndoClockOutId(entry.id);
    try {
      await apiPatch(`/org/${slug}/attendance/logger/${entry.id}/unclock-out`);
      toast({
        title: "Clock-out removed",
        description: `Reopened attendance for ${entry.orgUser?.displayName ?? "member"}.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Unable to undo clock-out",
        description: error instanceof Error ? error.message : "Try again later",
        variant: "destructive",
      });
    } finally {
      setUndoClockOutId(null);
    }
  };

  const openManualClockDialog = () => {
    const defaultSessionId =
      filters.sessionId ??
      sortedSessions.find((session) => session.status === "scheduled")?.id ??
      sortedSessions[0]?.id ??
      "";
    setManualClockSessionId(defaultSessionId);
    setManualClockOrgUserId("");
    setManualClockDepartment("production");
    setManualClockNotes("");
    setClockDialogOpen(true);
  };

  const handleManualClockIn = async () => {
    if (!manualClockOrgUserId) {
      toast({
        title: "Select a person",
        description: "Choose who you want to clock in.",
        variant: "destructive",
      });
      return;
    }
    if (!manualClockSessionId) {
      toast({
        title: "Choose a session",
        description: "Pick a production session to clock into.",
        variant: "destructive",
      });
      return;
    }
    setClocking(true);
    try {
      await apiPost(`/org/${slug}/attendance/logger/clock-in`, {
        orgUserId: manualClockOrgUserId,
        sessionId: manualClockSessionId,
        department: manualClockDepartment,
        roleNotes: manualClockNotes || undefined,
        overrideToken: "admin-panel",
      });
      toast({
        title: "Clocked in",
        description: "Attendance entry created for this member.",
      });
      setClockDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Unable to clock in",
        description: error instanceof Error ? error.message : "Try again later",
        variant: "destructive",
      });
    } finally {
      setClocking(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiPost<{ filePath?: string; fileName?: string }>(
        `/org/${slug}/attendance/logger/export`,
        {
          ...filters,
          format: "csv",
        }
      );
      toast({ title: "Export ready", description: "Download will open in a new tab." });
      if (response.filePath) {
        const url = response.filePath.startsWith("/data")
          ? response.filePath
          : `/api/download?path=${encodeURIComponent(response.filePath)}`;
        window.open(url, "_blank");
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Try again later",
        variant: "destructive",
      });
    }
  };

  const handleOpenSessionForm = (session?: ProductionSession) => {
    if (session) {
      setSessionForm({
        name: session.name,
        sessionDate: toDateInputValue(session.sessionDate),
        windowStart: toTimeInputValue(session.windowStart),
        windowEnd: toTimeInputValue(session.windowEnd),
        isRecurring: Boolean(session.isRecurring),
        eventId: session.eventId ?? null,
      });
      setEditingSession(session);
    } else {
      setSessionForm(getInitialSessionForm(filters.scheduledDate));
      setEditingSession(null);
    }
    setSessionFormOpen(true);
  };

  const handleSubmitSession = async () => {
    try {
      const payload = {
        name: sessionForm.name || "Production Session",
        sessionDate: isoDate(sessionForm.sessionDate),
        windowStart: isoDateTime(sessionForm.sessionDate, sessionForm.windowStart),
        windowEnd: isoDateTime(sessionForm.sessionDate, sessionForm.windowEnd),
        isRecurring: sessionForm.isRecurring,
        eventId: sessionForm.eventId ?? null,
      };
      if (editingSession) {
        await apiPatch(`/org/${slug}/attendance/sessions/${editingSession.id}`, payload);
        toast({ title: "Session updated" });
      } else {
        await apiPost(`/org/${slug}/attendance/sessions`, payload);
        toast({ title: "Session created" });
      }
      setSessionFormOpen(false);
      refetchSessions();
    } catch (error) {
      toast({
        title: "Session save failed",
        description: error instanceof Error ? error.message : "Try again later",
        variant: "destructive",
      });
    }
  };

  const handleCancelSession = async (session: ProductionSession) => {
    try {
      await apiPatch(`/org/${slug}/attendance/sessions/${session.id}`, { status: "cancelled" });
      toast({ title: "Session cancelled" });
      refetchSessions();
    } catch (error) {
      toast({
        title: "Unable to cancel session",
        description: error instanceof Error ? error.message : "Try again later",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = (session: ProductionSession) => {
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      const wasActiveFilter = filters.sessionId === sessionToDelete.id;
      await apiDelete(`/org/${slug}/attendance/sessions/${sessionToDelete.id}/hard`);
      toast({ title: "Session deleted" });
      refetchSessions();
      if (wasActiveFilter) {
        setFilters((prev) => ({ ...prev, sessionId: undefined }));
        refetch();
      }
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
      router.refresh();
    } catch (error) {
      toast({
        title: "Unable to delete session",
        description: error instanceof Error ? error.message : "Try again later",
        variant: "destructive",
      });
    }
  };

  const clearSessionFilter = () => setFilters((prev) => ({ ...prev, sessionId: undefined }));

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-7 w-7 text-primary" />
            Attendance Admin
          </h1>
          <p className="text-muted-foreground">
            Review, edit, and export attendance records for your Wednesday production sessions and
            any additional sessions you create.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" asChild>
            <Link href={`/org/${slug}/attendance`}>Back to Student View</Link>
          </Button>
          {canManage && (
            <Button onClick={() => handleOpenSessionForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Session
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryTile label="Total" value={summary.total} />
        <SummaryTile label="Pending" value={summary.pending} />
        <SummaryTile label="Late" value={summary.late} />
        <SummaryTile label="Auto Clock-outs" value={summary.auto} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Refine the attendance list.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={filters.scheduledDate}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, scheduledDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status ?? "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value === "all" ? undefined : (value as AttendanceStatus),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {STATUSES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={filters.department ?? "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    department: value === "all" ? undefined : (value as AttendanceDepartment),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {DEPARTMENTS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quick Toggles</Label>
              <div className="flex items-center justify-between">
                <Label htmlFor="late">Late</Label>
                <Switch
                  id="late"
                  checked={filters.lateOnly}
                  onCheckedChange={(value) => setFilters((prev) => ({ ...prev, lateOnly: value }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto">Auto Clock-out</Label>
                <Switch
                  id="auto"
                  checked={filters.autoClockOutOnly}
                  onCheckedChange={(value) =>
                    setFilters((prev) => ({ ...prev, autoClockOutOnly: value }))
                  }
                />
              </div>
            </div>
          </div>
          {filters.sessionId && (
            <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/50 p-3">
              <div>
                <p className="text-sm font-medium">Session filter active</p>
                <p className="text-xs text-muted-foreground">
                  Showing entries for selected session.
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={clearSessionFilter}>
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Attendance Entries</CardTitle>
            <CardDescription>All logs for the selected date.</CardDescription>
          </div>
          <div className="flex gap-2">
            {canManage && (
              <Button variant="secondary" onClick={openManualClockDialog}>
                <LogIn className="mr-2 h-4 w-4" />
                Manual Clock In
              </Button>
            )}
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
            {selectedEntry && (
              <Button variant="ghost" onClick={() => setSelectedEntry(null)}>
                Clear Selection
              </Button>
            )}
            {canExport && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedEntry && (
            <Card className="border-primary/40 bg-primary/5">
              <CardHeader>
                <CardTitle>Selected Entry</CardTitle>
                <CardDescription>Use the review dialog to make adjustments.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>
                  Student:{" "}
                  {selectedEntry.orgUser?.displayName ?? selectedEntry.orgUser?.email ?? "Unknown"}
                </p>
                <p>
                  Clocked in: {formatDisplay(selectedEntry.clockInAt)} · Clocked out:{" "}
                  {formatDisplay(selectedEntry.clockOutAt)}
                </p>
                <p>
                  Status: <StatusBadge status={selectedEntry.status} />
                </p>
              </CardContent>
            </Card>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Flags</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 8 : 7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Loading attendance…
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && (!entries || entries.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 8 : 7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                )}
                {entries?.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {entry.orgUser?.displayName || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.orgUser?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.department
                        ? DEPARTMENTS.find((option) => option.value === entry.department)?.label
                        : "—"}
                    </TableCell>
                    <TableCell>{entry.event?.title || "—"}</TableCell>
                    <TableCell>{formatDisplay(entry.clockInAt)}</TableCell>
                    <TableCell>{formatDisplay(entry.clockOutAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={entry.status} />
                    </TableCell>
                    <TableCell className="space-y-1">
                      {entry.lateFlag && <Badge variant="outline">Late</Badge>}
                      {entry.autoClockOut && <Badge>Auto 6pm</Badge>}
                      {entry.absenceReason && (
                        <Badge variant="secondary">{entry.absenceReason}</Badge>
                      )}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {entry.clockInAt &&
                            (entry.clockOutAt ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUndoClockOutEntry(entry)}
                                disabled={undoClockOutId === entry.id}
                              >
                                <LogIn className="mr-1 h-3 w-3" />
                                {undoClockOutId === entry.id ? "Undoing…" : "Undo clock-out"}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleClockOutEntry(entry)}
                                disabled={clockOutId === entry.id}
                              >
                                <LogOut className="mr-1 h-3 w-3" />
                                {clockOutId === entry.id ? "Clocking…" : "Clock out"}
                              </Button>
                            ))}
                          <Button size="sm" variant="ghost" onClick={() => handleOpenReview(entry)}>
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Production Sessions</CardTitle>
            <CardDescription>
              Recurring Wednesday session is created automatically. Add more sessions whenever you
              need them.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">See past sessions</p>
                <p className="text-xs text-muted-foreground">
                  Toggle on to browse the full schedule history instead of upcoming sessions only.
                </p>
              </div>
              <Switch checked={showUpcomingOnly} onCheckedChange={setShowUpcomingOnly} />
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={sessionRange.from}
                onChange={(event) =>
                  setSessionRange((prev) => ({ ...prev, from: event.target.value }))
                }
                disabled={showUpcomingOnly}
              />
              <Input
                type="date"
                value={sessionRange.to}
                onChange={(event) =>
                  setSessionRange((prev) => ({ ...prev, to: event.target.value }))
                }
                disabled={showUpcomingOnly}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionsLoading && (
            <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
              Loading sessions…
            </div>
          )}
          {!sessionsLoading && sessionList.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
              No sessions in this range. Create one to schedule attendance.
            </div>
          )}
          {sortedSessions.map((session) => {
            const sessionEventsForDay = rangeEvents.filter((event) =>
              event.startAt.startsWith(session.sessionDate.split("T")[0])
            );
            const linkedEvent =
              session.event ??
              (session.eventId
                ? rangeEvents.find((event) => event.id === session.eventId)
                : undefined);
            return (
              <div
                key={session.id}
                className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <p className="font-semibold">{session.name}</p>
                    <Badge variant={session.status === "scheduled" ? "default" : "secondary"}>
                      {session.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(session.sessionDate), "EEEE, PP")} ·{" "}
                    {formatTimeRange(session.windowStart, session.windowEnd)}
                  </p>
                  {linkedEvent ? (
                    <p className="text-xs text-muted-foreground">
                      Linked event: {linkedEvent.title} ·{" "}
                      {format(new Date(linkedEvent.startAt), "p")}
                    </p>
                  ) : (
                    sessionEventsForDay.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Events this day:{" "}
                        {sessionEventsForDay.map((event) => event.title).join(", ")}
                      </p>
                    )
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        sessionId: session.id,
                        scheduledDate: session.sessionDate.split("T")[0],
                      }));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    View Attendance
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenSessionForm(session)}
                  >
                    Edit
                  </Button>
                  {session.status !== "cancelled" && (
                    <Button size="sm" variant="ghost" onClick={() => handleCancelSession(session)}>
                      Cancel
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteSession(session)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Attendance</DialogTitle>
            <DialogDescription>Approve, reject, or mark as absent.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={reviewStatus}
                onValueChange={(value) => setReviewStatus(value as AttendanceStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reviewer Notes</Label>
              <Textarea
                value={reviewNotes}
                onChange={(event) => setReviewNotes(event.target.value)}
                placeholder="Optional override reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clockDialogOpen} onOpenChange={setClockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Clock In</DialogTitle>
            <DialogDescription>
              Clock in a member from the admin view and record their department.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Member</Label>
              <Select
                value={manualClockOrgUserId || "none"}
                onValueChange={(value) => setManualClockOrgUserId(value === "none" ? "" : value)}
                disabled={orgUsersLoading || clocking}
              >
                <SelectTrigger>
                  <SelectValue placeholder={orgUsersLoading ? "Loading users…" : "Select member"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select member</SelectItem>
                  {orgUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.displayName || user.email || user.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Session</Label>
              <Select
                value={manualClockSessionId || "none"}
                onValueChange={(value) => setManualClockSessionId(value === "none" ? "" : value)}
                disabled={clocking}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select session</SelectItem>
                  {sortedSessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.name} · {format(new Date(session.sessionDate), "PP")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={manualClockDepartment}
                onValueChange={(value) => setManualClockDepartment(value as AttendanceDepartment)}
                disabled={clocking}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role Notes (optional)</Label>
              <Textarea
                value={manualClockNotes}
                onChange={(event) => setManualClockNotes(event.target.value)}
                placeholder="Camera 2, Graphics, Floor Manager, etc."
                disabled={clocking}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClockDialogOpen(false)} disabled={clocking}>
              Cancel
            </Button>
            <Button onClick={handleManualClockIn} disabled={clocking}>
              {clocking ? "Clocking…" : "Clock In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={sessionFormOpen} onOpenChange={setSessionFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSession ? "Edit Session" : "Create Session"}</DialogTitle>
            <DialogDescription>Configure production session schedule.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={sessionForm.name}
                onChange={(event) =>
                  setSessionForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Production Session (e.g., REPLAY Crew)"
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={sessionForm.sessionDate}
                onChange={(event) =>
                  setSessionForm((prev) => ({ ...prev, sessionDate: event.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start</Label>
                <Input
                  type="time"
                  value={sessionForm.windowStart}
                  onChange={(event) =>
                    setSessionForm((prev) => ({ ...prev, windowStart: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End</Label>
                <Input
                  type="time"
                  value={sessionForm.windowEnd}
                  onChange={(event) =>
                    setSessionForm((prev) => ({ ...prev, windowEnd: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Linked Event (optional)</Label>
              <Select
                value={sessionForm.eventId ?? UNLINKED_EVENT_VALUE}
                onValueChange={(value) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    eventId: value === UNLINKED_EVENT_VALUE ? null : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNLINKED_EVENT_VALUE}>No linked event</SelectItem>
                  {formEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} · {format(new Date(event.startAt), "PPp")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Recurring weekly?</p>
                <p className="text-xs text-muted-foreground">
                  Enable to repeat weekly (Wednesday by default).
                </p>
              </div>
              <Switch
                checked={sessionForm.isRecurring}
                onCheckedChange={(value) =>
                  setSessionForm((prev) => ({ ...prev, isRecurring: value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitSession}>
              {editingSession ? "Save changes" : "Create session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              This permanently removes the session and its attendance linkage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Session: {sessionToDelete?.name}</p>
            <p>
              Date: {sessionToDelete ? format(new Date(sessionToDelete.sessionDate), "PPPP") : "—"}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSession}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  switch (status) {
    case "approved":
      return (
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
          <CheckCircle className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    case "absent":
      return <Badge variant="outline">Absent</Badge>;
    case "auto_clocked_out":
      return <Badge>Auto Clock-out</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}
