'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiDelete, apiPost, apiPut } from '@/lib/api/client';
import { Clock, Eye, Mail, Shield, Trash2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface GlobalUser {
    id: string;
    email: string;
    name?: string;
    isGlobalAdmin: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

interface GlobalUsersClientProps {
    initialUsers: GlobalUser[];
    initialTotal: number;
}

export default function GlobalUsersClient({ initialUsers, initialTotal }: GlobalUsersClientProps) {
    const router = useRouter();
    const [users, setUsers] = useState(initialUsers);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<GlobalUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        isGlobalAdmin: false,
        sendInvite: true
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                email: formData.email,
                name: formData.name,
                password: formData.password,
                isSuperAdmin: formData.isGlobalAdmin // Map to the correct API field
            };
            const newUser = await apiPost<GlobalUser>('/admin/global-users', payload);
            setUsers([...users, newUser]);
            setIsCreateOpen(false);
            setFormData({
                email: '',
                name: '',
                password: '',
                isGlobalAdmin: false,
                sendInvite: true
            });
        } catch (error) {
            console.error('Error creating global user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;

        setIsLoading(true);
        try {
            await apiDelete(`/admin/global-users/${selectedUser.id}`);
            setUsers(users.filter(u => u.id !== selectedUser.id));
            setIsDeleteOpen(false);
            setSelectedUser(null);
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleAdmin = async (user: GlobalUser) => {
        setIsLoading(true);
        try {
            const updatedUser = await apiPut<GlobalUser>(`/admin/global-users/${user.id}`, {
                isGlobalAdmin: !user.isGlobalAdmin
            });
            setUsers(users.map(u => u.id === user.id ? updatedUser : u));
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = (userId: string) => {
        router.push(`/admin/global-users/${userId}`);
    };

    const formatLastLogin = (lastLoginAt?: string) => {
        if (!lastLoginAt) return 'Never';
        return new Date(lastLoginAt).toLocaleDateString();
    };

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-montserrat">Global Users</h1>
                        <p className="text-muted-foreground font-montserrat">
                            Manage global administrator accounts ({initialTotal} total)
                        </p>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="font-montserrat font-semibold">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create Global User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle className="font-montserrat font-bold">Create Global User</DialogTitle>
                                <DialogDescription className="font-montserrat">
                                    Add a new global administrator to the platform
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-montserrat font-medium">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="font-montserrat"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="font-montserrat font-medium">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="font-montserrat"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="font-montserrat font-medium">Initial Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="font-montserrat"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isGlobalAdmin"
                                        checked={formData.isGlobalAdmin}
                                        onChange={(e) => setFormData({ ...formData, isGlobalAdmin: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="isGlobalAdmin" className="font-montserrat font-medium">
                                        Grant Global Admin Privileges
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="sendInvite"
                                        checked={formData.sendInvite}
                                        onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="sendInvite" className="font-montserrat font-medium">
                                        Send invitation email
                                    </Label>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isLoading} className="font-montserrat font-semibold">
                                        {isLoading ? 'Creating...' : 'Create User'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium font-montserrat">Total Users</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-montserrat">{users.length}</div>
                            <p className="text-xs text-muted-foreground font-montserrat">
                                Global administrators
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium font-montserrat">Active Users</CardTitle>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-montserrat">
                                {users.filter(u => u.isActive).length}
                            </div>
                            <p className="text-xs text-muted-foreground font-montserrat">
                                Currently active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium font-montserrat">Super Admins</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-montserrat">
                                {users.filter(u => u.isGlobalAdmin).length}
                            </div>
                            <p className="text-xs text-muted-foreground font-montserrat">
                                With admin privileges
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-montserrat font-bold">All Global Users</CardTitle>
                        <CardDescription className="font-montserrat">
                            Complete list of global administrators and platform users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-montserrat font-semibold">User</TableHead>
                                    <TableHead className="font-montserrat font-semibold">Status</TableHead>
                                    <TableHead className="font-montserrat font-semibold">Role</TableHead>
                                    <TableHead className="font-montserrat font-semibold">Last Login</TableHead>
                                    <TableHead className="font-montserrat font-semibold">Created</TableHead>
                                    <TableHead className="font-montserrat font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Mail className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-medium font-montserrat">
                                                        {user.name || user.email}
                                                    </div>
                                                    {user.name && (
                                                        <div className="text-sm text-muted-foreground font-montserrat">
                                                            {user.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.isActive ? "default" : "secondary"} className="font-montserrat">
                                                {user.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={user.isGlobalAdmin ? "default" : "outline"}
                                                    className="font-montserrat"
                                                >
                                                    {user.isGlobalAdmin ? (
                                                        <>
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            Super Admin
                                                        </>
                                                    ) : (
                                                        "User"
                                                    )}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-montserrat">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                {formatLastLogin(user.lastLoginAt)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-montserrat">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(user.id)}
                                                    className="font-montserrat"
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleAdmin(user)}
                                                    disabled={isLoading}
                                                    className="font-montserrat"
                                                >
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    {user.isGlobalAdmin ? "Remove Admin" : "Make Admin"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsDeleteOpen(true);
                                                    }}
                                                    className="text-destructive hover:text-destructive font-montserrat"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-montserrat font-bold">Delete Global User</DialogTitle>
                        <DialogDescription className="font-montserrat">
                            Are you sure you want to delete {selectedUser?.name || selectedUser?.email}?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            className="font-montserrat"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="font-montserrat font-semibold"
                        >
                            {isLoading ? 'Deleting...' : 'Delete User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}