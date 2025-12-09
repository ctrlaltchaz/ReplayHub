'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { BookOpen, Clock, Edit, FileText, Plus, Tag } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useGlobalDocCategories } from './hooks/useGlobalDocCategories';
import { useGlobalDocs } from './hooks/useGlobalDocs';

export default function AdminDocsPage() {
    usePageTitle('Platform Documentation');
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

    const { data: categories, isLoading: categoriesLoading } = useGlobalDocCategories();
    const { data: docs, isLoading: docsLoading } = useGlobalDocs(selectedCategory);

    const getDifficultyColor = (difficulty: string | null) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-500';
            case 'intermediate':
                return 'bg-yellow-500';
            case 'advanced':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Documentation</h1>
                    <p className="text-muted-foreground">
                        Manage global documentation visible to all organizations
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/docs/categories">
                            <Tag className="mr-2 h-4 w-4" />
                            Manage Categories
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/docs/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Doc
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Category Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    {categoriesLoading ? (
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={selectedCategory === undefined ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(undefined)}
                            >
                                All
                            </Button>
                            {categories?.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    {category.icon} {category.name}
                                </Button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{docs?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Platform-wide</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {docs?.filter((d) => d.status === 'published').length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Live documentation</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {docs?.filter((d) => d.status === 'draft').length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Work in progress</p>
                    </CardContent>
                </Card>
            </div>

            {/* Documents List */}
            <Tabs defaultValue="all">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                    <TabsTrigger value="draft">Drafts</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    {docsLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-48" />
                            ))}
                        </div>
                    ) : !docs || docs.length === 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>No documents found</CardTitle>
                                <CardDescription>
                                    Create your first platform documentation to get started.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {docs.map((doc) => (
                                <Link key={doc.id} href={`/admin/docs/${doc.id}`}>
                                    <Card className="h-full transition-colors hover:bg-accent">
                                        <CardHeader>
                                            <CardTitle className="line-clamp-2">{doc.title}</CardTitle>
                                            {doc.excerpt && (
                                                <CardDescription className="mt-2 line-clamp-2">
                                                    {doc.excerpt}
                                                </CardDescription>
                                            )}
                                            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                                                {doc.status === 'draft' && (
                                                    <Badge variant="outline">Draft</Badge>
                                                )}
                                                {doc.status === 'published' && (
                                                    <Badge variant="outline" className="bg-green-500">
                                                        Published
                                                    </Badge>
                                                )}
                                                {doc.difficulty && (
                                                    <Badge
                                                        variant="outline"
                                                        className={getDifficultyColor(doc.difficulty)}
                                                    >
                                                        {doc.difficulty}
                                                    </Badge>
                                                )}
                                                {doc.estimatedReadTime && (
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{doc.estimatedReadTime} min</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="published" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {docs?.filter((doc) => doc.status === 'published')
                            .map((doc) => (
                                <Link key={doc.id} href={`/admin/docs/${doc.id}`}>
                                    <Card className="h-full transition-colors hover:bg-accent">
                                        <CardHeader>
                                            <CardTitle className="line-clamp-2">{doc.title}</CardTitle>
                                            {doc.excerpt && (
                                                <CardDescription className="mt-2 line-clamp-2">
                                                    {doc.excerpt}
                                                </CardDescription>
                                            )}
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                    </div>
                </TabsContent>

                <TabsContent value="draft" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {docs?.filter((doc) => doc.status === 'draft')
                            .map((doc) => (
                                <Link key={doc.id} href={`/admin/docs/${doc.id}`}>
                                    <Card className="h-full transition-colors hover:bg-accent">
                                        <CardHeader>
                                            <CardTitle className="line-clamp-2">{doc.title}</CardTitle>
                                            {doc.excerpt && (
                                                <CardDescription className="mt-2 line-clamp-2">
                                                    {doc.excerpt}
                                                </CardDescription>
                                            )}
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
