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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiPatch, apiPost } from '@/lib/api/client';
import { useApiQuery } from '@/lib/api/query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Loader2, Pencil, UserCog } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface Organisation {
    id: string;
    name: string;
    slug: string;
    status: 'active' | 'inactive' | 'suspended';
    userCount: number;
    createdAt: string;
}

interface OrgUser {
    id: string;
    name: string;
    email: string;
}

interface OrganisationsResponse {
    organisations: Organisation[];
    total: number;
    page: number;
    totalPages: number;
}

export function AdminOrganisations() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editingOrg, setEditingOrg] = useState<Organisation | null>(null);
    const [impersonateOrg, setImpersonateOrg] = useState<Organisation | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    const { data: response, isLoading } = useApiQuery<OrganisationsResponse>('/admin/organisations', {
        staleTime: 30 * 1000,
    });

    // Extract organisations array from response
    const orgList = response?.organisations || [];

    const { data: orgUsers } = useApiQuery<OrgUser[]>(
        impersonateOrg ? `/admin/organisations/${impersonateOrg.id}/users` : '',
        {
            enabled: !!impersonateOrg,
        }
    );

    const updateOrgMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: { name: string; status: string } }) =>
            apiPatch(`/admin/organisations/${id}`, data),
        onSuccess: () => {
            toast({
                title: 'Organization updated',
                description: 'The organization has been successfully updated.',
            });
            queryClient.invalidateQueries({ queryKey: ['/admin/organisations'] });
            setEditingOrg(null);
        },
        onError: () => {
            toast({
                title: 'Update failed',
                description: 'Failed to update the organization. Please try again.',
                variant: 'destructive',
            });
        },
    });

    const impersonateMutation = useMutation({
        mutationFn: async (data: { organisationId: string; userId: string }) =>
            apiPost<{ organisationSlug: string }>('/admin/impersonate', data),
        onSuccess: (data) => {
            toast({
                title: 'Impersonation started',
                description: 'Redirecting to organization...',
            });
            router.push(`/org/${data.organisationSlug}/overview`);
        },
        onError: () => {
            toast({
                title: 'Impersonation failed',
                description: 'Failed to start impersonation. Please try again.',
                variant: 'destructive',
            });
        },
    });

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingOrg) return;

        const formData = new FormData(e.currentTarget);
        updateOrgMutation.mutate({
            id: editingOrg.id,
            data: {
                name: formData.get('name') as string,
                status: formData.get('status') as string,
            },
        });
    };

    const handleImpersonate = () => {
        if (!impersonateOrg || !selectedUserId) return;

        impersonateMutation.mutate({
            organisationId: impersonateOrg.id,
            userId: selectedUserId,
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
                            <TableHead>Slug</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead>Status</TableHead>
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
                        ) : orgList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No organizations found
                                </TableCell>
                            </TableRow>
                        ) : (
                            orgList.map((org) => (
                                <TableRow key={org.id}>
                                    <TableCell className="font-medium">{org.name}</TableCell>
                                    <TableCell className="font-mono text-sm">{org.slug}</TableCell>
                                    <TableCell>{org.userCount}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                org.status === 'active'
                                                    ? 'default'
                                                    : org.status === 'inactive'
                                                        ? 'secondary'
                                                        : 'destructive'
                                            }
                                        >
                                            {org.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/org/${org.slug}/overview`)}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingOrg(org)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setImpersonateOrg(org);
                                                    setSelectedUserId('');
                                                }}
                                            >
                                                <UserCog className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Organization Dialog */}
            <Dialog open={!!editingOrg} onOpenChange={(open) => !open && setEditingOrg(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Organization</DialogTitle>
                        <DialogDescription>
                            Update organization details. Changes will be saved immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={editingOrg?.name}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" defaultValue={editingOrg?.status}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingOrg(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateOrgMutation.isPending}>
                                {updateOrgMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Impersonate Dialog */}
            <Dialog
                open={!!impersonateOrg}
                onOpenChange={(open) => !open && setImpersonateOrg(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Impersonate User</DialogTitle>
                        <DialogDescription>
                            Select a user to impersonate in {impersonateOrg?.name}. You will be
                            redirected to the organization dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="user">User</Label>
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a user..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {orgUsers?.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setImpersonateOrg(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImpersonate}
                            disabled={!selectedUserId || impersonateMutation.isPending}
                        >
                            {impersonateMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Start Impersonation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

