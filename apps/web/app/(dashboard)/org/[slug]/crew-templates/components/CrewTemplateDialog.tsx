"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useCrewGroups } from "@/hooks/crew-groups";
import {
  useCreateCrewTemplate,
  useCrewTemplate,
  useUpdateCrewTemplate,
} from "@/hooks/crew-templates";
import { Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useOrgUsers } from "../hooks/useOrgUsers";

interface SelectedGroup {
  groupId: string;
  members: Array<{
    orgUserId: string;
    notes?: string;
  }>;
}

interface CrewTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: any;
  slug: string;
}

export function CrewTemplateDialog({
  open,
  onOpenChange,
  template,
  slug,
}: CrewTemplateDialogProps) {
  const { toast } = useToast();
  const isEdit = !!template;

  const { data: orgUsers = [] } = useOrgUsers(slug);
  const { data: crewGroups = [] } = useCrewGroups(slug);
  const { data: fullTemplate } = useCrewTemplate(slug, isEdit && open ? template?.id : undefined);

  const createMutation = useCreateCrewTemplate(slug);
  const updateMutation = useUpdateCrewTemplate(slug, template?.id || "");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [groupMembers, setGroupMembers] = useState<Record<string, Array<{ orgUserId: string; notes?: string }>>>({});

  // Populate form when editing
  useEffect(() => {
    if (isEdit && fullTemplate && crewGroups.length > 0) {
      setName(fullTemplate.name);
      setDescription(fullTemplate.description || "");
      setIsDefault(fullTemplate.isDefault);

      // Match template groups to current crew groups by name
      const templateGroups = fullTemplate.groups || [];
      const matchedGroupIds: string[] = [];
      const membersByGroup: Record<string, Array<{ orgUserId: string; notes?: string }>> = {};

      templateGroups.forEach((templateGroup: any) => {
        // Find matching crew group by name
        const matchingCrewGroup = crewGroups.find(cg => cg.name === templateGroup.name);
        if (matchingCrewGroup) {
          matchedGroupIds.push(matchingCrewGroup.id);
          membersByGroup[matchingCrewGroup.id] = (templateGroup.members || []).map((m: any) => ({
            orgUserId: m.orgUserId,
            notes: m.notes || "",
          }));
        }
      });

      setSelectedGroupIds(matchedGroupIds);
      setGroupMembers(membersByGroup);
    } else if (!isEdit) {
      setName("");
      setDescription("");
      setIsDefault(false);
      setSelectedGroupIds([]);
      setGroupMembers({});
    }
  }, [isEdit, fullTemplate, open, crewGroups]);

  const toggleGroup = (groupId: string) => {
    if (selectedGroupIds.includes(groupId)) {
      setSelectedGroupIds(selectedGroupIds.filter(id => id !== groupId));
      const updated = { ...groupMembers };
      delete updated[groupId];
      setGroupMembers(updated);
    } else {
      setSelectedGroupIds([...selectedGroupIds, groupId]);
      setGroupMembers({ ...groupMembers, [groupId]: [] });
    }
  };

  const addMemberToGroup = (groupId: string) => {
    setGroupMembers({
      ...groupMembers,
      [groupId]: [...(groupMembers[groupId] || []), { orgUserId: "", notes: "" }],
    });
  };

  const removeMemberFromGroup = (groupId: string, memberIndex: number) => {
    setGroupMembers({
      ...groupMembers,
      [groupId]: groupMembers[groupId].filter((_, i) => i !== memberIndex),
    });
  };

  const updateMember = (groupId: string, memberIndex: number, field: "orgUserId" | "notes", value: string) => {
    const updated = { ...groupMembers };
    updated[groupId][memberIndex] = { ...updated[groupId][memberIndex], [field]: value };
    setGroupMembers(updated);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    if (selectedGroupIds.length === 0) {
      toast({
        title: "Validation error",
        description: "Select at least one crew group",
        variant: "destructive",
      });
      return;
    }

    // Validate all members have a user selected
    for (const groupId of selectedGroupIds) {
      const members = groupMembers[groupId] || [];
      const invalidMembers = members.filter((m) => !m.orgUserId);
      if (invalidMembers.length > 0) {
        const group = crewGroups.find(g => g.id === groupId);
        toast({
          title: "Validation error",
          description: `All members in "${group?.name}" must have a user selected`,
          variant: "destructive",
        });
        return;
      }
    }

    // Build groups array with members nested inside
    const groups = selectedGroupIds.map(groupId => {
      const group = crewGroups.find(g => g.id === groupId)!;
      const groupMembers_local = groupMembers[groupId] || [];
      
      return {
        name: group.name,
        description: group.description,
        displayOrder: group.displayOrder,
        icon: group.icon,
        members: groupMembers_local.map(member => ({
          orgUserId: member.orgUserId,
          notes: member.notes,
        })),
      };
    });

    const data = {
      name,
      description: description || undefined,
      isDefault,
      groups,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data);
        toast({
          title: "Template updated",
          description: "The crew template has been updated successfully.",
        });
      } else {
        await createMutation.mutateAsync(data);
        toast({
          title: "Template created",
          description: "The crew template has been created successfully.",
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: isEdit ? "Failed to update template" : "Failed to create template",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Template" : "Create Template"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the crew template details and member assignments."
              : "Create a reusable crew template to quickly assign roles to events."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Tournament Crew"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template..."
              rows={2}
            />
          </div>

          {/* Default Template */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked === true)}
            />
            <Label htmlFor="isDefault" className="font-normal">
              Set as default template
            </Label>
          </div>

          {/* Crew Groups Selection */}
          <div className="space-y-3">
            <Label>Select Crew Groups *</Label>
            <p className="text-sm text-muted-foreground">
              Choose which crew groups to include in this template
            </p>

            {crewGroups.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No crew groups available. Create crew groups first in the Crew Groups tab.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 border rounded-lg p-3">
                {crewGroups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`group-${group.id}`}
                      checked={selectedGroupIds.includes(group.id)}
                      onCheckedChange={() => toggleGroup(group.id)}
                    />
                    <Label
                      htmlFor={`group-${group.id}`}
                      className="flex-1 font-normal cursor-pointer"
                    >
                      <span className="font-semibold">{group.name}</span>
                      {group.description && (
                        <span className="text-xs text-muted-foreground ml-2">
                          - {group.description}
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Members for Selected Groups */}
          {selectedGroupIds.length > 0 && (
            <div className="space-y-3">
              <Label>Assign Members</Label>
              <p className="text-sm text-muted-foreground">
                Add people to each selected group (optional)
              </p>

              <div className="space-y-4">
                {selectedGroupIds.map((groupId) => {
                  const group = crewGroups.find(g => g.id === groupId);
                  if (!group) return null;

                  const members = groupMembers[groupId] || [];

                  return (
                    <Card key={groupId} className="border-2">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">{group.name}</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addMemberToGroup(groupId)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Member
                          </Button>
                        </div>

                        {members.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic py-2">
                            No members assigned yet
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {members.map((member, idx) => {
                              // Get list of ALL already selected user IDs across ALL groups (excluding current member)
                              const allSelectedUserIds: string[] = [];
                              Object.entries(groupMembers).forEach(([gId, gMembers]) => {
                                gMembers.forEach((m, i) => {
                                  // Exclude current member being edited
                                  if (!(gId === groupId && i === idx) && m.orgUserId) {
                                    allSelectedUserIds.push(m.orgUserId);
                                  }
                                });
                              });

                              // Filter out already selected users from other groups
                              const availableUsers = orgUsers.filter(
                                (user: any) => !allSelectedUserIds.includes(user.id) || user.id === member.orgUserId
                              );

                              return (
                                <div key={idx} className="grid grid-cols-12 gap-2">
                                  <div className="col-span-6">
                                    <Select
                                      value={member.orgUserId}
                                      onValueChange={(value) =>
                                        updateMember(groupId, idx, "orgUserId", value)
                                      }
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select user" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableUsers.map((user: any) => (
                                          <SelectItem key={user.id} value={user.id}>
                                            {user.displayName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-5">
                                    <Input
                                      value={member.notes || ""}
                                      onChange={(e) =>
                                        updateMember(groupId, idx, "notes", e.target.value)
                                      }
                                      placeholder="Role/notes"
                                      className="h-9"
                                    />
                                  </div>
                                  <div className="col-span-1 flex items-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeMemberFromGroup(groupId, idx)}
                                      className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : isEdit
                ? "Update Template"
                : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
