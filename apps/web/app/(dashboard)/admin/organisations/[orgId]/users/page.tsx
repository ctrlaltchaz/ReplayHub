'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import { ArrowLeft, Calendar, Edit, Mail, Plus, Shield, Trash2, User, UserCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface OrgUser {
    id: string;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    joinedAt: string;
    roles: Array<{
        id: string;
        name: string;
        permissions: Array<{
            id: string;
            key: string;
            group: string;
            description: string;
        }>;
    }>;
}

interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: Array<{
        id: string;
        key: string;
        group: string;
        description: string;
    }>;
}

interface Organisation {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
}

export default function OrganisationUsersPage() {
    const params = useParams();
    const { toast } = useToast();
    const orgId = params?.orgId as string;

    const [organisation, setOrganisation] = useState<Organisation | null>(null);
    const [users, setUsers] = useState<OrgUser[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create/Edit user dialog state
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

    useEffect(() => {
        fetchData();
    }, [orgId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [orgResponse, usersResponse, rolesResponse] = await Promise.all([
                apiGet<Organisation>(`/admin/organisations/${orgId}`),
                apiGet<OrgUser[]>(`/admin/organisations/${orgId}/users`),
                apiGet<Role[]>(`/admin/organisations/${orgId}/roles`)
            ]);

            setOrganisation(orgResponse);
            setUsers(usersResponse);
            setRoles(rolesResponse);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load organization data');
        } finally {
            setLoading(false);
        }
    };

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
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            roleIds: user.roles.map(role => role.id),
            isActive: user.isActive,
            sendInvite: false
        });
        setIsUserDialogOpen(true);
    };

    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organisation) return;

        try {
            setIsSubmitting(true);

            if (editingUser) {
                // Update existing user
                await apiPut(`/admin/organisations/${orgId}/users/${editingUser.id}`, {
                    firstName: userFormData.firstName,
                    lastName: userFormData.lastName,
                    roleIds: userFormData.roleIds,
                    isActive: userFormData.isActive
                });
                toast({
                    title: "User updated",
                    description: `${userFormData.firstName} ${userFormData.lastName} has been updated.`
                });
            } else {
                // Create new user
                const createUserData: any = {
                    email: userFormData.email,
                    firstName: userFormData.firstName,
                    lastName: userFormData.lastName,
                    roleIds: userFormData.roleIds,
                    isActive: userFormData.isActive
                };

                if (linkExisting && selectedGlobalUserId) {
                    createUserData.globalUserId = selectedGlobalUserId;
                }

                await apiPost(`/admin/organisations/${orgId}/users`, createUserData);
                toast({
                    title: "User created",
                    description: `${userFormData.firstName} ${userFormData.lastName} has been added to the organization.`
                });
            }

            setIsUserDialogOpen(false);
            await fetchData();
        } catch (err: any) {
            console.error('Failed to save user:', err);
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to save user",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            setIsDeleting(true);
            await apiDelete(`/admin/organisations/${orgId}/users/${userToDelete.id}`);

            toast({
                title: "User deleted",
                description: `${userToDelete.displayName} has been removed from the organization.`
            });

            setUserToDelete(null);
            await fetchData();
        } catch (err: any) {
            console.error('Failed to delete user:', err);
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to remove user",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
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
                        <h1 className="text-3xl font-bold tracking-tight">{organisation.name} - Users</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage users, roles, and permissions for this organization
                        </p>
                    </div>
                    <Button onClick={handleCreateUser}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
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
                        <button className="py-2 px-1 border-b-2 border-primary text-primary font-medium text-sm">
                            Users
                        </button>
                        <Link href={`/admin/organisations/${orgId}/roles`}>
                            <button className="py-2 px-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border font-medium text-sm">
                                Roles & Permissions
                            </button>
                        </Link>
                    </nav>
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
                            <Shield className="h-4 w-4 text-muted-foreground" />
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
                                    new Date(u.joinedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                                ).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Last 30 days</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Organization Users</CardTitle>
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
                                                {user.roles.map((role) => (
                                                    <Badge key={role.id} variant="secondary">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                                {user.roles.length === 0 && (
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
                                            {new Date(user.joinedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setUserToDelete(user)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
            </div>

            {/* Create/Edit User Dialog */}
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
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
                                    <Button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const res: any = await apiGet(`/admin/global-users?search=${encodeURIComponent(searchEmail)}`);
                                                const users = res?.users || [];
                                                setSearchResults(users.map((u: any) => ({ id: u.id, email: u.email, name: u.name })));
                                            } catch (err) {
                                                console.error('Global user search failed', err);
                                                toast({ title: 'Error', description: 'Failed to search global users', variant: 'destructive' });
                                            }
                                        }}
                                    >
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
                            <div className="space-y-2">
                                <Label htmlFor="roles">Roles</Label>
                                <Select
                                    value={userFormData.roleIds[0] || ''}
                                    onValueChange={(value) => setUserFormData({ ...userFormData, roleIds: value ? [value] : [] })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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

            {/* Delete User Confirmation Dialog */}
            <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove &quot;{userToDelete?.displayName}&quot;
                            from the organization? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setUserToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUser}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Removing...' : 'Remove User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}