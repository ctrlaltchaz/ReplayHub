'use client';

import { PermissionGuard } from '@/components/permissions/PermissionGuard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { PERMISSIONS } from '@/lib/permissions/utils';
import type {
    ImprovementCategory,
    ImprovementPriority,
    ImprovementStatus
} from '@/types/improvement';
import {
    ArrowUpCircle,
    CheckCircle2,
    Clock,
    FileText,
    LayoutGrid,
    Lightbulb,
    List,
    Loader2,
    Plus,
    Search,
    Video
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { BoardView } from './components/BoardView';
import { useImprovements } from './hooks/useImprovements';

const categoryColors: Record<ImprovementCategory, string> = {
    stream_production: 'bg-purple-100 text-purple-800 border-purple-200',
    broadcast_technical: 'bg-blue-100 text-blue-800 border-blue-200',
    event_operations: 'bg-green-100 text-green-800 border-green-200',
    communication: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    content_quality: 'bg-pink-100 text-pink-800 border-pink-200',
    viewer_experience: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    equipment: 'bg-orange-100 text-orange-800 border-orange-200',
    process: 'bg-teal-100 text-teal-800 border-teal-200',
    social_media: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

const categoryLabels: Record<ImprovementCategory, string> = {
    stream_production: 'Stream Production',
    broadcast_technical: 'Broadcast Technical',
    event_operations: 'Event Operations',
    communication: 'Communication',
    content_quality: 'Content Quality',
    viewer_experience: 'Viewer Experience',
    equipment: 'Equipment',
    process: 'Process',
    social_media: 'Social Media',
};

const priorityColors: Record<ImprovementPriority, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
};

const statusColors: Record<ImprovementStatus, string> = {
    proposed: 'bg-gray-100 text-gray-800',
    accepted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    implemented: 'bg-green-100 text-green-800',
    dismissed: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<ImprovementStatus, string> = {
    proposed: 'Proposed',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    implemented: 'Implemented',
    dismissed: 'Dismissed',
};

export default function ImprovementsPage() {
    usePageTitle('Improvements');

    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<ImprovementCategory | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<ImprovementPriority | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<ImprovementStatus | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

    const queryParams = {
        q: searchQuery || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
        limit: 20,
    };

    const { data: improvementsData, isLoading: improvementsLoading } = useImprovements(slug, queryParams);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const improvements = improvementsData?.improvements || [];
    const totalPages = improvementsData ? Math.ceil(improvementsData.total / 20) : 1;

    // Calculate summary stats
    const summary = {
        total: improvementsData?.total || 0,
        proposed: improvements.filter(i => i.status === 'proposed').length,
        inProgress: improvements.filter(i => i.status === 'in_progress').length,
        implemented: improvements.filter(i => i.status === 'implemented').length,
        highPriority: improvements.filter(i => i.priority === 'high').length,
    };

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Lightbulb className="w-6 h-6" />
                            Improvements Tracker
                        </h1>
                        <p className="text-muted-foreground">
                            Track lessons learned and continuous improvements
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex border rounded-md">
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="rounded-r-none"
                            >
                                <List className="w-4 h-4 mr-2" />
                                List
                            </Button>
                            <Button
                                variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('board')}
                                className="rounded-l-none"
                            >
                                <LayoutGrid className="w-4 h-4 mr-2" />
                                Board
                            </Button>
                        </div>
                        <PermissionGuard required={PERMISSIONS.IMPROVEMENTS_CREATE}>
                            <Button onClick={() => router.push(`/org/${slug}/improvements/new`)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Log Improvement
                            </Button>
                        </PermissionGuard>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{summary.total}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <FileText className="w-3 h-3" />
                                Total
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-gray-600">{summary.proposed}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Lightbulb className="w-3 h-3" />
                                Proposed
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-yellow-600">{summary.inProgress}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                In Progress
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">{summary.implemented}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Implemented
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">{summary.highPriority}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <ArrowUpCircle className="w-3 h-3" />
                                High Priority
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search improvements..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10"
                        />
                    </div>
                    <Select
                        value={categoryFilter}
                        onValueChange={(value) => {
                            setCategoryFilter(value as ImprovementCategory | 'all');
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {Object.entries(categoryLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={priorityFilter}
                        onValueChange={(value) => {
                            setPriorityFilter(value as ImprovementPriority | 'all');
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[140px]">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                            setStatusFilter(value as ImprovementStatus | 'all');
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Board View */}
                {viewMode === 'board' ? (
                    improvementsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <BoardView
                            improvements={improvements}
                            orgSlug={slug}
                            categoryColors={categoryColors}
                            categoryLabels={categoryLabels}
                            priorityColors={priorityColors}
                        />
                    )
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            {improvementsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : improvements.length === 0 ? (
                                <div className="text-center py-12">
                                    <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium">No improvements found</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {searchQuery || categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                                            ? 'Try adjusting your filters'
                                            : 'Start logging improvements to track your progress'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {improvements.map((improvement) => (
                                        <div
                                            key={improvement.id}
                                            className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => router.push(`/org/${slug}/improvements/${improvement.id}`)}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-semibold text-base">{improvement.title}</h3>
                                                        <Badge className={categoryColors[improvement.category]}>
                                                            {categoryLabels[improvement.category]}
                                                        </Badge>
                                                        <Badge className={priorityColors[improvement.priority]}>
                                                            {improvement.priority}
                                                        </Badge>
                                                        <Badge className={statusColors[improvement.status]}>
                                                            {statusLabels[improvement.status]}
                                                        </Badge>
                                                        {improvement.vodUrl && (
                                                            <Badge variant="outline" className="gap-1">
                                                                <Video className="w-3 h-3" />
                                                                VOD
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {improvement.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {improvement.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        {improvement.event && (
                                                            <span>Event: {improvement.event.title}</span>
                                                        )}
                                                        {improvement.reporter && (
                                                            <span>Reported by {improvement.reporter.displayName}</span>
                                                        )}
                                                        {improvement.assignee && (
                                                            <span>Assigned to {improvement.assignee.displayName}</span>
                                                        )}
                                                        <span>{formatDate(improvement.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pagination - only show in list view */}
                {viewMode === 'list' && totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, improvementsData?.total || 0)} of {improvementsData?.total || 0} improvements
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
