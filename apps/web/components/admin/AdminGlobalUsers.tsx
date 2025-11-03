'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { useToast } from '@/hooks/use-toast';
import { apiDelete, apiPatch, apiPost } from '@/lib/api/client';
import { useApiQuery } from '@/lib/api/query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Key, Loader2, Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface GlobalUser {
    id: string;
    name: string;
    email: string;
    lastLoginAt?: string;
    createdAt: string;
}

interface GlobalUsersResponse {
    users: GlobalUser[];
    total: number;
    page: number;
    totalPages: number;
}

export function AdminGlobalUsers() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editingUser, setEditingUser] = useState<GlobalUser | null>(null);
    const [resetPasswordUser, setResetPasswordUser] = useState<GlobalUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<GlobalUser | null>(null);

    const { data: response, isLoading } = useApiQuery<GlobalUsersResponse>('/admin/global-users', {
        staleTime: 30 * 1000,
    });

    // Extract users array from response
    const users = response?.users || [];

    const updateUserMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: { name: string; email: string } }) =>
            apiPatch(`/admin/global-users/${id}`, data),
        onSuccess: () => {
            toast({
                title: 'User updated',
                description: 'The user has been successfully updated.',
            });
            queryClient.invalidateQueries({ queryKey: ['/admin/global-users'] });
            setEditingUser(null);
        },
        onError: () => {
            toast({
                title: 'Update failed',
                description: 'Failed to update the user. Please try again.',
                variant: 'destructive',
            });
        },
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async (id: string) =>
            apiPost(`/admin/global-users/${id}/reset-password`, {}),
        onSuccess: () => {
            toast({
                title: 'Password reset',
                description: 'A password reset email has been sent to the user.',
            });
            setResetPasswordUser(null);
        },
        onError: () => {
            toast({
                title: 'Reset failed',
                description: 'Failed to reset password. Please try again.',
                variant: 'destructive',
            });
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: string) =>
            apiDelete(`/admin/global-users/${id}`),
        onSuccess: () => {
            toast({
                title: 'User deleted',
                description: 'The user has been permanently deleted.',
            });
            queryClient.invalidateQueries({ queryKey: ['/admin/global-users'] });
            setDeletingUser(null);
        },
        onError: () => {
            toast({
                title: 'Delete failed',
                description: 'Failed to delete the user. Please try again.',
                variant: 'destructive',
            });
        },
    });

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingUser) return;

        const formData = new FormData(e.currentTarget);
        updateUserMutation.mutate({
            id: editingUser.id,
            data: {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {user.lastLoginAt ? (
                                            new Date(user.lastLoginAt).toLocaleDateString()
                                        ) : (
                                            <Badge variant="secondary">Never</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingUser(user)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setResetPasswordUser(user)}
                                            >
                                                <Key className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeletingUser(user)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit User Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user details. Changes will be saved immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={editingUser?.name}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={editingUser?.email}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateUserMutation.isPending}>
                                {updateUserMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog
                open={!!resetPasswordUser}
                onOpenChange={(open) => !open && setResetPasswordUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reset the password for {resetPasswordUser?.name}?
                            A password reset email will be sent to {resetPasswordUser?.email}.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setResetPasswordUser(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => resetPasswordUser && resetPasswordMutation.mutate(resetPasswordUser.id)}
                            disabled={resetPasswordMutation.isPending}
                        >
                            {resetPasswordMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Reset Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog
                open={!!deletingUser}
                onOpenChange={(open) => !open && setDeletingUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete {deletingUser?.name}? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeletingUser(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingUser && deleteUserMutation.mutate(deletingUser.id)}
                            disabled={deleteUserMutation.isPending}
                        >
                            {deleteUserMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
