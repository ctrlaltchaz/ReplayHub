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
import {
  useCreateCrewTemplate,
  useCrewTemplate,
  useUpdateCrewTemplate,
} from "@/hooks/crew-templates";
import { Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useOrgUsers } from "../hooks/useOrgUsers";

// Predefined group names
const PREDEFINED_GROUPS = [
  "Production Team",
  "Commentary",
  "Technical",
  "Broadcast",
  "Social Media",
  "Content",
];

interface CrewTemplateGroup {
  name: string;
  description?: string;
  displayOrder: number;
}

interface CrewTemplateMember {
  orgUserId: string;
  groupId?: string;
  notes?: string;
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
  const { data: fullTemplate } = useCrewTemplate(slug, isEdit && open ? template?.id : undefined);

  const createMutation = useCreateCrewTemplate(slug);
  const updateMutation = useUpdateCrewTemplate(slug, template?.id || "");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [groups, setGroups] = useState<CrewTemplateGroup[]>([]);
  const [members, setMembers] = useState<CrewTemplateMember[]>([]);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && fullTemplate) {
      setName(fullTemplate.name);
      setDescription(fullTemplate.description || "");
      setIsDefault(fullTemplate.isDefault);
      
      // Extract groups
      const templateGroups = fullTemplate.groups || [];
      setGroups(
        templateGroups.map((g: any) => ({
          name: g.name,
          description: g.description || "",
          displayOrder: g.displayOrder || 0,
        }))
      );
      
      // Extract members with group references
      const allMembers: CrewTemplateMember[] = [];
      templateGroups.forEach((group: any) => {
        group.members?.forEach((m: any) => {
          allMembers.push({
            orgUserId: m.orgUserId,
            groupId: group.id,
            notes: m.notes || "",
          });
        });
      });
      setMembers(allMembers);
    } else {
      setName("");
      setDescription("");
      setIsDefault(false);
      setGroups([]);
      setMembers([]);
    }
  }, [isEdit, fullTemplate]);

  const handleAddGroup = () => {
    setGroups([...groups, { name: "", description: "", displayOrder: groups.length }]);
  };

  const handleRemoveGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
  };

  const handleGroupChange = (index: number, field: keyof CrewTemplateGroup, value: string | number) => {
    const updated = [...groups];
    updated[index] = { ...updated[index], [field]: value };
    setGroups(updated);
  };

  const handleAddMember = (groupIndex: number) => {
    const groupName = groups[groupIndex]?.name;
    if (!groupName) return;
    
    setMembers([...members, { orgUserId: "", groupId: `group-${groupIndex}`, notes: "" }]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof CrewTemplateMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
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

    if (groups.length === 0) {
      toast({
        title: "Validation error",
        description: "Add at least one group to the template",
        variant: "destructive",
      });
      return;
    }

    const invalidGroups = groups.filter((g) => !g.name.trim());
    if (invalidGroups.length > 0) {
      toast({
        title: "Validation error",
        description: "All groups must have a name",
        variant: "destructive",
      });
      return;
    }

    const invalidMembers = members.filter((m) => !m.orgUserId);
    if (invalidMembers.length > 0) {
      toast({
        title: "Validation error",
        description: "All members must have a user selected",
        variant: "destructive",
      });
      return;
    }

    const data = {
      name,
      description: description || undefined,
      isDefault,
      groups,
      members,
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

          {/* Groups Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Crew Groups *</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddGroup}>
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </div>

            {groups.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No groups added yet. Click "Add Group" to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {groups.map((group, groupIndex) => (
                  <Card key={groupIndex} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      {/* Group Header */}
                      <div className="flex items-start gap-3">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Group Name *</Label>
                            <Input
                              value={group.name}
                              onChange={(e) => handleGroupChange(groupIndex, "name", e.target.value)}
                              placeholder="e.g., Production Team"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Input
                              value={group.description}
                              onChange={(e) => handleGroupChange(groupIndex, "description", e.target.value)}
                              placeholder="Optional description"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveGroup(groupIndex)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Members in this group */}
                      <div className="space-y-2 pl-4 border-l-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Members</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddMember(groupIndex)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Member
                          </Button>
                        </div>

                        {members
                          .map((m, idx) => ({ ...m, originalIndex: idx }))
                          .filter((m) => m.groupId === `group-${groupIndex}`)
                          .map((member) => (
                            <div key={member.originalIndex} className="grid grid-cols-12 gap-2">
                              <div className="col-span-6 space-y-1">
                                <Select
                                  value={member.orgUserId}
                                  onValueChange={(value) =>
                                    handleMemberChange(member.originalIndex, "orgUserId", value)
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select user" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {orgUsers.map((user: any) => (
                                      <SelectItem key={user.id} value={user.id}>
                                        {user.displayName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-5 space-y-1">
                                <Input
                                  value={member.notes || ""}
                                  onChange={(e) =>
                                    handleMemberChange(member.originalIndex, "notes", e.target.value)
                                  }
                                  placeholder="Notes"
                                  className="h-8"
                                />
                              </div>
                              <div className="col-span-1 flex items-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member.originalIndex)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}

                        {members.filter((m) => m.groupId === `group-${groupIndex}`).length === 0 && (
                          <p className="text-xs text-muted-foreground italic py-2">
                            No members in this group yet
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
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
