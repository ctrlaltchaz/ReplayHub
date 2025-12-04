"use client";

import { Calendar, Loader2, Trash2, UserPlus, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useCrewTemplates } from "../../hooks/crew-templates";
import type { CreateEventData, Event, EventStaffRoleType, EventType } from "../../hooks/events";
import { useTeams } from "../../hooks/rosters/useTeams";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

interface EventEditDialogProps {
  slug: string;
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEventData) => Promise<void>;
  productionLeads?: Array<{ id: string; name: string }>;
}

const EVENT_TYPES: EventType[] = ["Broadcast", "Tournament", "Showmatch", "Rehearsal", "Other"];
const COMMON_GAMES = [
  "Valorant",
  "Overwatch 2",
  "Rocket League",
  "League of Legends",
  "Counter-Strike 2",
  "Apex Legends",
  "Fortnite",
];

export function EventEditDialog({
  slug,
  event,
  open,
  onOpenChange,
  onSubmit,
  productionLeads = [],
}: EventEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [appliedTemplateName, setAppliedTemplateName] = useState<string>("");

  // Fetch teams for the tournament dropdown
  const { data: teams = [], isLoading: teamsLoading } = useTeams(slug, { status: "active" });

  // Fetch crew templates
  const { data: crewTemplates = [] } = useCrewTemplates(slug);

  // Extract unique group names from crew templates to use as role options
  const availableRoles = React.useMemo(() => {
    const groupNames = new Set<string>();
    crewTemplates.forEach((template) => {
      template.groups?.forEach((group) => {
        groupNames.add(group.name);
      });
    });
    return Array.from(groupNames).sort().map((name) => ({
      value: name.toLowerCase().replace(/\s+/g, "_"),
      label: name,
    }));
  }, [crewTemplates]);

  const [formData, setFormData] = useState<CreateEventData>({
    title: "",
    startAt: "",
    endAt: "",
    location: "",
    notes: "",
    status: "scheduled",
    eventType: "Other",
    gameTitle: "",
    productionLead: undefined,
    broadcastChannel: "",
    callTime: undefined,
    duration: undefined,
    graphicsPackage: "",
    checklistId: undefined,
    rosterId: undefined,
    teamId: undefined,
    // Tournament fields
    opponent: "",
    tournamentName: "",
    tournamentStage: "",
    bestOf: 1,
    staffAssignments: [],
  });

  // Separate date/time state for easier input handling
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [callDate, setCallDate] = useState("");
  const [callTime, setCallTime] = useState("");

  // Broadcast channels state
  const [broadcastChannels, setBroadcastChannels] = useState({
    twitch: false,
    youtube: false,
    tiktok: false,
    facebook: false,
  });

  // Auto-sync broadcast channels to formData
  useEffect(() => {
    const selected = Object.entries(broadcastChannels)
      .filter(([_, checked]) => checked)
      .map(([channel, _]) => channel.charAt(0).toUpperCase() + channel.slice(1));
    setFormData((prev) => ({ ...prev, broadcastChannel: selected.join(", ") }));
  }, [broadcastChannels]);

  // Populate form when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
        location: event.location || "",
        notes: event.notes || "",
        status: event.status,
        eventType: event.eventType || "Other",
        gameTitle: event.gameTitle || "",
        productionLead: event.productionLead || undefined,
        broadcastChannel: event.broadcastChannel || "",
        callTime: event.callTime || undefined,
        duration: event.duration || undefined,
        graphicsPackage: event.graphicsPackage || "",
        checklistId: event.checklistId || undefined,
        rosterId: event.rosterId || undefined,
        teamId: event.teamId || undefined,
        // Tournament fields
        opponent: event.opponent || "",
        tournamentName: event.tournamentName || "",
        tournamentStage: event.tournamentStage || "",
        bestOf: event.bestOf || 1,
        staffAssignments: (event.staffAssignments || []).map((assignment) => ({
          orgUserId: assignment.orgUserId,
          roleType: assignment.roleType,
          roleLabel: assignment.roleLabel || "",
        })),
      });

      // Parse broadcast channels from string
      const channels = (event.broadcastChannel || "").toLowerCase();
      setBroadcastChannels({
        twitch: channels.includes("twitch"),
        youtube: channels.includes("youtube"),
        tiktok: channels.includes("tiktok"),
        facebook: channels.includes("facebook"),
      });

      // Split ISO datetime strings into date and time
      const startDt = new Date(event.startAt);
      setStartDate(startDt.toISOString().split("T")[0]);
      setStartTime(startDt.toISOString().split("T")[1].slice(0, 5));

      const endDt = new Date(event.endAt);
      setEndDate(endDt.toISOString().split("T")[0]);
      setEndTime(endDt.toISOString().split("T")[1].slice(0, 5));

      if (event.callTime) {
        const callDt = new Date(event.callTime);
        setCallDate(callDt.toISOString().split("T")[0]);
        setCallTime(callDt.toISOString().split("T")[1].slice(0, 5));
      } else {
        setCallDate("");
        setCallTime("");
      }
    }
  }, [event]);

  // Combine date and time into ISO string
  const combineDateTime = (date: string, time: string): string | undefined => {
    if (!date || !time) return undefined;
    return `${date}T${time}:00.000Z`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setIsSubmitting(true);

    try {
      // Build submit data, only including fields that have values
      const submitData: any = {
        title: formData.title,
        eventType: formData.eventType,
        startAt: combineDateTime(startDate, startTime)!,
        endAt: combineDateTime(endDate, endTime)!,
        status: formData.status,
      };

      // Add optional string fields
      if (formData.gameTitle) submitData.gameTitle = formData.gameTitle;
      // Always include broadcastChannel to allow clearing it
      submitData.broadcastChannel = formData.broadcastChannel || "";
      if (formData.location) submitData.location = formData.location;
      if (formData.graphicsPackage) submitData.graphicsPackage = formData.graphicsPackage;
      if (formData.notes) submitData.notes = formData.notes;

      // Add optional datetime
      if (callDate && callTime) {
        submitData.callTime = combineDateTime(callDate, callTime);
      }

      // Add optional number
      if (formData.duration) submitData.duration = formData.duration;

      // Add optional UUID fields - only if they have valid non-empty values
      if (
        formData.productionLead &&
        formData.productionLead !== "" &&
        formData.productionLead !== "_none"
      ) {
        submitData.productionLead = formData.productionLead;
      }
      if (formData.teamId && formData.teamId !== "") {
        submitData.teamId = formData.teamId;
      }
      if (formData.lineupId && formData.lineupId !== "") {
        submitData.lineupId = formData.lineupId;
      }
      if (formData.checklistId && formData.checklistId !== "") {
        submitData.checklistId = formData.checklistId;
      }
      if (formData.rosterId && formData.rosterId !== "") {
        submitData.rosterId = formData.rosterId;
      }

      if (formData.staffAssignments) {
        const staff = (formData.staffAssignments || [])
          .filter((s) => s.orgUserId && s.roleType)
          .map((s) => ({
            orgUserId: s.orgUserId,
            roleType: s.roleType,
            roleLabel: s.roleLabel?.trim() || undefined,
          }))
          .filter(
            (assignment, index, arr) =>
              arr.findIndex((other) => other.orgUserId === assignment.orgUserId) === index
          );
        submitData.staffAssignments = staff;
      }

      // Add tournament fields if event type is Tournament, Showmatch, or Broadcast
      if (
        formData.eventType === "Tournament" ||
        formData.eventType === "Showmatch" ||
        formData.eventType === "Broadcast"
      ) {
        if (formData.opponent) submitData.opponent = formData.opponent;
        if (formData.tournamentName) submitData.tournamentName = formData.tournamentName;
        if (formData.tournamentStage) submitData.tournamentStage = formData.tournamentStage;
        if (formData.bestOf) submitData.bestOf = formData.bestOf;
      }

      await onSubmit(submitData);

      onOpenChange(false);
    } catch (error) {
      // Error handling done by parent
      console.error("Failed to update event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateEventData, value: string | number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addStaffAssignment = () => {
    const defaultRole = availableRoles[0]?.value || "";
    setFormData((prev) => ({
      ...prev,
      staffAssignments: [
        ...(prev.staffAssignments || []),
        { orgUserId: "", roleType: defaultRole as EventStaffRoleType, roleLabel: "" },
      ],
    }));
  };

  const updateStaffAssignment = (
    index: number,
    field: "orgUserId" | "roleType" | "roleLabel",
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...(prev.staffAssignments || [])];
      if (!updated[index]) return prev;
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, staffAssignments: updated };
    });
  };

  const removeStaffAssignment = (index: number) => {
    setFormData((prev) => {
      const updated = [...(prev.staffAssignments || [])];
      updated.splice(index, 1);
      return { ...prev, staffAssignments: updated };
    });
  };

  const [bulkRoleType, setBulkRoleType] = useState<EventStaffRoleType>("broadcaster");

  const assignRemainingToRole = () => {
    setFormData((prev) => {
      const existing = prev.staffAssignments || [];
      const existingIds = new Set(existing.map((s) => s.orgUserId).filter(Boolean));
      const newAssignments = productionLeads
        .filter((user) => !existingIds.has(user.id))
        .map((user) => ({
          orgUserId: user.id,
          roleType: bulkRoleType,
          roleLabel: "",
        }));

      if (!newAssignments.length) return prev;
      return { ...prev, staffAssignments: [...existing, ...newAssignments] };
    });
  };

  const applyCrewTemplate = () => {
    if (!selectedTemplateId) return;

    const template = crewTemplates.find((t) => t.id === selectedTemplateId);
    if (!template) return;

    setFormData((prev) => {
      const newAssignments = template.groups.flatMap((group) =>
        group.members.map((member) => ({
          orgUserId: member.orgUserId,
          roleType: group.name.toLowerCase().replace(/\s+/g, "_") as EventStaffRoleType,
          roleLabel: "",
        }))
      );

      return { ...prev, staffAssignments: newAssignments };
    });

    setAppliedTemplateName(template.name);
  };

  const assignedIds = new Set(
    (formData.staffAssignments || []).map((s) => s.orgUserId).filter(Boolean)
  );
  const remainingUsers = productionLeads.filter((user) => !assignedIds.has(user.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edit Event
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="linked">Linked Data</TabsTrigger>
              <TabsTrigger value="talent">Talent &amp; Crew</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter event title"
                  maxLength={200}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(value) => handleInputChange("eventType", value as EventType)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="eventType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Enter event location (optional)"
                  maxLength={200}
                  disabled={isSubmitting}
                />
              </div>

              {/* Tournament-specific fields */}
              {(formData.eventType === "Tournament" ||
                formData.eventType === "Showmatch" ||
                formData.eventType === "Broadcast") && (
                  <div className="border border-blue-200 rounded-lg p-4 space-y-4 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
                    <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                      Tournament Details
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="teamId">
                          Your Team <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.teamId || "_none"}
                          onValueChange={(value) =>
                            handleInputChange("teamId", value === "_none" ? undefined : value)
                          }
                          disabled={isSubmitting || teamsLoading}
                        >
                          <SelectTrigger id="teamId">
                            <SelectValue
                              placeholder={teamsLoading ? "Loading teams..." : "Select your team"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none">None</SelectItem>
                            {teams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name} ({team.game})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="opponent">
                          Opponent Team <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="opponent"
                          value={formData.opponent}
                          onChange={(e) => handleInputChange("opponent", e.target.value)}
                          placeholder="Enter opponent team name"
                          maxLength={200}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tournamentName">Tournament Name</Label>
                        <Input
                          id="tournamentName"
                          value={formData.tournamentName}
                          onChange={(e) => handleInputChange("tournamentName", e.target.value)}
                          placeholder="e.g., NESL Week 5"
                          maxLength={200}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tournamentStage">Stage</Label>
                        <Select
                          value={formData.tournamentStage || "_none"}
                          onValueChange={(value) =>
                            handleInputChange("tournamentStage", value === "_none" ? "" : value)
                          }
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id="tournamentStage">
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none">None</SelectItem>
                            <SelectItem value="Groups">Groups</SelectItem>
                            <SelectItem value="Round of 16">Round of 16</SelectItem>
                            <SelectItem value="Quarterfinals">Quarterfinals</SelectItem>
                            <SelectItem value="Semifinals">Semifinals</SelectItem>
                            <SelectItem value="Finals">Finals</SelectItem>
                            <SelectItem value="Grand Finals">Grand Finals</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bestOf">Best of</Label>
                      <Select
                        value={formData.bestOf?.toString() || "1"}
                        onValueChange={(value) => handleInputChange("bestOf", parseInt(value))}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id="bestOf">
                          <SelectValue placeholder="Select best of" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Best of 1</SelectItem>
                          <SelectItem value="3">Best of 3</SelectItem>
                          <SelectItem value="5">Best of 5</SelectItem>
                          <SelectItem value="7">Best of 7</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes about the event (optional)"
                  maxLength={5000}
                  disabled={isSubmitting}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.notes?.length || 0} / 5000 characters
                </p>
              </div>
            </TabsContent>

            <TabsContent value="broadcast" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="gameTitle">Game Title</Label>
                <Select
                  value={formData.gameTitle || "_none"}
                  onValueChange={(value) =>
                    handleInputChange("gameTitle", value === "_none" ? "" : value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="gameTitle">
                    <SelectValue placeholder="Select game" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">None</SelectItem>
                    {COMMON_GAMES.map((game) => (
                      <SelectItem key={game} value={game}>
                        {game}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productionLead">Production Lead</Label>
                <Select
                  value={formData.productionLead || "_none"}
                  onValueChange={(value) =>
                    handleInputChange("productionLead", value === "_none" ? undefined : value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="productionLead">
                    <SelectValue placeholder="Select production lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">None</SelectItem>
                    {productionLeads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Broadcast Channels</Label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastChannels.twitch}
                      onChange={(e) =>
                        setBroadcastChannels((prev) => ({ ...prev, twitch: e.target.checked }))
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      disabled={isSubmitting}
                    />
                    <svg
                      className="w-5 h-5 text-purple-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                    </svg>
                    <span className="text-sm font-medium">Twitch</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastChannels.youtube}
                      onChange={(e) =>
                        setBroadcastChannels((prev) => ({ ...prev, youtube: e.target.checked }))
                      }
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      disabled={isSubmitting}
                    />
                    <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span className="text-sm font-medium">YouTube</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastChannels.tiktok}
                      onChange={(e) =>
                        setBroadcastChannels((prev) => ({ ...prev, tiktok: e.target.checked }))
                      }
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                      disabled={isSubmitting}
                    />
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                    <span className="text-sm font-medium">TikTok</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastChannels.facebook}
                      onChange={(e) =>
                        setBroadcastChannels((prev) => ({ ...prev, facebook: e.target.checked }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-sm font-medium">Facebook</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {formData.broadcastChannel || "None"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="graphicsPackage">Graphics Package</Label>
                <Input
                  id="graphicsPackage"
                  value={formData.graphicsPackage}
                  onChange={(e) => handleInputChange("graphicsPackage", e.target.value)}
                  placeholder="Graphics package identifier"
                  maxLength={200}
                  disabled={isSubmitting}
                />
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">
                    Start <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">
                    End <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Call Time</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={callDate}
                      onChange={(e) => setCallDate(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <Input
                      type="time"
                      value={callTime}
                      onChange={(e) => setCallTime(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">When crew should arrive</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="1440"
                    value={formData.duration || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "duration",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="120"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">Expected event length</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="linked" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="rosterId">Roster</Label>
                <Input
                  id="rosterId"
                  value={formData.rosterId || ""}
                  onChange={(e) => handleInputChange("rosterId", e.target.value)}
                  placeholder="Roster UUID (optional)"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">Link to a team roster</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checklistId">Checklist</Label>
                <Input
                  id="checklistId"
                  value={formData.checklistId || ""}
                  onChange={(e) => handleInputChange("checklistId", e.target.value)}
                  placeholder="Checklist UUID (optional)"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">Link to an operational checklist</p>
              </div>

              <div className="rounded-md bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Roster and checklist management features coming soon. For
                  now, you can enter UUIDs directly if you have them.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="talent" className="space-y-4 mt-4">
              <div className="space-y-1">
                <Label>Talent & Crew Assignments</Label>
                <p className="text-sm text-muted-foreground">
                  Assign team members by crew group. Apply a template or build assignments manually.
                </p>
              </div>

              {availableRoles.length === 0 && (
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>No crew groups defined.</strong> Go to Crew Management to create crew groups first.
                  </p>
                </div>
              )}

              {crewTemplates.length > 0 && (
                <div className="rounded-md border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Crew Template</Label>
                    </div>
                    {appliedTemplateName && (
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                        Applied: {appliedTemplateName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select a crew template and click Apply to load assignments (replaces current assignments).
                  </p>
                  <div className="flex gap-2">
                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId} disabled={isSubmitting}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {crewTemplates.map((template) => {
                          const memberCount = template.groups?.reduce(
                            (total, g) => total + (g.members?.length || 0),
                            0
                          ) || 0;
                          return (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} ({memberCount} members)
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={applyCrewTemplate}
                      disabled={isSubmitting || !selectedTemplateId}
                      variant="default"
                    >
                      Apply Template
                    </Button>
                  </div>
                </div>
              )}

              {/* Group assignments by role type */}
              {availableRoles.length > 0 && (
                <div className="space-y-3">
                  {availableRoles.map((role) => {
                    const roleAssignments = (formData.staffAssignments || []).filter(
                      (a) => a.roleType === role.value
                    );

                    return (
                      <div key={role.value} className="rounded-md border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">{role.label}</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                staffAssignments: [
                                  ...(prev.staffAssignments || []),
                                  { orgUserId: "", roleType: role.value as EventStaffRoleType, roleLabel: "" },
                                ],
                              }));
                            }}
                            disabled={isSubmitting}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>

                        {roleAssignments.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">
                            No one assigned to this role yet
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {formData.staffAssignments?.map((assignment, index) => {
                              if (assignment.roleType !== role.value) return null;

                              // Filter out already selected users
                              const selectedUserIds = (formData.staffAssignments || [])
                                .filter((_, i) => i !== index)
                                .map(a => a.orgUserId)
                                .filter(Boolean);
                              const availableUsers = productionLeads.filter(
                                lead => !selectedUserIds.includes(lead.id) || lead.id === assignment.orgUserId
                              );

                              return (
                                <div key={index} className="grid grid-cols-12 gap-2">
                                  <div className="col-span-6">
                                    <Select
                                      value={assignment.orgUserId || "_none"}
                                      onValueChange={(value) =>
                                        updateStaffAssignment(
                                          index,
                                          "orgUserId",
                                          value === "_none" ? "" : value
                                        )
                                      }
                                      disabled={isSubmitting}
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select user" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="_none">Select user</SelectItem>
                                        {availableUsers.map((lead) => (
                                          <SelectItem key={lead.id} value={lead.id}>
                                            {lead.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="col-span-5">
                                    <Input
                                      value={assignment.roleLabel || ""}
                                      onChange={(e) =>
                                        updateStaffAssignment(index, "roleLabel", e.target.value)
                                      }
                                      placeholder="Specific role/notes"
                                      maxLength={100}
                                      disabled={isSubmitting}
                                      className="h-9"
                                    />
                                  </div>

                                  <div className="col-span-1 flex items-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeStaffAssignment(index)}
                                      disabled={isSubmitting}
                                      className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      title="Remove"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Updating..." : "Update Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
