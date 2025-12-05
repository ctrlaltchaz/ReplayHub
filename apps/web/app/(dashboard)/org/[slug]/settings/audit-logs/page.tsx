"use client";

import { useUsers } from "@/app/(dashboard)/org/[slug]/settings/hooks/useUsers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditLogs } from "@/hooks/audit/useAuditLogs";
import { getApiUrl } from "@/lib/api/config";
import type { AuditLogEntry, AuditLogFilters } from "@/types/audit";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Download,
  Filter,
  Info,
  RefreshCcw,
  Search,
  UserCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const ACTION_OPTIONS = [
  "auth.login",
  "auth.logout",
  "auth.2fa.challenge",
  "user.invite.send",
  "user.role.change",
  "org.settings.update",
  "inventory.checkout",
  "inventory.return",
  "gamelog.entry.delete",
  "runsheet.task.update",
  "attendance.clock_in",
  "attendance.clock_out",
  "attendance.absence",
  "incident.create",
  "export.data",
];

const STATUS_OPTIONS = ["success", "error", "denied", "noop"];

const ENTITY_TYPE_OPTIONS = [
  "USER",
  "ORG_USER",
  "EVENT",
  "RUNSHEET",
  "TASK",
  "INVENTORY",
  "GAMELOG",
  "ATTENDANCE",
  "INCIDENT",
];

function formatDate(value: string) {
  const date = new Date(value);
  return `${date.toLocaleString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const normalized = status?.toLowerCase();
  if (normalized === "error" || normalized === "denied") return "destructive";
  if (normalized === "noop") return "outline";
  return "secondary";
}

function actorLabel(log: AuditLogEntry) {
  return log.orgUser?.displayName ?? log.user?.name ?? log.user?.email ?? "Unknown user";
}

function actorSubLabel(log: AuditLogEntry) {
  return log.orgUser?.email ?? log.user?.email ?? log.orgUser?.id ?? log.user?.id ?? "";
}

function entityLabel(log: AuditLogEntry) {
  if (log.entityType && log.entityId) return `${log.entityType} • ${log.entityId}`;
  if (log.entity && log.entityId) return `${log.entity} • ${log.entityId}`;
  return log.entityType || log.entity || "—";
}

export default function AuditLogsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [filters, setFilters] = useState<AuditLogFilters>({
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  const { data, isLoading, isFetching, error, refetch } = useAuditLogs(slug, filters, page, limit);
  const { data: users = [] } = useUsers(slug);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput || undefined }));
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const logs = data?.data ?? [];
  const meta = data?.meta;

  const totalLabel = useMemo(() => {
    if (!meta) return "";
    if (meta.total === 0) return "No entries yet";
    return `${meta.total} entries`;
  }, [meta]);

  const handleFilterChange = (next: Partial<AuditLogFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ sortBy: "createdAt", sortOrder: "desc" });
    setSearchInput("");
    setPage(1);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">
            Track all actions and changes across your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            aria-label="Refresh audit logs"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button asChild variant="secondary">
            <a href={getExportUrl(slug, filters)} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Narrow down by action, user, status, entity, or date range.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search action, description, or entity id"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <Select
              value={filters.action || "_all"}
              onValueChange={(value) =>
                handleFilterChange({ action: value === "_all" ? undefined : value })
              }
            >
              <SelectTrigger className="min-w-[200px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All actions</SelectItem>
                {ACTION_OPTIONS.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || "_all"}
              onValueChange={(value) =>
                handleFilterChange({ status: value === "_all" ? undefined : value })
              }
            >
              <SelectTrigger className="min-w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.orgUserId || "_all"}
              onValueChange={(value) =>
                handleFilterChange({ orgUserId: value === "_all" ? undefined : value })
              }
            >
              <SelectTrigger className="min-w-[220px]">
                <SelectValue placeholder="Actor (org user)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All actors</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.displayName} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <Select
              value={filters.entityType || "_all"}
              onValueChange={(value) =>
                handleFilterChange({ entityType: value === "_all" ? undefined : value })
              }
            >
              <SelectTrigger className="min-w-[200px]">
                <SelectValue placeholder="Entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All entity types</SelectItem>
                {ENTITY_TYPE_OPTIONS.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    {entity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              className="min-w-[180px]"
              placeholder="Entity name"
              value={filters.entity || ""}
              onChange={(e) => handleFilterChange({ entity: e.target.value || undefined })}
            />

            <Input
              className="min-w-[180px]"
              placeholder="Entity id"
              value={filters.entityId || ""}
              onChange={(e) => handleFilterChange({ entityId: e.target.value || undefined })}
            />

            <div className="flex items-center gap-2">
              <div className="space-y-1">
                <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                  From
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
                  className="min-w-[160px]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                  To
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
                  className="min-w-[160px]"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="ghost" onClick={handleClearFilters}>
                Clear filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Audit entries</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sorted by newest first. Click a row for full details.
            </p>
          </div>
          {isFetching && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4" />
              Refreshing…
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Failed to load audit logs</p>
                <p className="text-muted-foreground">{(error as Error).message}</p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No audit entries match your filters.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[80px] text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/40">
                      <TableCell className="align-top">
                        <div className="text-sm font-medium">{formatDate(log.createdAt)}</div>
                        {log.ipAddress && (
                          <div className="text-xs text-muted-foreground mt-1">{log.ipAddress}</div>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-medium">{log.action}</div>
                        {log.method && log.endpoint && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {log.method} {log.endpoint}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium leading-tight">{actorLabel(log)}</div>
                            <div className="text-xs text-muted-foreground leading-tight">
                              {actorSubLabel(log) || "—"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-medium">{entityLabel(log)}</div>
                        {log.entity && (
                          <div className="text-xs text-muted-foreground leading-tight">
                            {log.entity}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge variant={getStatusVariant(log.status)} className="capitalize">
                          {log.status}
                        </Badge>
                        {log.errorMessage && (
                          <div className="text-xs text-destructive mt-1 line-clamp-2">
                            {log.errorMessage}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="text-sm line-clamp-2">{log.description || "—"}</div>
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelectedLog(log)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm">
                  <div className="text-muted-foreground">
                    Page {meta.page} of {meta.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page >= meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AuditLogDialog log={selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)} />
    </div>
  );
}

function getExportUrl(slug: string, filters: AuditLogFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.append(key, String(value));
  });
  if (!params.has("limit")) {
    params.append("limit", "1000");
  }
  const qs = params.toString();
  return getApiUrl(`/org/${slug}/audit-logs/export${qs ? `?${qs}` : ""}`);
}

function AuditLogDialog({
  log,
  onOpenChange,
}: {
  log: AuditLogEntry | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(log)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Audit log</div>
              <div className="text-lg font-semibold">{log?.action ?? ""}</div>
            </div>
            {log?.status && (
              <Badge variant={getStatusVariant(log.status)} className="capitalize">
                {log.status}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {!log ? null : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Time" value={formatDate(log.createdAt)} />
              <InfoRow label="Actor" value={`${actorLabel(log)} (${actorSubLabel(log) || "—"})`} />
              <InfoRow label="Entity" value={entityLabel(log)} />
              <InfoRow
                label="Endpoint"
                value={log.method && log.endpoint ? `${log.method} ${log.endpoint}` : "—"}
              />
              <InfoRow label="IP Address" value={log.ipAddress || "—"} />
              <InfoRow label="User Agent" value={log.userAgent || "—"} />
              <InfoRow label="Description" value={log.description || "—"} />
              <InfoRow label="Error" value={log.errorMessage || "—"} />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Metadata</div>
              <div className="h-64 rounded-md border bg-muted/50 px-3 py-2 text-xs overflow-auto">
                {log.metadata ? (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                ) : (
                  <div className="text-muted-foreground">No metadata captured</div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm break-words">{value}</div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="grid grid-cols-7 gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
