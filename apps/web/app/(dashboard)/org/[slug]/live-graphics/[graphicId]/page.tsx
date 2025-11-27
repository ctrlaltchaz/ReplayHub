"use client";

import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  BadgeCheck,
  Link2,
  ListChecks,
  Loader2,
  MonitorPlay,
  Rocket,
  UploadCloud,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PermissionGuard } from "@/components/permissions/PermissionGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { getServerUrl } from "@/lib/api/config";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { PERMISSIONS } from "@/lib/permissions/utils";
import type { UpdateLiveGraphicState } from "@/types/live-graphics";
import {
  useDeleteLiveGraphic,
  useLiveGraphic,
  useUpdateLiveGraphic,
  useUpdateLiveGraphicState,
  useUploadLiveGraphic,
} from "../hooks/useLiveGraphics";

export default function LiveGraphicDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const graphicId = params?.graphicId as string;
  const router = useRouter();
  const { toast } = useToast();

  const { data: graphic, isLoading } = useLiveGraphic(slug, graphicId);
  usePageTitle(graphic ? `${graphic.name} · Live Graphics` : "Live Graphics");

  const uploadMutation = useUploadLiveGraphic(slug, graphicId);
  const updateStateMutation = useUpdateLiveGraphicState(slug, graphicId);
  const updateMetaMutation = useUpdateLiveGraphic(slug, graphicId);
  const deleteMutation = useDeleteLiveGraphic(slug);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [stateForm, setStateForm] = useState<UpdateLiveGraphicState>({
    title: "",
    subtitle: "",
    leftName: "",
    rightName: "",
    leftScore: 0,
    rightScore: 0,
    statusText: "",
    message: "",
    extra: {},
  });
  const [extraJson, setExtraJson] = useState("{}");
  const [metaForm, setMetaForm] = useState({ name: "", description: "" });

  useEffect(() => {
    if (!graphic) return;
    const baseState = (graphic.state as Record<string, any>) || {};
    setStateForm({
      title: baseState.title ?? "",
      subtitle: baseState.subtitle ?? "",
      leftName: baseState.leftName ?? "",
      rightName: baseState.rightName ?? "",
      leftScore: baseState.leftScore ?? 0,
      rightScore: baseState.rightScore ?? 0,
      statusText: baseState.statusText ?? "",
      message: baseState.message ?? "",
      extra: baseState.extra ?? {},
    });
    setExtraJson(JSON.stringify(baseState.extra ?? {}, null, 2));
    setMetaForm({ name: graphic.name ?? "", description: graphic.description ?? "" });
  }, [graphic]);

  const publicUrl = useMemo(() => {
    if (!graphic?.publicUrl) return "";
    return `${getServerUrl()}${graphic.publicUrl}`;
  }, [graphic]);

  const stateUrl = useMemo(() => {
    if (!graphic?.stateUrl) return "";
    return `${getServerUrl()}${graphic.stateUrl}`;
  }, [graphic]);

  const clientSnippet = useMemo(() => {
    if (!graphic?.clientSnippet) return "";
    return graphic.clientSnippet.replace("/api", `${getServerUrl()}/api`);
  }, [graphic]);

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!uploadFile) {
      toast({
        title: "Upload missing",
        description: "Select an HTML file first.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      await uploadMutation.mutateAsync(formData);
      toast({ title: "HTML verified", description: "Overlay is now ready to use." });
      setUploadFile(null);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to verify overlay",
        variant: "destructive",
      });
    }
  };

  const handleStateUpdate = async () => {
    let parsedExtra: Record<string, any> | undefined = undefined;
    if (extraJson.trim()) {
      try {
        parsedExtra = JSON.parse(extraJson);
      } catch (error) {
        toast({
          title: "Invalid extra data",
          description: "Extra JSON must be valid.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      await updateStateMutation.mutateAsync({
        ...stateForm,
        leftScore: Number(stateForm.leftScore) || 0,
        rightScore: Number(stateForm.rightScore) || 0,
        extra: parsedExtra,
      });
      toast({ title: "State pushed", description: "Overlays will refresh within a second." });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to push state",
        variant: "destructive",
      });
    }
  };

  const handleMetaSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await updateMetaMutation.mutateAsync({
        name: metaForm.name,
        description: metaForm.description,
      });
      toast({ title: "Details updated" });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to update details",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!graphic) return;
    const confirmed = window.confirm(`Delete ${graphic.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(graphic.id);
      toast({ title: "Deleted", description: `${graphic.name} was removed.` });
      router.push(`/org/${slug}/live-graphics`);
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unable to delete overlay",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="h-6 w-40 rounded bg-muted animate-pulse" />
        <div className="h-10 rounded bg-muted animate-pulse" />
        <div className="grid gap-4 lg:grid-cols-2">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-64 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!graphic) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10 space-y-4">
        <Button asChild variant="ghost">
          <Link href={`/org/${slug}/live-graphics`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to overlays
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Overlay not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/org/${slug}/live-graphics`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to overlays
            </Link>
          </Button>
          <Badge variant="secondary" className="text-xs">
            {graphic.status === "active" ? "Ready" : "Draft"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Last updated {formatDistanceToNow(new Date(graphic.updatedAt))} ago
          </span>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Wand2 className="h-8 w-8 text-primary" />
            {graphic.name}
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Manage uploads, push live data, and copy embed snippets for this overlay.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-primary" />
                Overlay details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-3 text-xs">
                <p>Public code: {graphic.publicCode}</p>
                <p>Control code: {graphic.controlCode}</p>
              </div>
              <PermissionGuard required={PERMISSIONS.LIVE_GRAPHICS_MANAGE}>
                <form className="space-y-3" onSubmit={handleMetaSave}>
                  <div className="space-y-2">
                    <Label htmlFor="meta-name">Name</Label>
                    <Input
                      id="meta-name"
                      value={metaForm.name}
                      onChange={(e) => setMetaForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta-description">Description</Label>
                    <Textarea
                      id="meta-description"
                      value={metaForm.description}
                      onChange={(e) =>
                        setMetaForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      rows={4}
                    />
                  </div>
                  <Button type="submit" disabled={updateMetaMutation.isPending}>
                    {updateMetaMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save details
                  </Button>
                </form>
              </PermissionGuard>
              {!graphic.description && (
                <p className="text-sm text-muted-foreground">
                  Add a description so production knows when to cue this overlay.
                </p>
              )}
            </CardContent>
          </Card>

          <PermissionGuard required={PERMISSIONS.LIVE_GRAPHICS_MANAGE}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-primary" />
                  Upload & verify HTML
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Ensure the generated script with control code {graphic.controlCode.slice(0, 8)} is
                  present in your file.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleUpload}>
                  <div className="space-y-2">
                    <Label htmlFor="overlay-file">HTML file</Label>
                    <Input
                      id="overlay-file"
                      type="file"
                      accept=".html,text/html"
                      onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      File must include the ReplayHub client snippet so we can verify the control
                      code.
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={uploadMutation.isPending}>
                    {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & activate
                  </Button>
                </form>
              </CardContent>
            </Card>
          </PermissionGuard>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                Setup checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ol className="list-decimal space-y-2 pl-4 text-muted-foreground">
                <li>Copy the control script snippet below.</li>
                <li>
                  Paste it before <code className="rounded bg-muted px-1 py-0.5">{"</body>"}</code>{" "}
                  in your HTML.
                </li>
                <li>
                  Tag dynamic elements with{" "}
                  <code className="rounded bg-muted px-1 py-0.5">data-replayhub-field</code>.
                </li>
                <li>Upload & verify the HTML file.</li>
                <li>Add the public link to OBS/TriCaster as a browser source.</li>
              </ol>
              <Separator />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MonitorPlay className="h-4 w-4" />
                Refresh your browser source after pushing a new file or state change.
              </div>
            </CardContent>
          </Card>

          <PermissionGuard required={PERMISSIONS.LIVE_GRAPHICS_MANAGE}>
            <Card className="border-destructive/40">
              <CardHeader>
                <CardTitle>Danger zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Deleting this overlay removes the stored HTML and control codes. This cannot be
                  undone.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete overlay
                </Button>
              </CardContent>
            </Card>
          </PermissionGuard>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Control panel
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update any{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">data-replayhub-field</code>
                  value live.
                </p>
              </div>
              <Badge variant="outline">Control code {graphic.controlCode.slice(0, 8)}</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Title"
                  value={stateForm.title}
                  onChange={(value) => setStateForm((prev) => ({ ...prev, title: value }))}
                  placeholder="Match intro"
                />
                <TextField
                  label="Subtitle"
                  value={stateForm.subtitle}
                  onChange={(value) => setStateForm((prev) => ({ ...prev, subtitle: value }))}
                  placeholder="Presented by ReplayHub"
                />
                <TextField
                  label="Left label"
                  value={stateForm.leftName}
                  onChange={(value) => setStateForm((prev) => ({ ...prev, leftName: value }))}
                  placeholder="Team A"
                />
                <TextField
                  label="Right label"
                  value={stateForm.rightName}
                  onChange={(value) => setStateForm((prev) => ({ ...prev, rightName: value }))}
                  placeholder="Team B"
                />
                <NumberField
                  label="Left score"
                  value={stateForm.leftScore}
                  onChange={(value) => setStateForm((prev) => ({ ...prev, leftScore: value }))}
                />
                <NumberField
                  label="Right score"
                  value={stateForm.rightScore}
                  onChange={(value) => setStateForm((prev) => ({ ...prev, rightScore: value }))}
                />
                <TextField
                  label="Status text"
                  value={stateForm.statusText}
                  onChange={(value) => setStateForm((prev) => ({ ...prev, statusText: value }))}
                  placeholder="Live • Best of 5"
                />
                <TextField
                  label="Message"
                  value={stateForm.message}
                  onChange={(value) => setStateForm((prev) => ({ ...prev, message: value }))}
                  placeholder="Next map: Ascent"
                />
              </div>
              <div className="space-y-2">
                <Label>Extra JSON (optional)</Label>
                <Textarea
                  className="font-mono text-xs"
                  rows={6}
                  value={extraJson}
                  onChange={(e) => setExtraJson(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Any keys here can also be targeted via <code>data-replayhub-field</code>.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(graphic.updatedAt))} ago
                </div>
                <PermissionGuard required={PERMISSIONS.LIVE_GRAPHICS_MANAGE}>
                  <Button
                    type="button"
                    onClick={handleStateUpdate}
                    disabled={updateStateMutation.isPending}
                  >
                    {updateStateMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Push live update
                  </Button>
                </PermissionGuard>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Embed & wiring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <CopyField
                  label="Public display link"
                  value={publicUrl}
                  helper="Use this in OBS, TriCaster, or any browser source."
                />
                <CopyField
                  label="State endpoint"
                  value={stateUrl}
                  helper="ReplayHub client polls this JSON every second."
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>HTML hook</Label>
                <div className="rounded-lg bg-muted px-4 py-3 text-sm font-mono">
                  &lt;span data-replayhub-field="leftScore"&gt;0&lt;/span&gt;
                </div>
                <p className="text-xs text-muted-foreground">
                  Add <code>data-replayhub-field</code> attributes where values should appear
                  (title, score, extra keys, etc.).
                </p>
              </div>
              <CopyField
                label="Client script"
                value={clientSnippet}
                helper="Place before </body> so the overlay polls its live state."
              />
              <CopyField
                label="Iframe snippet"
                value={
                  publicUrl
                    ? `<iframe src="${publicUrl}" width="1920" height="1080" frameborder="0"></iframe>`
                    : ""
                }
                helper="Drop this into dashboards or OBS browser sources."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CopyField({ label, value, helper }: { label: string; value: string; helper?: string }) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input value={value} readOnly className="font-mono text-xs" />
        <Button type="button" variant="outline" onClick={handleCopy}>
          Copy
        </Button>
      </div>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="number" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
