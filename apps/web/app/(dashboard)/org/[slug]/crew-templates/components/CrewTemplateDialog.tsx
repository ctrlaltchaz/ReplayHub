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

// Predefined crew/talent roles
const PREDEFINED_ROLES = [
  "Player",
  "Shoutcaster",
  "Broadcaster",
  "Director",
  "Producer",
  "Observer",
  "Technician",
  "Social Media Runner",
  "Editor",
  "Filmer",
  "Photographer",
  "Tutor",
];

interface CrewTemplateMember {
  orgUserId: string;
  role: string;
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
  const [members, setMembers] = useState<CrewTemplateMember[]>([]);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && fullTemplate) {
      setName(fullTemplate.name);
      setDescription(fullTemplate.description || "");
      setIsDefault(fullTemplate.isDefault);
      setMembers(
        fullTemplate.members.map((m: any) => ({
          orgUserId: m.orgUserId,
          role: m.role,
          notes: m.notes || "",
        }))
      );
    } else {
      setName("");
      setDescription("");
      setIsDefault(false);
      setMembers([]);
    }
  }, [isEdit, fullTemplate]);

  const handleAddMember = () => {
    setMembers([...members, { orgUserId: "", role: "", notes: "" }]);
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

    if (members.length === 0) {
      toast({
        title: "Validation error",
        description: "Add at least one member to the template",
        variant: "destructive",
      });
      return;
    }

    const invalidMembers = members.filter((m) => !m.orgUserId || !m.role);
    if (invalidMembers.length > 0) {
      toast({
        title: "Validation error",
        description: "All members must have a user and role selected",
        variant: "destructive",
      });
      return;
    }

    const data = {
      name,
      description: description || undefined,
      isDefault,
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

          {/* Members Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Template Members *</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddMember}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>

            {members.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No members added yet. Click "Add Member" to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {members.map((member, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-12 gap-3">
                        {/* User Select */}
                        <div className="col-span-5 space-y-1">
                          <Label className="text-xs">User *</Label>
                          <Select
                            value={member.orgUserId}
                            onValueChange={(value) => handleMemberChange(index, "orgUserId", value)}
                          >
                            <SelectTrigger>
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

                        {/* Role Select/Input */}
                        <div className="col-span-4 space-y-1">
                          <Label className="text-xs">Role *</Label>
                          <Select
                            value={PREDEFINED_ROLES.includes(member.role) ? member.role : "custom"}
                            onValueChange={(value) => {
                              if (value !== "custom") {
                                handleMemberChange(index, "role", value);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              <SelectItem value="custom">
                                <span className="font-medium">Custom Role...</span>
                              </SelectItem>
                              <div className="my-1 border-t" />
                              {PREDEFINED_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {(!PREDEFINED_ROLES.includes(member.role) || !member.role) && (
                            <Input
                              value={member.role}
                              onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                              placeholder="Enter custom role"
                              className="mt-2"
                            />
                          )}
                        </div>

                        {/* Notes Input */}
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Notes</Label>
                          <Input
                            value={member.notes || ""}
                            onChange={(e) => handleMemberChange(index, "notes", e.target.value)}
                            placeholder="Optional"
                          />
                        </div>

                        {/* Delete Button */}
                        <div className="col-span-1 flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
