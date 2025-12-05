'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/api/config';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, Edit, Mail, Plus, Power, PowerOff, Trash2, User, UserCheck, Users } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useAssignRoles } from '../hooks/useAssignRoles';
import { useCreateUser } from '../hooks/useCreateUser';
import { useDeactivateUser, useReactivateUser } from '../hooks/useDeactivateUser';
import { useRoles } from '../hooks/useRoles';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { useUsers } from '../hooks/useUsers';
import type { CreateUserDto, OrgUser, UpdateUserDto } from '../types/settings';

export default function UsersPage() {
    const params = useParams();
    const orgSlug = params?.slug as string;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<OrgUser | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userFormData, setUserFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        roleIds: [] as string[],
        isActive: true,
        sendInvite: true
    });

    // Link existing global user state
    const [linkExisting, setLinkExisting] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string; email: string; name?: string }>>([]);
    const [selectedGlobalUserId, setSelectedGlobalUserId] = useState<string | null>(null);

    // Delete confirmation dialog
    const [userToDelete, setUserToDelete] = useState<OrgUser | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Deactivate confirmation dialog
    const [userToDeactivate, setUserToDeactivate] = useState<OrgUser | null>(null);
    const [isDeactivating, setIsDeactivating] = useState(false);

    const { data: users = [], isLoading, error } = useUsers(orgSlug);
    const { data: roles = [] } = useRoles(orgSlug);
    const createMutation = useCreateUser(orgSlug);
    const updateMutation = useUpdateUser(orgSlug, editingUser?.id || '');
    const deactivateMutation = useDeactivateUser(orgSlug);
    const reactivateMutation = useReactivateUser(orgSlug);
    const assignRolesMutation = useAssignRoles(orgSlug, editingUser?.id || '');

    const handleCreateUser = () => {
        setEditingUser(null);
        setUserFormData({
            email: '',
            firstName: '',
            lastName: '',
            roleIds: [],
            isActive: true,
            sendInvite: true
        });
        setLinkExisting(false);
        setSearchEmail('');
        setSearchResults([]);
        setSelectedGlobalUserId(null);
        setIsUserDialogOpen(true);
    };

    const handleEditUser = (user: OrgUser) => {
        setEditingUser(user);
        setUserFormData({
            email: user.email,
            firstName: user.displayName.split(' ')[0] || '',
            lastName: user.displayName.split(' ').slice(1).join(' ') || '',
            roleIds: user.roles || [],
            isActive: user.isActive,
            sendInvite: false
        });
        setIsUserDialogOpen(true);
    };

    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            if (editingUser) {
                // Update existing user - send displayName and isActive
                const displayName = `${userFormData.firstName} ${userFormData.lastName}`.trim() || userFormData.email;
                await updateMutation.mutateAsync({
                    displayName,
                    isActive: userFormData.isActive
                } as UpdateUserDto);

                // Update roles if changed
                if (userFormData.roleIds.length > 0) {
                    try {
                        const rolesUrl = getApiUrl(`/org/${orgSlug}/users/${editingUser.id}/roles`);
                        const rolesResponse = await fetch(rolesUrl, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ roles: userFormData.roleIds }),
                        });

                        if (!rolesResponse.ok) {
                            const error = await rolesResponse.json();
                            throw new Error(error.message || 'Failed to update roles');
                        }
                    } catch (roleError: any) {
                        console.error('Failed to update roles:', roleError);
                        toast({
                            title: 'User updated, but role assignment failed',
                            description: roleError.message || 'You can assign roles manually.',
                            variant: 'destructive',
                        });
                    }
                }

                toast({
                    title: "User updated",
                    description: `${userFormData.firstName} ${userFormData.lastName} has been updated.`
                });
            } else {
                // Create new user
                const displayName = `${userFormData.firstName} ${userFormData.lastName}`.trim() || userFormData.email;

                const createData: any = {
                    email: userFormData.email,
                    displayName: displayName,
                };

                // If we have a global user ID, add it (for existing user flow)
                if (linkExisting && selectedGlobalUserId) {
                    createData.globalUserId = selectedGlobalUserId;
                }

                const createdUser = await createMutation.mutateAsync(createData as CreateUserDto);

                // Assign roles after user creation
                if (userFormData.roleIds.length > 0) {
                    try {
                        const rolesUrl = getApiUrl(`/org/${orgSlug}/users/${createdUser.id}/roles`);
                        const rolesResponse = await fetch(rolesUrl, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ roles: userFormData.roleIds }),
                        });

                        if (!rolesResponse.ok) {
                            const error = await rolesResponse.json();
                            throw new Error(error.message || 'Failed to assign roles');
                        }
                    } catch (roleError: any) {
                        console.error('Failed to assign roles:', roleError);
                        toast({
                            title: 'User created, but role assignment failed',
                            description: roleError.message || 'You can assign roles manually from the user list.',
                            variant: 'destructive',
                        });
                    }
                }

                // Handle active status
                if (!userFormData.isActive) {
                    try {
                        await deactivateMutation.mutateAsync(createdUser.id);
                    } catch (deactivateError) {
                        console.error('Failed to deactivate user:', deactivateError);
                    }
                }

                toast({
                    title: "User created",
                    description: `${userFormData.firstName} ${userFormData.lastName} has been added to the organization.`
                });
            }

            // Invalidate queries to refresh the list
            await queryClient.invalidateQueries({ queryKey: ['users', orgSlug] });
            await queryClient.invalidateQueries({ queryKey: ['roles', orgSlug] });

            setIsUserDialogOpen(false);
        } catch (err: any) {
            console.error('Failed to save user:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to save user",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivateUser = async () => {
        if (!userToDeactivate) return;

        try {
            setIsDeactivating(true);

            await deactivateMutation.mutateAsync(userToDeactivate.id);

            toast({
                title: "User deactivated",
                description: `${userToDeactivate.displayName} has been deactivated.`
            });

            // Invalidate queries to refresh the list
            await queryClient.invalidateQueries({ queryKey: ['users', orgSlug] });

            setUserToDeactivate(null);
        } catch (err: any) {
            console.error('Failed to deactivate user:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to deactivate user",
                variant: "destructive"
            });
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete || deleteConfirmText !== 'DELETE') return;

        try {
            setIsDeleting(true);

            // Call the delete endpoint (you'll need to implement this in the backend)
            const deleteUrl = getApiUrl(`/org/${orgSlug}/users/${userToDelete.id}`);
            const response = await fetch(deleteUrl, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete user');
            }

            toast({
                title: "User deleted",
                description: `${userToDelete.displayName} has been permanently deleted.`,
                variant: "default"
            });

            // Invalidate queries to refresh the list
            await queryClient.invalidateQueries({ queryKey: ['users', orgSlug] });

            setUserToDelete(null);
            setDeleteConfirmText('');
        } catch (err: any) {
            console.error('Failed to delete user:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to delete user",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleReactivateUser = async (userId: string) => {
        try {
            await reactivateMutation.mutateAsync(userId);

            toast({
                title: "User reactivated",
                description: "User has been reactivated successfully."
            });

            // Invalidate queries to refresh the list
            await queryClient.invalidateQueries({ queryKey: ['users', orgSlug] });
        } catch (err: any) {
            console.error('Failed to reactivate user:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to reactivate user",
                variant: "destructive"
            });
        }
    };

    const handleSearchGlobalUsers = async () => {
        try {
            const response = await fetch(getApiUrl(`/admin/global-users?search=${encodeURIComponent(searchEmail)}`), {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to search users');
            }

            const res: any = await response.json();
            const foundUsers = res?.users || [];
            setSearchResults(foundUsers.map((u: any) => ({
                id: u.id,
                email: u.email,
                name: u.displayName || u.name
            })));
        } catch (err) {
            console.error('Global user search failed', err);
            toast({
                title: 'Error',
                description: 'Failed to search global users',
                variant: 'destructive'
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-destructive">Failed to load users</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="px-1">
                <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                <p className="text-muted-foreground">
                    Manage organization members and their access
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter(u => u.isActive).length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Roles</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roles.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Joins</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter(u =>
                                new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                            ).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Organization Users</CardTitle>
                        <Button onClick={handleCreateUser}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {user.displayName || 'Unnamed User'}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            {user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles?.map((roleName) => (
                                                <Badge key={roleName} variant="secondary">
                                                    {roleName}
                                                </Badge>
                                            ))}
                                            {(!user.roles || user.roles.length === 0) && (
                                                <Badge variant="outline">No roles</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.isActive ? "default" : "secondary"}>
                                            {user.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditUser(user)}
                                                title="Edit user"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            {user.isActive ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setUserToDeactivate(user)}
                                                    title="Deactivate user"
                                                >
                                                    <PowerOff className="h-4 w-4 text-orange-500" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleReactivateUser(user.id)}
                                                    title="Reactivate user"
                                                >
                                                    <Power className="h-4 w-4 text-green-500" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setUserToDelete(user)}
                                                title="Delete user permanently"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <div className="text-muted-foreground">
                                            No users found. Create the first user to get started.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create/Edit User Dialog */}
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser
                                ? 'Update user information and role assignments.'
                                : 'Add a new user to the organization and assign roles.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitUser} className="space-y-4">
                        {!editingUser && (
                            <div className="space-y-2">
                                <Label htmlFor="userType">User Type</Label>
                                <Select
                                    value={linkExisting ? 'existing' : 'new'}
                                    onValueChange={(value) => {
                                        const isExisting = value === 'existing';
                                        setLinkExisting(isExisting);
                                        if (!isExisting) {
                                            setSelectedGlobalUserId(null);
                                            setSearchEmail('');
                                            setSearchResults([]);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select user type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">Create new user</SelectItem>
                                        <SelectItem value="existing">Assign existing global user</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {linkExisting && !editingUser && (
                            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                                <Label htmlFor="searchEmail">Search Global Users</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="searchEmail"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={searchEmail}
                                        onChange={(e) => setSearchEmail(e.target.value)}
                                    />
                                    <Button type="button" onClick={handleSearchGlobalUsers}>
                                        Search
                                    </Button>
                                </div>

                                {searchResults.length === 0 && searchEmail && (
                                    <div className="text-sm text-muted-foreground">No matches found. Try a different email.</div>
                                )}
                                {searchResults.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Select a user:</Label>
                                        {searchResults.map((su) => (
                                            <div key={su.id} className="flex items-center justify-between p-3 border rounded bg-background hover:bg-accent transition-colors">
                                                <div>
                                                    <div className="font-medium">{su.name || su.email}</div>
                                                    <div className="text-sm text-muted-foreground">{su.email}</div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={selectedGlobalUserId === su.id ? "default" : "outline"}
                                                    onClick={() => {
                                                        setSelectedGlobalUserId(su.id);
                                                        setUserFormData({ ...userFormData, email: su.email });
                                                        toast({ title: 'Selected', description: `Linked to ${su.email}` });
                                                    }}
                                                >
                                                    {selectedGlobalUserId === su.id ? 'Selected' : 'Select'}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedGlobalUserId && (
                                    <div className="text-sm font-medium text-green-600 mt-2">✓ Global user selected</div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={userFormData.email}
                                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                    required
                                    disabled={!!editingUser || (linkExisting && !!selectedGlobalUserId)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={userFormData.firstName}
                                    onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={userFormData.lastName}
                                    onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Roles</Label>
                            <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                                {roles.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No roles available</p>
                                ) : (
                                    roles.map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`role-${role.id}`}
                                                checked={userFormData.roleIds.includes(role.name)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setUserFormData({
                                                            ...userFormData,
                                                            roleIds: [...userFormData.roleIds, role.name]
                                                        });
                                                    } else {
                                                        setUserFormData({
                                                            ...userFormData,
                                                            roleIds: userFormData.roleIds.filter(r => r !== role.name)
                                                        });
                                                    }
                                                }}
                                                className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                            />
                                            <Label htmlFor={`role-${role.id}`} className="font-normal cursor-pointer">
                                                {role.name}
                                                {role.description && (
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        - {role.description}
                                                    </span>
                                                )}
                                            </Label>
                                        </div>
                                    ))
                                )}
                            </div>
                            {userFormData.roleIds.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    {userFormData.roleIds.length} role{userFormData.roleIds.length !== 1 ? 's' : ''} selected
                                </p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={userFormData.isActive}
                                onChange={(e) => setUserFormData({ ...userFormData, isActive: e.target.checked })}
                                className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <Label htmlFor="isActive">User is active</Label>
                        </div>

                        {!editingUser && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="sendInvite"
                                    checked={userFormData.sendInvite}
                                    onChange={(e) => setUserFormData({ ...userFormData, sendInvite: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <Label htmlFor="sendInvite">Send invitation email</Label>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsUserDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? (editingUser ? 'Updating...' : 'Creating...')
                                    : (editingUser ? 'Update User' : 'Create User')
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Deactivate User Confirmation Dialog */}
            <Dialog open={!!userToDeactivate} onOpenChange={() => setUserToDeactivate(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deactivate User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to deactivate &quot;{userToDeactivate?.displayName}&quot;?
                            They will lose access to the organization but their data will be preserved.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setUserToDeactivate(null)}
                            disabled={isDeactivating}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeactivateUser}
                            disabled={isDeactivating}
                        >
                            {isDeactivating ? 'Deactivating...' : 'Deactivate User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Confirmation Dialog */}
            <Dialog
                open={!!userToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setUserToDelete(null);
                        setDeleteConfirmText('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete User Permanently</DialogTitle>
                        <DialogDescription>
                            This action <strong>cannot be undone</strong>. This will permanently delete &quot;{userToDelete?.displayName}&quot;
                            and remove all of their data from the organization.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="deleteConfirm">
                                Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm:
                            </Label>
                            <Input
                                id="deleteConfirm"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Type DELETE"
                                className="font-mono"
                                autoComplete="off"
                            />
                        </div>
                        {deleteConfirmText && deleteConfirmText !== 'DELETE' && (
                            <p className="text-sm text-red-500">
                                Please type DELETE exactly as shown above
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setUserToDelete(null);
                                setDeleteConfirmText('');
                            }}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUser}
                            disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
