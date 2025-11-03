'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import { ArrowLeft, Edit, Key, Plus, Settings, Shield, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Permission {
    id: string;
    key: string;
    group: string;
    description?: string;
}

interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: Permission[];
    userCount: number;
    isSystemRole?: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Organisation {
    id: string;
    name: string;
    slug: string;
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

export default function OrganisationRolesPage() {
    const params = useParams();
    const { toast } = useToast();
    const orgId = params?.orgId as string;

    const [organisation, setOrganisation] = useState<Organisation | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Role dialog state
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roleFormData, setRoleFormData] = useState({
        name: '',
        description: '',
        permissionIds: [] as string[]
    });

    // Delete confirmation dialog
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permission details dialog
    const [viewingRole, setViewingRole] = useState<Role | null>(null);

    useEffect(() => {
        fetchData();
    }, [orgId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('[DEBUG] Fetching data for orgId:', orgId);

            const [orgResponse, rolesResponse, permissionsResponse] = await Promise.all([
                apiGet<Organisation>(`/admin/organisations/${orgId}`),
                apiGet<Role[]>(`/admin/organisations/${orgId}/roles`),
                apiGet<Permission[]>(`/admin/organisations/${orgId}/permissions`)
            ]);

            console.log('[DEBUG] API Responses:', {
                org: orgResponse,
                roles: rolesResponse,
                permissions: permissionsResponse
            });

            setOrganisation(orgResponse);
            setRoles(rolesResponse);
            setAllPermissions(permissionsResponse);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load organization data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRole = () => {
        setEditingRole(null);
        setRoleFormData({
            name: '',
            description: '',
            permissionIds: []
        });
        setIsRoleDialogOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setRoleFormData({
            name: role.name,
            description: role.description || '',
            permissionIds: role.permissions.map(p => p.id)
        });
        setIsRoleDialogOpen(true);
    };

    const handleSubmitRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organisation) return;

        try {
            setIsSubmitting(true);

            console.log('[DEBUG] Submitting role:', {
                editing: !!editingRole,
                formData: roleFormData,
                orgId: orgId
            });

            if (editingRole) {
                // Update existing role
                await apiPut(`/admin/organisations/${orgId}/roles/${editingRole.id}`, roleFormData);
                toast({
                    title: "Role updated",
                    description: `Role "${roleFormData.name}" has been updated.`
                });
            } else {
                // Create new role
                console.log('[DEBUG] Creating new role with data:', roleFormData);
                const result = await apiPost(`/admin/organisations/${orgId}/roles`, roleFormData);
                console.log('[DEBUG] Role creation result:', result);
                toast({
                    title: "Role created",
                    description: `Role "${roleFormData.name}" has been created.`
                });
            }

            setIsRoleDialogOpen(false);
            await fetchData();
        } catch (err: any) {
            console.error('Failed to save role:', err);
            toast({
                title: "Error",
                description: err.response?.data?.message || err.message || "Failed to save role",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }; const handleDeleteRole = async () => {
        if (!roleToDelete) return;

        try {
            setIsDeleting(true);
            await apiDelete(`/admin/organisations/${orgId}/roles/${roleToDelete.id}`);

            toast({
                title: "Role deleted",
                description: `Role "${roleToDelete.name}" has been deleted.`
            });

            setRoleToDelete(null);
            await fetchData();
        } catch (err: any) {
            console.error('Failed to delete role:', err);
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to delete role",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const togglePermission = (permissionId: string) => {
        setRoleFormData(prev => ({
            ...prev,
            permissionIds: prev.permissionIds.includes(permissionId)
                ? prev.permissionIds.filter(id => id !== permissionId)
                : [...prev.permissionIds, permissionId]
        }));
    };

    const handleSelectAll = () => {
        if (roleFormData.permissionIds.length === allPermissions.length) {
            // Deselect all
            setRoleFormData(prev => ({ ...prev, permissionIds: [] }));
        } else {
            // Select all
            setRoleFormData(prev => ({ ...prev, permissionIds: allPermissions.map(p => p.id) }));
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/organisations/${orgId}`}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Organization
                            </Button>
                        </Link>
                    </div>
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-muted rounded w-1/3"></div>
                        <div className="h-64 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !organisation) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/organisations/${orgId}`}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Organization
                            </Button>
                        </Link>
                    </div>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold mb-2">
                                    {error || 'Organisation not found'}
                                </h2>
                                <p className="text-muted-foreground">
                                    Unable to load organization data.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/organisations/${orgId}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Organization
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{organisation.name} - Roles & Permissions</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage roles and permissions for this organization
                        </p>
                    </div>
                    <Button onClick={handleCreateRole}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Role
                    </Button>
                </div>

                {/* Management Tabs */}
                <div className="border-b">
                    <nav className="flex space-x-8">
                        <Link href={`/admin/organisations/${orgId}`}>
                            <button className="py-2 px-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border font-medium text-sm">
                                Overview
                            </button>
                        </Link>
                        <Link href={`/admin/organisations/${orgId}/users`}>
                            <button className="py-2 px-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border font-medium text-sm">
                                Users
                            </button>
                        </Link>
                        <button className="py-2 px-1 border-b-2 border-primary text-primary font-medium text-sm">
                            Roles & Permissions
                        </button>
                    </nav>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{roles.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {roles.length}
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
                                {roles.reduce((sum, role) => sum + role.userCount, 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Roles Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead>Users</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role) => (
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
                                                {role.permissions.length} permissions
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {role.userCount} users
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={role.isSystemRole ? "default" : "outline"}>
                                                {role.isSystemRole ? "System" : "Custom"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditRole(role)}
                                                    disabled={role.isSystemRole}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setRoleToDelete(role)}
                                                    disabled={role.isSystemRole}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {roles.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
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
            </div>

            {/* Create/Edit Role Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRole ? 'Edit Role' : 'Create New Role'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingRole
                                ? 'Update role information and permissions.'
                                : 'Create a new role and assign permissions.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitRole} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Role Name *</Label>
                                <Input
                                    id="name"
                                    value={roleFormData.name}
                                    onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={roleFormData.description}
                                    onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                                    placeholder="Describe what this role is for..."
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Permissions</Label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="select-all-permissions"
                                        checked={roleFormData.permissionIds.length === allPermissions.length && allPermissions.length > 0}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    <Label htmlFor="select-all-permissions" className="text-sm font-medium cursor-pointer">
                                        Select All ({roleFormData.permissionIds.length}/{allPermissions.length})
                                    </Label>
                                </div>
                            </div>
                            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">{allPermissions.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    Loading permissions...
                                </div>
                            ) : (
                                Object.entries(groupPermissionsByGroup(allPermissions)).map(([group, permissions]) => (
                                    <div key={group} className="mb-4">
                                        <h4 className="font-medium text-sm mb-2 capitalize">{group || 'General'}</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {permissions.map((permission) => (
                                                <div key={permission.id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={permission.id}
                                                        checked={roleFormData.permissionIds.includes(permission.id)}
                                                        onChange={() => togglePermission(permission.id)}
                                                        className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <Label htmlFor={permission.id} className="text-sm">
                                                        {permission.key}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsRoleDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? (editingRole ? 'Updating...' : 'Creating...')
                                    : (editingRole ? 'Update Role' : 'Create Role')
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Role Confirmation Dialog */}
            <Dialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Role</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the role &quot;{roleToDelete?.name}&quot;?
                            This will remove the role from all users. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setRoleToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteRole}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Role'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Role Permissions Dialog */}
            <Dialog open={!!viewingRole} onOpenChange={() => setViewingRole(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Role Permissions: {viewingRole?.name}</DialogTitle>
                        <DialogDescription>
                            Permissions assigned to this role.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {viewingRole && Object.entries(groupPermissionsByGroup(viewingRole.permissions)).map(([group, permissions]) => (
                            <div key={group}>
                                <h4 className="font-medium text-sm mb-2 capitalize">{group || 'General'}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {permissions.map((permission) => (
                                        <Badge key={permission.id} variant="secondary">
                                            {permission.key}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {viewingRole?.permissions.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">
                                No permissions assigned to this role.
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setViewingRole(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}