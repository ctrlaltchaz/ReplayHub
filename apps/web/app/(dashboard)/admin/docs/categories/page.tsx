'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl } from '@/lib/api/config';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import type { CreateCategoryDto, DocCategory, UpdateCategoryDto } from '@/types/docs';
import { ArrowLeft, Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminCategoriesPage() {
    usePageTitle('Manage Platform Categories');
    const { toast } = useToast();

    const [categories, setCategories] = useState<DocCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<DocCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [createForm, setCreateForm] = useState<CreateCategoryDto>({
        name: '',
        description: '',
        slug: '',
        icon: '',
        sort_order: 0,
    });

    const [editForm, setEditForm] = useState<UpdateCategoryDto>({
        name: '',
        description: '',
        slug: '',
        icon: '',
        sort_order: 0,
        is_active: true,
    });

    const fetchCategories = async () => {
        try {
            const response = await fetch(getApiUrl('/admin/docs/categories'), {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async () => {
        if (!createForm.name.trim() || !createForm.slug.trim()) {
            toast({
                title: 'Error',
                description: 'Name and slug are required',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(getApiUrl('/admin/docs/categories'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(createForm),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create category');
            }

            toast({
                title: 'Success',
                description: 'Category created successfully',
            });

            setIsCreateOpen(false);
            setCreateForm({
                name: '',
                description: '',
                slug: '',
                icon: '',
                sort_order: 0,
            });
            fetchCategories();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create category',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedCategory) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(
                getApiUrl(`/admin/docs/categories/${selectedCategory.id}`),
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(editForm),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update category');
            }

            toast({
                title: 'Success',
                description: 'Category updated successfully',
            });

            setIsEditOpen(false);
            setSelectedCategory(null);
            fetchCategories();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update category',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(
                getApiUrl(`/admin/docs/categories/${selectedCategory.id}`),
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete category');
            }

            toast({
                title: 'Success',
                description: 'Category deleted successfully',
            });

            setIsDeleteOpen(false);
            setSelectedCategory(null);
            fetchCategories();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete category',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditDialog = (category: DocCategory) => {
        setSelectedCategory(category);
        setEditForm({
            name: category.name,
            description: category.description || '',
            slug: category.slug,
            icon: category.icon || '',
            sort_order: category.order,
            is_active: true,
        });
        setIsEditOpen(true);
    };

    const openDeleteDialog = (category: DocCategory) => {
        setSelectedCategory(category);
        setIsDeleteOpen(true);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/docs">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Platform Documentation Categories
                        </h1>
                        <p className="text-muted-foreground">
                            Manage global categories for platform documentation
                        </p>
                    </div>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Category
                </Button>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No categories yet</CardTitle>
                        <CardDescription>
                            Create your first category to start organizing platform documentation.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <Card key={category.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {category.icon && <span>{category.icon}</span>}
                                            <span>{category.name}</span>
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            {category.description || 'No description'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div>
                                        <span className="font-medium">Slug:</span> {category.slug}
                                    </div>
                                    <div>
                                        <span className="font-medium">Order:</span> {category.order}
                                    </div>
                                    <div>
                                        <span className="font-medium">Documents:</span>{' '}
                                        {category._count?.docs || 0}
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditDialog(category)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openDeleteDialog(category)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create, Edit, Delete dialogs - same as org categories page */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Category</DialogTitle>
                        <DialogDescription>
                            Add a new global category for platform documentation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-name">Name *</Label>
                            <Input
                                id="create-name"
                                value={createForm.name}
                                onChange={(e) =>
                                    setCreateForm({ ...createForm, name: e.target.value })
                                }
                                placeholder="Getting Started"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-slug">Slug *</Label>
                            <Input
                                id="create-slug"
                                value={createForm.slug}
                                onChange={(e) =>
                                    setCreateForm({ ...createForm, slug: e.target.value })
                                }
                                placeholder="getting-started"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-icon">Icon (emoji)</Label>
                            <Input
                                id="create-icon"
                                value={createForm.icon}
                                onChange={(e) =>
                                    setCreateForm({ ...createForm, icon: e.target.value })
                                }
                                placeholder="📚"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-description">Description</Label>
                            <Textarea
                                id="create-description"
                                value={createForm.description}
                                onChange={(e) =>
                                    setCreateForm({ ...createForm, description: e.target.value })
                                }
                                placeholder="Description of this category..."
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-order">Sort Order</Label>
                            <Input
                                id="create-order"
                                type="number"
                                value={createForm.sort_order}
                                onChange={(e) =>
                                    setCreateForm({
                                        ...createForm,
                                        sort_order: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>Update the category details.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-slug">Slug</Label>
                            <Input
                                id="edit-slug"
                                value={editForm.slug}
                                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-icon">Icon (emoji)</Label>
                            <Input
                                id="edit-icon"
                                value={editForm.icon}
                                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.description}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, description: e.target.value })
                                }
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-order">Sort Order</Label>
                            <Input
                                id="edit-order"
                                type="number"
                                value={editForm.sort_order}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        sort_order: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-active"
                                checked={editForm.is_active}
                                onCheckedChange={(checked) =>
                                    setEditForm({ ...editForm, is_active: checked })
                                }
                            />
                            <Label htmlFor="edit-active">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleEdit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedCategory?.name}"? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
