'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/api/config';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, Key, Plus, Settings, Shield, Trash2, Users } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { useRoles } from '../hooks/useRoles';
import type { Role } from '../types/settings';

interface Permission {
    key: string;
    group: string;
    description: string | null;
}

interface RoleWithDetails extends Role {
    permissions: Permission[];
    userCount?: number;
    isSystemRole?: boolean;
}

// Helper function to group permissions by their group
function groupPermissionsByGroup(permissions: Permission[]): Record<string, Permission[]> {
    return permissions.reduce((acc, permission) => {
        const group = permission.group || 'general';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);
}

export default function RolesPage() {
    const params = useParams();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const orgSlug = params?.slug as string;

    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [rolesWithDetails, setRolesWithDetails] = useState<RoleWithDetails[]>([]);

    // Role dialog state
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleWithDetails | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roleFormData, setRoleFormData] = useState({
        name: '',
        description: '',
        permissionKeys: [] as string[]
    });

    // Delete confirmation dialog
    const [roleToDelete, setRoleToDelete] = useState<RoleWithDetails | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Permission details dialog
    const [viewingRole, setViewingRole] = useState<RoleWithDetails | null>(null);

    const { data: roles = [], isLoading, error } = useRoles(orgSlug);

    // Fetch permissions on mount
    React.useEffect(() => {
        fetchPermissions();
    }, [orgSlug]);

    // Fetch permissions when dialog opens (if not already loaded)
    React.useEffect(() => {
        if (isRoleDialogOpen && allPermissions.length === 0) {
            fetchPermissions();
        }
    }, [isRoleDialogOpen]);

    // Fetch role details
    React.useEffect(() => {
        if (roles.length > 0) {
            fetchRolesWithDetails();
        }
    }, [roles]);

    const fetchPermissions = async () => {
        try {
            const response = await fetch(getApiUrl(`/org/${orgSlug}/admin/permissions`), {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch permissions');
            }

            const data = await response.json();
            setAllPermissions(data.permissions || []);
        } catch (err) {
            console.error('Failed to fetch permissions:', err);
            toast({
                title: 'Error',
                description: 'Failed to load permissions',
                variant: 'destructive'
            });
        }
    };

    const fetchRolesWithDetails = async () => {
        try {
            const detailedRoles = await Promise.all(
                roles.map(async (role) => {
                    try {
                        const response = await fetch(getApiUrl(`/org/${orgSlug}/admin/roles/${role.id}`), {
                            credentials: 'include',
                        });

                        if (!response.ok) {
                            return { ...role, permissions: [], userCount: 0 };
                        }

                        const data = await response.json();
                        return {
                            ...role,
                            permissions: data.role?.permissions || [],
                            userCount: data.role?.userCount || 0
                        };
                    } catch (err) {
                        return { ...role, permissions: [], userCount: 0 };
                    }
                })
            );
            setRolesWithDetails(detailedRoles);
        } catch (err) {
            console.error('Failed to fetch role details:', err);
        }
    };

    const handleCreateRole = () => {
        setEditingRole(null);
        setRoleFormData({
            name: '',
            description: '',
            permissionKeys: []
        });
        setIsRoleDialogOpen(true);
    };

    const handleEditRole = (role: RoleWithDetails) => {
        setEditingRole(role);
        setRoleFormData({
            name: role.name,
            description: role.description || '',
            permissionKeys: role.permissions?.map(p => p.key) || []
        });
        setIsRoleDialogOpen(true);
    };

    const handleSubmitRole = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            const roleData = {
                name: roleFormData.name,
                description: roleFormData.description,
                permissions: roleFormData.permissionKeys
            };

            if (editingRole) {
                // Update existing role
                const response = await fetch(getApiUrl(`/org/${orgSlug}/admin/roles/${editingRole.id}`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(roleData),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update role');
                }

                toast({
                    title: "Role updated",
                    description: `Role "${roleFormData.name}" has been updated.`
                });
            } else {
                // Create new role
                const response = await fetch(getApiUrl(`/org/${orgSlug}/admin/roles`), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(roleData),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create role');
                }

                toast({
                    title: "Role created",
                    description: `Role "${roleFormData.name}" has been created.`
                });
            }

            setIsRoleDialogOpen(false);
            await queryClient.invalidateQueries({ queryKey: ['roles', orgSlug] });
            setTimeout(() => fetchRolesWithDetails(), 500);
        } catch (err: any) {
            console.error('Failed to save role:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to save role",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRole = async () => {
        if (!roleToDelete || deleteConfirmText !== 'DELETE') return;

        try {
            setIsDeleting(true);

            const response = await fetch(getApiUrl(`/org/${orgSlug}/admin/roles/${roleToDelete.id}`), {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete role');
            }

            toast({
                title: "Role deleted",
                description: `Role "${roleToDelete.name}" has been deleted.`
            });

            setRoleToDelete(null);
            setDeleteConfirmText('');
            await queryClient.invalidateQueries({ queryKey: ['roles', orgSlug] });
        } catch (err: any) {
            console.error('Failed to delete role:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to delete role",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const togglePermission = (permissionKey: string) => {
        setRoleFormData(prev => ({
            ...prev,
            permissionKeys: prev.permissionKeys.includes(permissionKey)
                ? prev.permissionKeys.filter(key => key !== permissionKey)
                : [...prev.permissionKeys, permissionKey]
        }));
    };

    const handleSelectAll = () => {
        if (roleFormData.permissionKeys.length === allPermissions.length) {
            // Deselect all
            setRoleFormData(prev => ({ ...prev, permissionKeys: [] }));
        } else {
            // Select all
            setRoleFormData(prev => ({ ...prev, permissionKeys: allPermissions.map(p => p.key) }));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading roles...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-destructive">Failed to load roles</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="px-1">
                <h2 className="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
                <p className="text-muted-foreground">
                    Create and manage roles with customizable permission sets
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rolesWithDetails.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {rolesWithDetails.filter(r => !r.isSystemRole).length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Permissions</CardTitle>
                        <Key className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allPermissions.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Users with Roles</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {rolesWithDetails.reduce((sum, role) => sum + (role.userCount || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Roles Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Roles & Permissions</CardTitle>
                        <Button onClick={handleCreateRole}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Role
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rolesWithDetails.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{role.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-xs truncate text-muted-foreground">
                                            {role.description || 'No description'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setViewingRole(role)}
                                        >
                                            {role.permissions?.length || 0} permissions
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {role.userCount || 0} users
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditRole(role)}
                                                title="Edit role"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setRoleToDelete(role)}
                                                title="Delete role"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {rolesWithDetails.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <div className="text-muted-foreground">
                                            No roles found. Create the first role to get started.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create/Edit Role Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRole ? 'Edit Role' : 'Create New Role'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingRole
                                ? 'Modify the role details and permissions.'
                                : 'Create a new role with specific permissions.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Role Name */}
                        <div className="space-y-2">
                            <Label htmlFor="role-name">
                                Role Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="role-name"
                                placeholder="e.g., Event Manager"
                                value={roleFormData.name}
                                onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                            />
                        </div>

                        {/* Role Description */}
                        <div className="space-y-2">
                            <Label htmlFor="role-description">Description</Label>
                            <Textarea
                                id="role-description"
                                placeholder="Describe what this role can do..."
                                value={roleFormData.description}
                                onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        {/* Permissions */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Permissions</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="select-all"
                                        checked={roleFormData.permissionKeys.length === allPermissions.length && allPermissions.length > 0}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="select-all" className="text-sm font-normal cursor-pointer">
                                        Select All ({roleFormData.permissionKeys.length}/{allPermissions.length})
                                    </label>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
                                {Object.entries(groupPermissionsByGroup(allPermissions)).map(([group, permissions]) => (
                                    <div key={group} className="space-y-2">
                                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                            {group}
                                        </h4>
                                        <div className="space-y-2 pl-2">
                                            {permissions.map((permission) => (
                                                <div key={permission.key} className="flex items-start gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`permission-${permission.key}`}
                                                        checked={roleFormData.permissionKeys.includes(permission.key)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            togglePermission(permission.key);
                                                        }}
                                                        className="h-4 w-4 rounded border-gray-300 mt-0.5"
                                                    />
                                                    <div className="grid gap-0.5" onClick={(e) => e.stopPropagation()}>
                                                        <label
                                                            htmlFor={`permission-${permission.key}`}
                                                            className="text-sm font-normal cursor-pointer"
                                                        >
                                                            {permission.key}
                                                        </label>
                                                        {permission.description && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {permission.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRoleDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitRole}
                            disabled={isSubmitting || !roleFormData.name.trim()}
                        >
                            {isSubmitting ? (
                                editingRole ? 'Updating...' : 'Creating...'
                            ) : (
                                editingRole ? 'Update Role' : 'Create Role'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Role Confirmation Dialog */}
            <Dialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Role</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the role
                            <strong> {roleToDelete?.name}</strong> and remove it from all users.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="delete-confirm" className="text-sm font-medium">
                                Type <span className="font-mono bg-muted px-1 rounded">DELETE</span> to confirm
                            </Label>
                            <Input
                                id="delete-confirm"
                                placeholder="DELETE"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className={deleteConfirmText && deleteConfirmText !== 'DELETE' ? 'border-red-500' : ''}
                            />
                            {deleteConfirmText && deleteConfirmText !== 'DELETE' && (
                                <p className="text-xs text-red-500">
                                    Please type DELETE exactly as shown
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRoleToDelete(null);
                                setDeleteConfirmText('');
                            }}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteRole}
                            disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Role'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Permissions Dialog */}
            <Dialog open={!!viewingRole} onOpenChange={(open) => !open && setViewingRole(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Role Permissions</DialogTitle>
                        <DialogDescription>
                            Permissions assigned to <strong>{viewingRole?.name}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {viewingRole && viewingRole.permissions && viewingRole.permissions.length > 0 ? (
                            Object.entries(groupPermissionsByGroup(viewingRole.permissions)).map(([group, permissions]) => (
                                <div key={group} className="space-y-2">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                        {group}
                                    </h4>
                                    <div className="flex flex-wrap gap-2 pl-2">
                                        {permissions.map((permission) => (
                                            <Badge key={permission.key} variant="secondary">
                                                {permission.key}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                No permissions assigned to this role.
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setViewingRole(null)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
