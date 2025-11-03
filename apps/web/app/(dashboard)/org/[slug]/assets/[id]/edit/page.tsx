'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import type { AssetStatus } from '@/types/asset';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TagInput } from '../../components/TagInput';
import { useAsset } from '../../hooks/useAsset';
import { useAssetTags } from '../../hooks/useAssetTags';
import { useUpdateAsset } from '../../hooks/useUpdateAsset';

export default function EditAssetPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const slug = params?.slug as string;
    const assetId = params?.id as string;

    const { data: asset, isLoading } = useAsset(slug, assetId);
    const updateAsset = useUpdateAsset(slug);
    const { data: tagsResponse } = useAssetTags(slug);

    const [name, setName] = useState('');
    const [status, setStatus] = useState<AssetStatus>('active');
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        if (asset) {
            setName(asset.name);
            setStatus(asset.status);
            // Handle tags as either string or array
            if (Array.isArray(asset.tags)) {
                setTags(asset.tags);
            } else if (typeof asset.tags === 'string') {
                setTags(asset.tags.split(',').map((t) => t.trim()).filter(Boolean));
            } else {
                setTags([]);
            }
        }
    }, [asset]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateAsset.mutateAsync({
                assetId,
                data: {
                    name,
                    status,
                    tags: tags.length > 0 ? tags : undefined,
                },
            });

            toast({
                title: 'Asset Updated',
                description: 'The asset has been updated successfully.',
            });

            router.push(`/org/${slug}/assets/${assetId}`);
        } catch (error: any) {
            toast({
                title: 'Update Failed',
                description: error.message || 'Failed to update asset',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <h3 className="text-lg font-semibold mb-2">Asset Not Found</h3>
                        <Button onClick={() => router.push(`/org/${slug}/assets`)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Assets
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/org/${slug}/assets/${assetId}`)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Asset</h1>
                        <p className="text-sm text-muted-foreground">Update asset details and metadata</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Asset Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter asset name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={status} onValueChange={(value) => setStatus(value as AssetStatus)}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags</Label>
                                <TagInput
                                    value={tags}
                                    onChange={setTags}
                                    suggestions={tagsResponse?.tags.map((t) => t.tag) || []}
                                    placeholder="Add tags..."
                                />
                                <p className="text-xs text-muted-foreground">
                                    Click to add existing tags or create new ones
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(`/org/${slug}/assets/${assetId}`)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updateAsset.isPending}>
                                    {updateAsset.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
