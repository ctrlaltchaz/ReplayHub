"use client";

import { MobileTabNavigation } from "@/components/ui/mobile-tab-navigation";
import { format } from "date-fns";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  LogIn,
  LogOut,
  PlusCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/components/ui/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { PERMISSIONS } from "@/lib/permissions/utils";

import { useAttendanceEntries, useMyAttendance } from "@/hooks/attendance";
import type { AttendanceFilters } from "@/hooks/attendance/useAttendanceEntries";
import type { ProductionSession } from "@/hooks/attendance/useProductionSessions";
import { useProductionSessions } from "@/hooks/attendance/useProductionSessions";
import { useEventsList } from "@/hooks/events";
import { apiPatch, apiPost } from "@/lib/api/client";
import type { AttendanceDepartment, AttendanceStatus } from "@/types/attendance";

const DEPARTMENTS: { label: string; value: AttendanceDepartment }[] = [
  { label: "Broadcasting", value: "broadcasting" },
  { label: "Graphics", value: "graphics" },
  { label: "Social Media", value: "social_media" },
  { label: "Production", value: "production" },
  { label: "Camera Operator", value: "camera_operator" },
  { label: "Other", value: "other" },
];

const ABSENCE_REASONS = [
  { label: "Illness", value: "illness" },
  { label: "Authorised Appointment", value: "appointment" },
  { label: "Forgot", value: "forgot" },
  { label: "Other", value: "other" },
];

type TabValue = "student" | "sessions";

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

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

export default function AttendancePage() {
  usePageTitle("Attendance");
  const params = useParams();
  const slug = params?.slug as string;
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const canView = hasPermission(PERMISSIONS.ATTENDANCE_VIEW);
  const canManage = hasPermission(PERMISSIONS.ATTENDANCE_MANAGE);

  const initialScheduledDate = useMemo(() => defaultSessionDate(), []);
  const [now, setNow] = useState(() => Date.now());
  const [activeTab, setActiveTab] = useState<TabValue>("student");

  const [filters, setFilters] = useState<AttendanceFilters & { scheduledDate: string }>(() => ({
    scheduledDate: initialScheduledDate,
    status: undefined,
    department: undefined,
    lateOnly: false,
    autoClockOutOnly: false,
    sessionId: undefined,
  }));

  const [sessionRange, setSessionRange] = useState<{ from: string; to: string }>(() => ({
    from: initialScheduledDate,
    to: initialScheduledDate,
  }));

  const [sessionForm, setSessionForm] = useState<SessionFormState>(() =>
    getInitialSessionForm(initialScheduledDate)
  );

  const { data: entries, refetch } = useAttendanceEntries(slug, filters);
  const { data: myEntries, refetch: refetchMine } = useMyAttendance(slug);
  const { data: upcomingSessions = [] } = useProductionSessions(slug, {
    from: initialScheduledDate,
  });
  const {
    data: sessionList = [],
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useProductionSessions(slug, sessionRange);
  const sessionForNow = useMemo(() => {
    if (!upcomingSessions?.length) return null;
    const sorted = [...upcomingSessions]
      .filter((session) => session.status === "scheduled")
      .sort((a, b) => new Date(a.windowStart).getTime() - new Date(b.windowStart).getTime());
    const nowTs = now;
    const currentOrNext = sorted.find((session) => {
      const end = new Date(session.windowEnd).getTime();
      return nowTs <= end;
    });
    return currentOrNext ?? sorted[sorted.length - 1] ?? null;
  }, [now, upcomingSessions]);
  const sessionDateForView = sessionForNow
    ? toDateInputValue(sessionForNow.sessionDate)
    : filters.scheduledDate;
  const { data: dayEvents = [] } = useEventsList(slug, {
    from: sessionDateForView,
    to: addDays(sessionDateForView, 1),
  });
  const { data: rangeEvents = [] } = useEventsList(slug, {
    from: sessionRange.from,
    to: addDays(sessionRange.to, 1),
  });
  const { data: formEvents = [] } = useEventsList(slug, {
    from: sessionForm.sessionDate,
    to: addDays(sessionForm.sessionDate, 7),
  });

  const activeAttendanceEntry = useMemo(
    () => myEntries?.find((entry) => !entry.clockOutAt && entry.status !== "absent"),
    [myEntries]
  );
  const latestEntry = myEntries?.[0] ?? null;
  const hasClockedIn = Boolean(activeAttendanceEntry);
  const recentlyClockedOut = !hasClockedIn && Boolean(latestEntry?.clockOutAt);

  const [manualSessionId, setManualSessionId] = useState<string | null>(null);
  const [clockInDepartment, setClockInDepartment] = useState<AttendanceDepartment>("production");

  const linkedEvent =
    sessionForNow?.event ??
    (sessionForNow?.eventId
      ? dayEvents?.find((event) => event.id === sessionForNow.eventId)
      : undefined);
  const selectedSession = manualSessionId
    ? upcomingSessions?.find(s => s.id === manualSessionId) ?? sessionForNow
    : sessionForNow;
  const targetSessionId = selectedSession?.id;
  const targetEventId = linkedEvent?.id ?? dayEvents?.[0]?.id ?? entries?.[0]?.eventId;
  const studentSessionTitle =
    selectedSession?.name ?? linkedEvent?.title ?? dayEvents?.[0]?.title ?? "Production Session";
  const sessionStart = sessionForNow ? new Date(sessionForNow.windowStart) : null;
  const [clockInNotes, setClockInNotes] = useState("");
  const [absenceDialogOpen, setAbsenceDialogOpen] = useState(false);
  const [absenceReason, setAbsenceReason] = useState("illness");
  const [absenceNotes, setAbsenceNotes] = useState("");
  const [clockInWarningOpen, setClockInWarningOpen] = useState(false);
  const [clockInConfirmOpen, setClockInConfirmOpen] = useState(false);

  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ProductionSession | null>(null);

  const summary = useMemo(
    () => ({
      total: entries?.length ?? 0,
      late: entries?.filter((entry) => entry.lateFlag).length ?? 0,
      auto: entries?.filter((entry) => entry.autoClockOut).length ?? 0,
      pending: entries?.filter((entry) => entry.status === "pending").length ?? 0,
    }),
    [entries]
  );

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const newDate = sessionDateForView;
    const newSessionId = sessionForNow?.id;
    setFilters((prev) => {
      if (prev.scheduledDate === newDate && prev.sessionId === newSessionId) return prev;
      return { ...prev, scheduledDate: newDate, sessionId: newSessionId };
    });
  }, [sessionDateForView, sessionForNow?.id]);

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

  const performClockIn = async () => {
    try {
      const response = await apiPost<{ event?: { id: string; title: string; startAt: string } }>(`/org/${slug}/attendance/logger/clock-in`, {
        eventId: targetEventId ?? undefined,
        sessionId: targetSessionId,
        department: clockInDepartment,
        notes: clockInNotes || undefined,
      });

      // Show which event was applied (if auto-detected or explicitly selected)
      const eventInfo = response.event ? ` for ${response.event.title}` : "";
      const wasAutoDetected = !targetEventId && response.event;

      toast({
        title: "Clocked in",
        description: wasAutoDetected
          ? `Your attendance has been recorded. Auto-detected and applied event: ${response.event?.title}`
          : `Your attendance has been recorded${eventInfo}.`
      });

      if (sessionStart && new Date() < sessionStart) {
        toast({
          title: "Heads up",
          description: `You clocked in before the session begins at ${format(sessionStart, "p")}.`,
        });
      }
      setClockInNotes("");
      refetch();
      refetchMine();
    } catch (error) {
      toast({
        title: "Failed to clock in",
        description: error instanceof Error ? error.message : "Try again later",
        variant: "destructive",
      });
    }
  };

  const handleClockIn = () => {
    if (sessionForNow && !isSameDay(new Date(sessionForNow.sessionDate), new Date())) {
      setClockInWarningOpen(true);
      return;
    }
    void performClockIn();
  };

  const handleClockInWarningContinue = () => {
    setClockInWarningOpen(false);
    setClockInConfirmOpen(true);
  };

  const handleClockInConfirm = () => {
    setClockInConfirmOpen(false);
    void performClockIn();
  };

  const handleClockOut = async () => {
    if (!activeAttendanceEntry) return;
    try {
      await apiPost(`/org/${slug}/attendance/logger/clock-out`, {
        attendanceId: activeAttendanceEntry.id,
      });
      toast({ title: "Clocked out", description: "Thanks for logging your time." });
      refetch();
      refetchMine();
    } catch (error) {
      toast({
        title: "Failed to clock out",
        description: error instanceof Error ? error.message : "Try again later",
        variant: "destructive",
      });
    }
  };

  const handleLogAbsence = async () => {
    try {
      await apiPost(`/org/${slug}/attendance/logger/absence`, {
        eventId: targetEventId ?? undefined,
        sessionId: targetSessionId,
        absenceReason,
        absenceNotes,
      });
      toast({ title: "Absence Recorded" });
      setAbsenceNotes("");
      setAbsenceDialogOpen(false);
      refetch();
      refetchMine();
    } catch (error) {
      toast({
        title: "Failed to log absence",
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

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Clock className="h-7 w-7 text-primary" />
            Attendance
          </h1>
          <p className="text-muted-foreground">
            Track production attendance for your organisation. Wednesday is the default, but tutors
            can schedule sessions any day.
          </p>
        </div>
        {canManage && (
          <Button asChild variant="outline">
            <Link href={`/org/${slug}/attendance/admin`}>Open Admin View</Link>
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Mobile Tab Navigation */}
          <div className="md:hidden">
            <MobileTabNavigation
              tabs={[
                { value: "student", label: "My Attendance", icon: <Clock className="h-4 w-4" /> },
                ...(canManage ? [{ value: "sessions", label: "Production Sessions", icon: <CalendarIcon className="h-4 w-4" /> }] : []),
              ]}
              activeTab={activeTab}
              onTabChange={(value) => setActiveTab(value as TabValue)}
              title="Attendance"
              description="Switch between tabs"
            />
          </div>

          {/* Desktop Tab List */}
          <TabsList className="hidden md:inline-flex">
            <TabsTrigger value="student">
              My Attendance
            </TabsTrigger>
            {canManage && (
              <TabsTrigger value="sessions">
                Production Sessions
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="student" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{studentSessionTitle}</CardTitle>
                <CardDescription>
                  {sessionForNow ? (
                    <>
                      Attendance window{" "}
                      {formatTimeRange(sessionForNow.windowStart, sessionForNow.windowEnd)} (server
                      time enforced)
                    </>
                  ) : (
                    "No production session is scheduled soon. You can still clock in and tutors will reconcile the entry."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasClockedIn ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You started at {formatDisplay(activeAttendanceEntry?.clockInAt)}.
                    </p>
                    <Button variant="secondary" className="w-full" onClick={handleClockOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Clock Out
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Make sure you only clock out once the session is over.
                    </p>
                  </div>
                ) : recentlyClockedOut && latestEntry ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You clocked in at {formatDisplay(latestEntry.clockInAt)} and clocked out at{" "}
                      {formatDisplay(latestEntry.clockOutAt)}.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full cursor-not-allowed opacity-70"
                      disabled
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Clocked out
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Need changes? Talk to a tutor and they can update your entry.
                    </p>
                    <div className="rounded-md border bg-muted/50 p-3">
                      <p className="text-sm font-medium flex items-center gap-2">
                        Status <StatusBadge status={latestEntry.status} />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        This is the review state of your latest attendance entry.
                      </p>
                    </div>
                    <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
                      <p className="text-sm font-semibold uppercase tracking-wide">
                        Remember to log your hours on Grofar for work placement.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select
                        value={clockInDepartment}
                        onValueChange={(value) =>
                          setClockInDepartment(value as AttendanceDepartment)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clock-in-notes">Notes (optional)</Label>
                      <Textarea
                        id="clock-in-notes"
                        placeholder="Camera position, extra context..."
                        value={clockInNotes}
                        onChange={(event) => setClockInNotes(event.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={handleClockIn}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Clock In
                      </Button>
                      <Button variant="outline" onClick={() => setAbsenceDialogOpen(true)}>
                        Log Absence
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  {format(new Date(filters.scheduledDate), "EEEE MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <SummaryTile label="Total" value={summary.total} />
                <SummaryTile label="Pending" value={summary.pending} />
                <SummaryTile label="Late" value={summary.late} />
                <SummaryTile label="Auto Clock-outs" value={summary.auto} />
              </CardContent>
            </Card>

            {latestEntry && (
              <Card className="lg:col-span-2 bg-muted/40">
                <CardHeader>
                  <CardTitle>Need help?</CardTitle>
                  <CardDescription>
                    If something looks wrong with your hours, talk to your tutor and they can update
                    the entry for you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>
                    Latest entry: {formatDisplay(latestEntry.clockInAt)} &mdash;{" "}
                    {formatDisplay(latestEntry.clockOutAt) || "still running"}
                  </p>
                  <p>Your tutor can adjust times or mark absences if needed.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>My Attendance History</CardTitle>
              <CardDescription>Recent personal entries.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myEntries?.length ? (
                      myEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.event?.title || "—"}</TableCell>
                          <TableCell>
                            {entry.scheduledDate
                              ? format(new Date(entry.scheduledDate), "PP")
                              : "—"}
                          </TableCell>
                          <TableCell>{formatDisplay(entry.clockInAt)}</TableCell>
                          <TableCell>{formatDisplay(entry.clockOutAt)}</TableCell>
                          <TableCell>
                            <StatusBadge status={entry.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          No personal attendance records yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {canManage && (
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Production Sessions</CardTitle>
                  <CardDescription>
                    A default Wednesday session is auto-provisioned. Add more sessions whenever you
                    need them.
                  </CardDescription>
                </div>
                <Button onClick={() => handleOpenSessionForm()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Session
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input
                    type="date"
                    value={sessionRange.from}
                    onChange={(event) =>
                      setSessionRange((prev) => ({ ...prev, from: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input
                    type="date"
                    value={sessionRange.to}
                    onChange={(event) =>
                      setSessionRange((prev) => ({ ...prev, to: event.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessions in range</CardTitle>
                <CardDescription>Link sessions to attendance reviews faster.</CardDescription>
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
                {sessionList.map((session) => {
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
                        <Button size="sm" variant="secondary" asChild>
                          <Link
                            href={`/org/${slug}/attendance/admin?sessionId=${session.id}&date=${session.sessionDate.split("T")[0]}`}
                          >
                            View Attendance
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenSessionForm(session)}
                        >
                          Edit
                        </Button>
                        {session.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelSession(session)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={clockInWarningOpen} onOpenChange={setClockInWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session date doesn&rsquo;t match today</DialogTitle>
            <DialogDescription>
              This production session is scheduled for{" "}
              {sessionForNow ? format(new Date(sessionForNow.sessionDate), "PPPP") : "another day"}.
              Clocking in now will be recorded against today. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClockInWarningOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClockInWarningContinue}>Continue anyway</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clockInConfirmOpen} onOpenChange={setClockInConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm clock in</DialogTitle>
            <DialogDescription>
              Are you absolutely sure you want to clock in for this session on the wrong date?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClockInConfirmOpen(false)}>
              Go back
            </Button>
            <Button variant="destructive" onClick={handleClockInConfirm}>
              Yes, clock me in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={absenceDialogOpen} onOpenChange={setAbsenceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Absence</DialogTitle>
            <DialogDescription>
              Provide a reason so tutors know why you couldn&rsquo;t attend.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={absenceReason} onValueChange={setAbsenceReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {ABSENCE_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={absenceNotes}
                onChange={(event) => setAbsenceNotes(event.target.value)}
                placeholder="Optional context"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAbsenceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogAbsence}>Submit</Button>
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
            <div className="grid gap-4 md:grid-cols-2">
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
              <p className="text-xs text-muted-foreground">
                Selecting an event ensures students clock into the correct production.
              </p>
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
