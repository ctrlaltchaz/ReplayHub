'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiPost } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface Organisation {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
}

interface OrganisationsClientProps {
    initialOrganisations: Organisation[];
    initialTotal: number;
}

export default function OrganisationsClient({ initialOrganisations, initialTotal }: OrganisationsClientProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        ownerEmail: '',
        description: ''
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await apiPost('/admin/organisations', formData);

            // Refresh the list
            window.location.reload();
        } catch (error) {
            console.error('Error creating organisation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = (orgId: string) => {
        router.push(`/admin/organisations/${orgId}`);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
                        <p className="text-muted-foreground">
                            Manage all organizations in the system ({initialTotal} total)
                        </p>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Create Organization</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create Organization</DialogTitle>
                                <DialogDescription>
                                    Create a new organization with an owner
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4">
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
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        pattern="[a-z0-9-]+"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ownerEmail">Owner Email</Label>
                                    <Input
                                        id="ownerEmail"
                                        type="email"
                                        value={formData.ownerEmail}
                                        onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? 'Creating...' : 'Create'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Organizations</CardTitle>
                        <CardDescription>
                            Complete list of organizations in the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialOrganisations.map((org) => (
                                    <TableRow key={org.id}>
                                        <TableCell className="font-medium">{org.name}</TableCell>
                                        <TableCell>
                                            <code className="text-sm bg-muted px-2 py-1 rounded">
                                                {org.slug}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(org.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetails(org.id)}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}