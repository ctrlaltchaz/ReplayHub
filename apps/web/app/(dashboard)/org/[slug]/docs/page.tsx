'use client';

import { PermissionGuard } from '@/components/permissions/PermissionGuard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileTabNavigation } from '@/components/ui/mobile-tab-navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getServerUrl } from '@/lib/api/config';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { BookOpen, Clock, FileText, Plus, Tag } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useDocCategories } from './hooks/useDocCategories';
import { useDocs } from './hooks/useDocs';

export default function DocsPage() {
    usePageTitle('Documentation');
    const params = useParams();
    const slug = params?.slug as string;
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
    const [activeTab, setActiveTab] = useState<'all' | 'global' | 'org'>('all');

    const { data: categories, isLoading: categoriesLoading } = useDocCategories(slug);
    const { data: docs, isLoading: docsLoading } = useDocs(slug, selectedCategory);

    const globalDocs = docs?.filter((doc) => (doc as any).organisation_id === null) || [];
    const orgDocs = docs?.filter((doc) => (doc as any).organisation_id !== null) || [];

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
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <BookOpen className="w-6 h-6" />
                            Documentation
                        </h1>
                        <p className="text-muted-foreground">
                            Browse tutorials, guides, and reference materials
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" asChild className="w-full sm:w-auto">
                            <Link href={`/org/${slug}/docs/completions`}>
                                My Progress
                            </Link>
                        </Button>
                        <PermissionGuard required="docs.manage">
                            <Button variant="outline" asChild className="w-full sm:w-auto">
                                <Link href={`/org/${slug}/docs/categories`}>
                                    Manage Categories
                                </Link>
                            </Button>
                        </PermissionGuard>
                        <PermissionGuard required="docs.create">
                            <Link href={`/org/${slug}/docs/new`} className="w-full sm:w-auto">
                                <Button className="w-full sm:w-auto">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Doc
                                </Button>
                            </Link>
                        </PermissionGuard>
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
                                    {category.icon && <span className="mr-2">{category.icon}</span>}
                                    {category.name}
                                    {category._count?.docs !== undefined && (
                                        <Badge variant="secondary" className="ml-2">
                                            {category._count.docs}
                                        </Badge>
                                    )}
                                </Button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'global' | 'org')} className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Mobile Tab Navigation */}
                    <div className="md:hidden">
                        <MobileTabNavigation
                            tabs={[
                                { value: "all", label: "All Docs", icon: <BookOpen className="h-4 w-4" /> },
                                { value: "global", label: "Platform", icon: <FileText className="h-4 w-4" /> },
                                { value: "org", label: "Organization", icon: <Tag className="h-4 w-4" /> },
                            ]}
                            activeTab={activeTab}
                            onTabChange={(v) => setActiveTab(v as 'all' | 'global' | 'org')}
                            title="Documentation"
                            description="Browse all documentation"
                        />
                    </div>

                    {/* Desktop Tab List */}
                    <TabsList className="hidden md:inline-flex">
                        <TabsTrigger value="all" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            All Docs
                        </TabsTrigger>
                        <TabsTrigger value="global" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Platform Docs
                        </TabsTrigger>
                        <TabsTrigger value="org" className="gap-2">
                            <Tag className="h-4 w-4" />
                            Organization Docs
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all" className="space-y-4">
                    {docsLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    ) : docs && docs.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {docs.map((doc) => (
                                <Link key={doc.id} href={`/org/${slug}/docs/${doc.id}`}>
                                    <Card className="h-full transition-colors hover:bg-accent">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="line-clamp-2">{doc.title}</CardTitle>
                                                    {doc.excerpt && (
                                                        <CardDescription className="mt-2 line-clamp-2">
                                                            {doc.excerpt}
                                                        </CardDescription>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                {doc.status && (
                                                    <Badge
                                                        variant={doc.status === 'published' ? 'default' : 'outline'}
                                                        className={doc.status === 'draft' ? 'border-yellow-500 text-yellow-500' : ''}
                                                    >
                                                        {doc.status}
                                                    </Badge>
                                                )}
                                                {doc.difficulty && (
                                                    <Badge variant="outline" className={getDifficultyColor(doc.difficulty)}>
                                                        {doc.difficulty}
                                                    </Badge>
                                                )}
                                                {doc.estimatedReadTime && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{doc.estimatedReadTime} min</span>
                                                    </div>
                                                )}
                                                {doc.category && (
                                                    <Badge variant="secondary">
                                                        {doc.category.icon} {doc.category.name}
                                                    </Badge>
                                                )}
                                                {doc.organisationId === null && (
                                                    <Badge variant="outline" className="border-blue-500 text-blue-500">
                                                        Platform
                                                    </Badge>
                                                )}
                                            </div>
                                            {doc.tags && doc.tags.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {doc.tags.slice(0, 3).map((tag) => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            <Tag className="mr-1 h-2 w-2" />
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            {(doc as any).author && (
                                                <div className="mt-3 flex items-center gap-2 pt-3 border-t text-xs text-muted-foreground">
                                                    {(doc as any).author.avatar ? (
                                                        <img 
                                                            src={`${getServerUrl()}${(doc as any).author.avatar}`} 
                                                            alt={(doc as any).author.name || 'Author'}
                                                            className="h-5 w-5 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                                                            {(doc as any).author.name?.[0] || (doc as any).author.email?.[0]?.toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                    <span className="truncate">{(doc as any).author.name || (doc as any).author.email || 'Unknown'}</span>
                                                </div>
                                            )}
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <CardTitle>No documentation yet</CardTitle>
                                    <CardDescription className="mt-2">
                                        {selectedCategory
                                            ? 'No docs in this category. Try selecting a different category.'
                                            : 'Get started by creating your first doc.'}
                                    </CardDescription>
                                    <PermissionGuard required="docs.create">
                                        <Link href={`/org/${slug}/docs/new`}>
                                            <Button className="mt-4">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Doc
                                            </Button>
                                        </Link>
                                    </PermissionGuard>
                                </div>
                            </CardHeader>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="global" className="space-y-4">
                    {docsLoading ? (
                        <Skeleton className="h-48" />
                    ) : globalDocs.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {globalDocs.map((doc) => (
                                <Link key={doc.id} href={`/org/${slug}/docs/${doc.id}`}>
                                    <Card className="h-full transition-colors hover:bg-accent">
                                        <CardHeader>
                                            <CardTitle className="line-clamp-2">{doc.title}</CardTitle>
                                            {doc.excerpt && (
                                                <CardDescription className="mt-2 line-clamp-2">
                                                    {doc.excerpt}
                                                </CardDescription>
                                            )}
                                            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                {doc.difficulty && (
                                                    <Badge variant="outline">{doc.difficulty}</Badge>
                                                )}
                                                {doc.estimatedReadTime && (
                                                    <div className="flex items-center gap-1">
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
                    ) : (
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <CardTitle>No platform documentation</CardTitle>
                                    <CardDescription className="mt-2">
                                        Platform-wide documentation will appear here when available.
                                    </CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="org" className="space-y-4">
                    {docsLoading ? (
                        <Skeleton className="h-48" />
                    ) : orgDocs.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {orgDocs.map((doc) => (
                                <Link key={doc.id} href={`/org/${slug}/docs/${doc.id}`}>
                                    <Card className="h-full transition-colors hover:bg-accent">
                                        <CardHeader>
                                            <CardTitle className="line-clamp-2">{doc.title}</CardTitle>
                                            {doc.excerpt && (
                                                <CardDescription className="mt-2 line-clamp-2">
                                                    {doc.excerpt}
                                                </CardDescription>
                                            )}
                                            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                {doc.difficulty && (
                                                    <Badge variant="outline">{doc.difficulty}</Badge>
                                                )}
                                                {doc.estimatedReadTime && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{doc.estimatedReadTime} min</span>
                                                    </div>
                                                )}
                                                {doc.status !== 'published' && <Badge variant="outline">Draft</Badge>}
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <CardTitle>No organization documentation</CardTitle>
                                    <CardDescription className="mt-2">
                                        Create custom documentation for your organization.
                                    </CardDescription>
                                    <PermissionGuard required="docs.create">
                                        <Link href={`/org/${slug}/docs/new`}>
                                            <Button className="mt-4">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Doc
                                            </Button>
                        </Link>
                    </PermissionGuard>
                                </div>
                            </CardHeader>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
            </div>
        </div>
    );
}
