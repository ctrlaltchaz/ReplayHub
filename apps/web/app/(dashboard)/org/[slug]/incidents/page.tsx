'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import type { Incident, IncidentCategory, IncidentSeverity, IncidentStatus } from '@/types/incident';
import {
    AlertTriangle,
    BarChart3,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Edit,
    FileText,
    Loader2,
    Plus,
    Search,
    Shield,
    TrendingUp,
    User,
    XCircle
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { IncidentDialog } from './components/IncidentDialog';
import { useExportIncidents } from './hooks/useExportIncidents';
import { useIncidents } from './hooks/useIncidents';
import { useIncidentSummary } from './hooks/useIncidentSummary';

const categoryColors = {
    tech: 'bg-blue-100 text-blue-800 border-blue-200',
    comms: 'bg-purple-100 text-purple-800 border-purple-200',
    people: 'bg-green-100 text-green-800 border-green-200',
    safety: 'bg-red-100 text-red-800 border-red-200',
    other: 'bg-gray-100 text-gray-800 border-gray-200',
};

const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
};

const statusColors = {
    open: 'bg-red-100 text-red-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    dismissed: 'bg-gray-100 text-gray-800',
};

export default function IncidentsPage() {
    usePageTitle('Incidents');

    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const slug = params?.slug as string;

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<IncidentCategory | 'all'>('all');
    const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<Incident | undefined>(undefined);

    const queryParams = {
        q: searchQuery || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
        limit: 20,
    };

    const { data: summary, isLoading: summaryLoading } = useIncidentSummary(slug);
    const { data: incidentsData, isLoading: incidentsLoading } = useIncidents(slug, queryParams);
    const exportMutation = useExportIncidents(slug);

    const handleExport = () => {
        exportMutation.mutate({
            q: searchQuery || undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            severity: severityFilter !== 'all' ? severityFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getSeverityIcon = (severity: IncidentSeverity) => {
        switch (severity) {
            case 'critical':
                return <AlertTriangle className="w-4 h-4" />;
            case 'high':
                return <TrendingUp className="w-4 h-4" />;
            case 'medium':
                return <Shield className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6" />
                            Incident Management
                        </h1>
                        <p className="text-muted-foreground">Track and manage operational incidents</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/org/${slug}/incidents/reports`)}
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Reports
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            disabled={exportMutation.isPending}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {exportMutation.isPending ? 'Exporting...' : 'Export CSV'}
                        </Button>
                        <Button onClick={() => router.push(`/org/${slug}/incidents/new`)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Report Incident
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                {summaryLoading ? (
                    <div className="grid gap-4 md:grid-cols-5">
                        {[...Array(5)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : summary ? (
                    <div className="grid gap-4 md:grid-cols-5">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{summary.total}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <FileText className="w-3 h-3" />
                                    Total Incidents
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-red-600">{summary.open}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <XCircle className="w-3 h-3" />
                                    Open
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
                                <div className="text-2xl font-bold text-green-600">{summary.resolved}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Resolved
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-red-600">{summary.critical}</div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Critical
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                ) : null}

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search incidents..."
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
                            setCategoryFilter(value as IncidentCategory | 'all');
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[160px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="tech">Tech</SelectItem>
                            <SelectItem value="comms">Comms</SelectItem>
                            <SelectItem value="people">People</SelectItem>
                            <SelectItem value="safety">Safety</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={severityFilter}
                        onValueChange={(value) => {
                            setSeverityFilter(value as IncidentSeverity | 'all');
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[160px]">
                            <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Severities</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                            setStatusFilter(value as IncidentStatus | 'all');
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[160px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Incidents List */}
                {incidentsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : incidentsData && incidentsData.incidents.length > 0 ? (
                    <div className="space-y-4">
                        {incidentsData.incidents.map((incident) => (
                            <Card
                                key={incident.id}
                                className="hover:shadow-md transition-shadow"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <div
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => router.push(`/org/${slug}/incidents/${incident.id}`)}
                                        >
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {getSeverityIcon(incident.severity)}
                                                {incident.title}
                                            </CardTitle>
                                            {incident.description && (
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {incident.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 items-start flex-shrink-0">
                                            <div className="flex flex-col gap-2">
                                                <Badge variant="outline" className={statusColors[incident.status]}>
                                                    {incident.status.replace('_', ' ')}
                                                </Badge>
                                                <Badge variant="outline" className={severityColors[incident.severity]}>
                                                    {incident.severity}
                                                </Badge>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedIncident(incident);
                                                    setEditDialogOpen(true);
                                                }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        <Badge variant="outline" className={categoryColors[incident.category]}>
                                            {incident.category}
                                        </Badge>
                                        {incident.event && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {incident.event.title}
                                            </span>
                                        )}
                                        {incident.owner && (
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {incident.owner.displayName}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(incident.createdAt)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {incidentsData.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {incidentsData.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(incidentsData.totalPages, p + 1))}
                                    disabled={currentPage === incidentsData.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <AlertTriangle className="w-16 h-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Incidents Found</h3>
                            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                                {searchQuery || categoryFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all'
                                    ? 'No incidents match your search criteria.'
                                    : 'No incidents have been reported yet.'}
                            </p>
                            <Button onClick={() => router.push(`/org/${slug}/incidents/new`)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Report First Incident
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Edit Dialog */}
            <IncidentDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                mode="edit"
                orgSlug={slug}
                incident={selectedIncident}
            />
        </div>
    );
}
