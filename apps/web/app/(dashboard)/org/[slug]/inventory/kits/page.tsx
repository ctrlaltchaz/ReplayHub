'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/components/ui/use-toast';
import type { CreateInventoryKitDto } from '@/types/inventory';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Package, Plus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateInventoryKit } from '../hooks/useCreateInventoryKit';
import { useInventoryKits } from '../hooks/useInventoryKits';

export default function InventoryKitsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [kitName, setKitName] = useState('');

    const { data: kits, isLoading } = useInventoryKits(slug);
    const createKit = useCreateInventoryKit(slug);

    const handleCreateKit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!kitName.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Kit name is required',
                variant: 'destructive',
            });
            return;
        }

        try {
            const data: CreateInventoryKitDto = { name: kitName.trim() };
            await createKit.mutateAsync(data);
            toast({
                title: 'Success',
                description: 'Kit created successfully',
            });
            queryClient.invalidateQueries({ queryKey: ['inventory-kits', slug] });
            setShowCreateDialog(false);
            setKitName('');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create kit',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.push(`/org/${slug}/inventory`)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Inventory
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Equipment Kits</h1>
                            <p className="text-muted-foreground">Manage reusable equipment kits for events</p>
                        </div>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Kit
                    </Button>
                </div>

                {/* Kits Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : kits && kits.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {kits.map((kit) => (
                            <Card
                                key={kit.id}
                                className="hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => router.push(`/org/${slug}/inventory/kits/${kit.id}`)}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        {kit.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {kit._count?.items || 0} {kit._count?.items === 1 ? 'item' : 'items'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        Created {new Date(kit.createdAt).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Package className="w-16 h-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Equipment Kits</h3>
                            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                                Create kits to group equipment items together for easy management and deployment.
                            </p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Kit
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Create Kit Dialog */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleCreateKit}>
                            <DialogHeader>
                                <DialogTitle>Create Equipment Kit</DialogTitle>
                                <DialogDescription>
                                    Create a new kit to group equipment items together.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Kit Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Streaming Kit, Tournament Setup"
                                        value={kitName}
                                        onChange={(e) => setKitName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateDialog(false);
                                        setKitName('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createKit.isPending}>
                                    {createKit.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Create Kit
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
