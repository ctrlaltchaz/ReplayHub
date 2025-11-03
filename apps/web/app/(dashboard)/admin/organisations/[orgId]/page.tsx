'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useImpersonate } from '@/hooks/admin/global';
import { apiDelete, apiGet, apiPut } from '@/lib/api/client';
import { ArrowLeft, Calendar, Settings, Trash2, UserCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface OrganisationDetails {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    owner: {
        id: string;
        email: string;
    };
    admins: Array<{
        globalUser: {
            id: string;
            email: string;
        };
    }>;
}

export default function OrganisationDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params?.orgId as string;
    const [organisation, setOrganisation] = useState<OrganisationDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Management dialog state
    const [isManageOpen, setIsManageOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });

    // Delete dialog state
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Impersonation dialog state
    const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);
    const [impersonationReason, setImpersonationReason] = useState('');
    const impersonate = useImpersonate();

    useEffect(() => {
        const fetchOrganisation = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiGet<OrganisationDetails>(`/admin/organisations/${orgId}`);
                setOrganisation(response);

                // Initialize form data
                setFormData({
                    name: response.name || '',
                    description: (response as any).description || '',
                    isActive: (response as any).isActive ?? true
                });
            } catch (err) {
                console.error('Failed to fetch organisation:', err);
                setError('Failed to load organisation details');
            } finally {
                setLoading(false);
            }
        };

        if (orgId) {
            fetchOrganisation();
        }
    }, [orgId]);

    const handleManageClick = () => {
        if (organisation) {
            setFormData({
                name: organisation.name || '',
                description: (organisation as any).description || '',
                isActive: (organisation as any).isActive ?? true
            });
            setIsManageOpen(true);
        }
    };

    const handleUpdateOrganisation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organisation) return;

        try {
            setIsUpdating(true);
            await apiPut(`/admin/organisations/${orgId}`, formData);

            // Refresh the organisation data
            const response = await apiGet<OrganisationDetails>(`/admin/organisations/${orgId}`);
            setOrganisation(response);

            setIsManageOpen(false);
        } catch (err) {
            console.error('Failed to update organisation:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteOpen(true);
    };

    const handleDeleteOrganisation = async () => {
        if (!organisation) return;

        try {
            setIsDeleting(true);
            await apiDelete(`/admin/organisations/${orgId}`);

            // Navigate back to organisations list
            router.push('/admin/organisations');
        } catch (err) {
            console.error('Failed to delete organisation:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleImpersonateClick = () => {
        setIsImpersonateOpen(true);
        setImpersonationReason('');
    };

    const handleImpersonate = async () => {
        if (!organisation) return;

        try {
            await impersonate.mutateAsync({
                orgId: organisation.id,
                reason: impersonationReason || 'Administrative access required'
            });

            // Redirect to organization dashboard
            window.location.href = `/org/${organisation.slug}/dashboard`;
        } catch (err) {
            console.error('Failed to start impersonation:', err);
        } finally {
            setIsImpersonateOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/organisations">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Organizations
                            </Button>
                        </Link>
                    </div>
                    <div className="animate-pulse">
                        <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 bg-muted rounded w-3/4"></div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 bg-muted rounded w-3/4"></div>
                                </CardContent>
                            </Card>
                        </div>
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
                        <Link href="/admin/organisations">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Organizations
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
                                    The organisation you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
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
                    <Link href="/admin/organisations">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Organizations
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{organisation.name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">
                                <code>{organisation.slug}</code>
                            </Badge>
                            <Badge variant="outline">
                                ID: {organisation.id}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleManageClick}>
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                        </Button>
                        <Button variant="secondary" onClick={handleImpersonateClick}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Impersonate
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteClick}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Management Tabs */}
                <div className="border-b">
                    <nav className="flex space-x-8">
                        <button
                            className="py-2 px-1 border-b-2 border-primary text-primary font-medium text-sm"
                        >
                            Overview
                        </button>
                        <Link href={`/admin/organisations/${orgId}/users`}>
                            <button className="py-2 px-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border font-medium text-sm">
                                Users
                            </button>
                        </Link>
                        <Link href={`/admin/organisations/${orgId}/roles`}>
                            <button className="py-2 px-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border font-medium text-sm">
                                Roles & Permissions
                            </button>
                        </Link>
                    </nav>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">
                                Active organization members
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{organisation.admins.length + 1}</div>
                            <p className="text-xs text-muted-foreground">
                                Organization admins (including owner)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Created</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Date(organisation.createdAt).toLocaleDateString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {new Date(organisation.createdAt).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Organization Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Name</label>
                                <p className="text-sm mt-1">{organisation.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Slug</label>
                                <p className="text-sm mt-1">
                                    <code className="bg-muted px-2 py-1 rounded text-sm">
                                        {organisation.slug}
                                    </code>
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                                <p className="text-sm mt-1">
                                    {new Date(organisation.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                <p className="text-sm mt-1">
                                    {new Date(organisation.updatedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Owner</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="text-sm mt-1">{organisation.owner.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                                    <p className="text-sm mt-1">
                                        <code className="bg-muted px-2 py-1 rounded text-xs">
                                            {organisation.owner.id}
                                        </code>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Administrators</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {organisation.admins.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No additional administrators</p>
                                ) : (
                                    organisation.admins.map((admin, index) => (
                                        <div key={admin.globalUser.id} className="space-y-1">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    Admin {index + 1}
                                                </label>
                                                <p className="text-sm mt-1">{admin.globalUser.email}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Management Dialog */}
            <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Manage Organization</DialogTitle>
                        <DialogDescription>
                            Update the organization&apos;s details and settings.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateOrganisation} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter organization description..."
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <Label htmlFor="isActive">Organization is active</Label>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsManageOpen(false)}
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? 'Updating...' : 'Update Organization'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Organization</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{organisation?.name}&quot;? This action cannot be undone.
                            All data associated with this organization will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteOrganisation}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Organization'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Impersonate Dialog */}
            <Dialog open={isImpersonateOpen} onOpenChange={setIsImpersonateOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Impersonate Organization</DialogTitle>
                        <DialogDescription>
                            You will be logged into &quot;{organisation?.name}&quot; as an administrator. This action will be logged for audit purposes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reason" className="text-right">
                                Reason
                            </Label>
                            <Textarea
                                id="reason"
                                value={impersonationReason}
                                onChange={(e) => setImpersonationReason(e.target.value)}
                                placeholder="Optional: Why are you accessing this organization?"
                                className="col-span-3"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsImpersonateOpen(false)}
                            disabled={impersonate.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleImpersonate}
                            disabled={impersonate.isPending}
                        >
                            {impersonate.isPending ? 'Starting...' : 'Start Impersonation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}