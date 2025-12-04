"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  useCreateCrewGroup,
  useCrewGroups,
  useDeleteCrewGroup,
  useUpdateCrewGroup,
  type CrewGroup,
} from "@/hooks/crew-groups";
import { useCrewTemplates, useDeleteCrewTemplate } from "@/hooks/crew-templates";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { hasPermission, PERMISSIONS } from "@/lib/permissions/utils";
import * as LucideIcons from "lucide-react";
import { AlertTriangle, Edit, FolderTree, Plus, Star, Tags, Trash2, Users2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { CrewGroupDialog } from "./components/CrewGroupDialog";
import { CrewTemplateDialog } from "./components/CrewTemplateDialog";

export default function CrewManagementPage() {
  usePageTitle("Crew Management");

  const params = useParams();
  const slug = params?.slug as string;
  const { toast } = useToast();
  const { permissions } = useAuth();

  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CrewGroup | null>(null);
  const [expandedTemplates, setExpandedTemplates] = useState<Record<string, boolean>>({});

  const { data: allTemplates = [], isLoading: templatesLoading } = useCrewTemplates(slug);
  const { data: groups = [], isLoading: groupsLoading } = useCrewGroups(slug);
  const deleteTemplateMutation = useDeleteCrewTemplate(slug);
  const createGroupMutation = useCreateCrewGroup(slug);
  const updateGroupMutation = useUpdateCrewGroup(slug);
  const deleteGroupMutation = useDeleteCrewGroup(slug);

  // Filter out system template
  const templates = allTemplates.filter(t => t.name !== '_system_groups');

  const toggleTemplateExpand = (templateId: string) => {
    setExpandedTemplates(prev => ({
      ...prev,
      [templateId]: !prev[templateId]
    }));
  };

  const canManage = hasPermission(permissions, PERMISSIONS.EVENTS_MANAGE);

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      await deleteTemplateMutation.mutateAsync(templateId);
      toast({
        title: "Template deleted",
        description: "The crew template has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete template",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSaveGroup = async (data: Omit<CrewGroup, "id"> & { id?: string }) => {
    try {
      if (data.id) {
        await updateGroupMutation.mutateAsync({ id: data.id, data });
        toast({
          title: "Group updated",
          description: "The crew group has been updated successfully.",
        });
      } else {
        await createGroupMutation.mutateAsync(data);
        toast({
          title: "Group created",
          description: "The crew group has been created successfully.",
        });
      }
    } catch (error) {
      toast({
        title: data.id ? "Failed to update group" : "Failed to create group",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this crew group? This cannot be undone.")) {
      return;
    }

    try {
      await deleteGroupMutation.mutateAsync(groupId);
      toast({
        title: "Group deleted",
        description: "The crew group has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete group",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  if (!canManage) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You do not have permission to manage crew.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users2 className="h-6 w-6" />
              Crew Management
            </h1>
            <p className="text-muted-foreground">
              Manage crew groups/roles and create reusable templates for events
            </p>
          </div>
        </div>

        {/* Tabs for Groups and Templates */}
        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="groups" className="gap-2">
              <Tags className="h-4 w-4" />
              Crew Groups
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FolderTree className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Crew Groups & Roles</CardTitle>
                    <CardDescription>
                      Define crew groups that can be used across templates and events. These become the role options when assigning talent.
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateGroupDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Group
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {groupsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading groups...</div>
                ) : groups.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No crew groups yet</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Create crew groups like "Commentary", "Production", or "Technical" to organize your team roles
                    </p>
                    <Button onClick={() => setShowCreateGroupDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Group
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groups.map((group) => {
                      // Dynamically render icon if it exists - capitalize first letter for PascalCase
                      const iconName = group.icon
                        ? group.icon.charAt(0).toUpperCase() + group.icon.slice(1)
                        : null;
                      const IconComponent = iconName && (LucideIcons as any)[iconName]
                        ? (LucideIcons as any)[iconName]
                        : Tags;

                      return (
                        <div
                          key={group.id}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                              <h4 className="text-sm font-montserrat font-semibold">{group.name}</h4>
                            </div>
                            {group.description && (
                              <p className="text-xs font-montserrat font-semibold text-muted-foreground">{group.description}</p>
                            )}
                            <p className="text-xs font-montserrat font-semibold text-muted-foreground">
                              Used in {templates.filter(t => t.groups?.some(g => g.name === group.name)).length} template(s)
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingGroup(group)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Crew Templates</CardTitle>
                    <CardDescription>
                      Create templates with predefined crew assignments. Apply them to events for quick setup.
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateTemplateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No templates yet</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Templates let you save common crew configurations and apply them quickly to multiple events
                    </p>
                    <Button onClick={() => setShowCreateTemplateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-montserrat font-semibold">Name</TableHead>
                        <TableHead className="text-xs font-montserrat font-semibold">Description</TableHead>
                        <TableHead className="text-xs font-montserrat font-semibold">Groups</TableHead>
                        <TableHead className="text-xs font-montserrat font-semibold">Members</TableHead>
                        <TableHead className="text-xs font-montserrat font-semibold">Default</TableHead>
                        <TableHead className="text-xs font-montserrat font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => {
                        const isExpanded = expandedTemplates[template.id] || false;
                        return (
                          <React.Fragment key={template.id}>
                            <TableRow>
                              <TableCell className="text-sm font-montserrat font-semibold">{template.name}</TableCell>
                              <TableCell className="text-sm font-montserrat font-semibold max-w-md truncate">
                                {template.description || "-"}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {template.groups?.length || 0} groups
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {template.groups?.reduce((total, g) => total + (g.members?.length || 0), 0) || 0} members
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {template.isDefault && (
                                  <Badge variant="default" className="gap-1">
                                    <Star className="h-3 w-3" />
                                    Default
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleTemplateExpand(template.id)}
                                  >
                                    {isExpanded ? "Hide" : "View"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingTemplate(template)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteTemplate(template.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {isExpanded && (
                              <TableRow>
                                <TableCell colSpan={6} className="bg-muted/30 p-4">
                                  <div className="space-y-4">
                                    {template.groups?.map((group: any, idx: number) => (
                                      <div key={idx} className="border rounded-lg p-3 bg-background">
                                        <div className="font-semibold text-sm mb-2">{group.name}</div>
                                        {group.members && group.members.length > 0 ? (
                                          <div className="space-y-1">
                                            {group.members.map((member: any, mIdx: number) => (
                                              <div key={mIdx} className="text-xs text-muted-foreground flex items-center gap-2">
                                                <span>• {member.user?.displayName || member.user?.email || "Unknown"}</span>
                                                {member.notes && (
                                                  <span className="text-xs italic">({member.notes})</span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-xs text-muted-foreground italic">No members assigned</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CrewTemplateDialog
        open={showCreateTemplateDialog || !!editingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateTemplateDialog(false);
            setEditingTemplate(null);
          }
        }}
        template={editingTemplate}
        slug={slug}
      />

      <CrewGroupDialog
        open={showCreateGroupDialog || !!editingGroup}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateGroupDialog(false);
            setEditingGroup(null);
          }
        }}
        group={editingGroup}
        onSave={handleSaveGroup}
      />
    </div>
  );
}
