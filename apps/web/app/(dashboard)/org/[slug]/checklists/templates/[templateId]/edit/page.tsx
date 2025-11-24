"use client";

import { useOrgUsers } from "@/app/(dashboard)/org/[slug]/runsheets/hooks/useOrgUsers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { ChecklistScope, ChecklistTemplateItem } from "@/types/checklist";
import { Loader2, ArrowLeft, ArrowUp, ArrowDown, Plus, Minus, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useChecklistTemplate } from "../../../hooks/useChecklistTemplate";
import { useUpdateChecklistTemplate } from "../../../hooks/useUpdateChecklistTemplate";
import { useChecklists } from "../../../hooks/useChecklists";

const DEFAULT_ITEM: ChecklistTemplateItem = {
  text: "",
  category: "General",
  assignedTo: "",
  priority: "medium",
  estimatedMinutes: 30,
  required: true,
  evidence: false,
};

interface BuilderStep {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const builderSteps: BuilderStep[] = [
  {
    id: "details",
    label: "Template Details",
    description: "Name the template and set its scope.",
    icon: Sparkles,
  },
  {
    id: "items",
    label: "Tasks",
    description: "Manage the list of checklist tasks.",
    icon: Sparkles,
  },
  {
    id: "review",
    label: "Review",
    description: "Save your changes.",
    icon: Sparkles,
  },
];

const allowedScopes: ChecklistScope[] = ["event", "room", "kit", "general"];

// Normalize scopes from legacy templates so we never send invalid values to the API
const normalizeScope = (value: unknown): ChecklistScope => {
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (allowedScopes.includes(lower as ChecklistScope)) {
      return lower as ChecklistScope;
    }
  }
  return "general";
};

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const templateId = params?.templateId as string;
  const { toast } = useToast();

  const { data: template, isLoading, error } = useChecklistTemplate(slug, templateId);
  const { data: orgUsers } = useOrgUsers(slug);
  const updateTemplate = useUpdateChecklistTemplate(slug);
  const { data: templateChecklists, isLoading: templateChecklistsLoading } = useChecklists(slug, {
    templateId,
  });

  const [title, setTitle] = useState("");
  const [scope, setScope] = useState<ChecklistScope>("general");
  const [items, setItems] = useState<ChecklistTemplateItem[]>([{ ...DEFAULT_ITEM }]);
  const [activeStep, setActiveStep] = useState(builderSteps[0].id);

  useEffect(() => {
    if (!template) return;
    setTitle(template.title);
    setScope(normalizeScope(template.scope));
    const templateItems =
      Array.isArray(template.itemsJson) && template.itemsJson.length > 0
        ? template.itemsJson
        : [{ ...DEFAULT_ITEM }];
    setItems(templateItems);
  }, [template]);

  useEffect(() => {
    const sections = builderSteps
      .map((step) => document.getElementById(step.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const viewable = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop
          )[0];
        if (viewable) setActiveStep(viewable.target.id);
      },
      { threshold: 0.2, rootMargin: "-20% 0px -60% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [template]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { ...DEFAULT_ITEM }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    setItems((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleItemChange = (index: number, field: keyof ChecklistTemplateItem, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;
    if (!title.trim()) {
      toast({
        title: "Template needs a title",
        description: "Give your template a name.",
        variant: "destructive",
      });
      return;
    }
    const validItems = items.filter((item) => item.text.trim());
    if (!validItems.length) {
      toast({
        title: "Add tasks",
        description: "Templates need at least one task.",
        variant: "destructive",
      });
      return;
    }
    try {
      await updateTemplate.mutateAsync({
        templateId: template.id,
        data: {
          title: title.trim(),
          scope: normalizeScope(scope),
          itemsJson: validItems,
        },
      });
      toast({ title: "Template updated", description: "Changes saved for everyone." });
      router.push(`/org/${slug}/checklists?tab=templates`);
    } catch (err) {
      toast({
        title: "Unable to update template",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const summaryRows = useMemo(
    () => [
      { label: "Title", value: title || "Untitled template" },
      { label: "Scope", value: scope.charAt(0).toUpperCase() + scope.slice(1) },
      { label: "Items", value: `${items.length} ${items.length === 1 ? "item" : "items"}` },
    ],
    [title, scope, items.length]
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">Template not found</p>
          <Button onClick={() => router.push(`/org/${slug}/checklists?tab=templates`)}>
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8 space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/org/${slug}/checklists?tab=templates`)}
          className="inline-flex items-center gap-2 px-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Template</h1>
          <p className="text-muted-foreground mt-2 text-base">
            Update the tasks and details once, and everyone will see the changes.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form onSubmit={handleSubmit} className="space-y-6 order-1">
          <Card id="details">
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>Adjust the title and scope.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event Prep Checklist"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scope">Scope *</Label>
                <Select value={scope} onValueChange={(val) => setScope(val as ChecklistScope)}>
                  <SelectTrigger id="scope">
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="room">Room</SelectItem>
                    <SelectItem value="kit">Kit</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card id="items">
            <CardHeader>
              <CardTitle>Checklist Tasks</CardTitle>
              <CardDescription>
                Reorder tasks, adjust ownership, and clarify expectations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <div className="sticky top-4 z-20 flex justify-end">
                <div className="flex items-center gap-2 rounded-full border bg-background/95 px-3 py-2 shadow-sm">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Tasks
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => handleRemoveItem(items.length - 1)}
                    disabled={items.length <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" onClick={handleAddItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {items.map((item, index) => (
                <div
                  key={`item-${index}`}
                  className="rounded-xl border bg-card p-4 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">
                        Item {index + 1}
                      </p>
                      {item.category && (
                        <p className="text-xs text-muted-foreground/70">{item.category}</p>
                      )}
                    </div>
                    {items.length > 1 && (
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMoveItem(index, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMoveItem(index, "down")}
                          disabled={index === items.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Task</Label>
                    <Input
                      value={item.text}
                      onChange={(e) => handleItemChange(index, "text", e.target.value)}
                      placeholder="Describe the task"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm">Category</Label>
                      <Input
                        value={item.category || ""}
                        onChange={(e) => handleItemChange(index, "category", e.target.value)}
                        placeholder="e.g., Pre-Match"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Assigned To</Label>
                      <Select
                        value={item.assignedTo || "unassigned"}
                        onValueChange={(value) =>
                          handleItemChange(index, "assignedTo", value === "unassigned" ? "" : value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Anyone</SelectItem>
                          {orgUsers?.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm">Priority</Label>
                      <Select
                        value={item.priority || "medium"}
                        onValueChange={(value) => handleItemChange(index, "priority", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Est. Time (minutes)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.estimatedMinutes ?? ""}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "estimatedMinutes",
                            Number.parseInt(e.target.value, 10) || 0
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={item.required}
                        onCheckedChange={(checked) =>
                          handleItemChange(index, "required", Boolean(checked))
                        }
                      />
                      Required
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={item.evidence}
                        onCheckedChange={(checked) =>
                          handleItemChange(index, "evidence", Boolean(checked))
                        }
                      />
                      Requires Evidence
                    </label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card id="review">
            <CardHeader>
              <CardTitle>Review & Save</CardTitle>
              <CardDescription>Publish your changes across the organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                {summaryRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between text-sm text-muted-foreground"
                  >
                    <span>{row.label}</span>
                    <span className="font-medium text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/org/${slug}/checklists?tab=templates`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTemplate.isPending}>
                  {updateTemplate.isPending ? "Saving..." : "Save Template"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <aside className="space-y-4 order-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Builder Progress</CardTitle>
              <CardDescription>Jump directly to any section.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {builderSteps.map((step, idx) => {
                  const isActive = activeStep === step.id;
                  const Icon = step.icon;
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        className={cn(
                          "w-full rounded-lg border px-3 py-2 text-left transition",
                          isActive && "border-primary bg-primary/5"
                        )}
                        onClick={() =>
                          document
                            .getElementById(step.id)
                            ?.scrollIntoView({ behavior: "smooth", block: "start" })
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-full border flex items-center justify-center text-sm font-semibold",
                              isActive ? "border-primary text-primary" : "text-muted-foreground"
                            )}
                          >
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <p className="font-medium">{step.label}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Checklists Using This Template</CardTitle>
              <CardDescription>Jump into a checklist to make one-off edits.</CardDescription>
            </CardHeader>
            <CardContent>
              {templateChecklistsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : templateChecklists && templateChecklists.length > 0 ? (
                <div className="space-y-3">
                  {templateChecklists.map((cl) => (
                    <div key={cl.id} className="rounded-lg border p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{cl.title || template.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {cl.status === "done"
                              ? "Completed"
                              : cl.status === "in_progress"
                                ? "In progress"
                                : "Pending"}
                            {cl.dueAt ? ` · Due ${new Date(cl.dueAt).toLocaleDateString()}` : ""}
                          </p>
                        </div>
                        <Badge
                          variant={cl.status === "done" ? "outline" : "secondary"}
                          className="capitalize"
                        >
                          {cl.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link href={`/org/${slug}/checklists/${cl.id}`}>View</Link>
                        </Button>
                        <Button variant="secondary" size="sm" asChild className="flex-1">
                          <Link href={`/org/${slug}/checklists/${cl.id}/edit`}>Edit Checklist</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No checklists currently use this template.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
