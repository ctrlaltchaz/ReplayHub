'use client';

import { EventCreateDialog, EventDeleteDialog, EventDetailsDrawer, EventEditDialog, EventsTable, EventsToolbar } from '@/components/events';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { type CreateEventData, type Event, type EventsQueryParams, type EventType, useEventsList } from '@/hooks/events';
import { useTeams } from '@/hooks/rosters';
import { usePermissions } from '@/hooks/usePermissions';
import { apiDelete, apiGet, apiPut } from '@/lib/api/client';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { PERMISSIONS } from '@/lib/permissions/utils';
import { AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EventsPage() {
    usePageTitle('Events');

    const params = useParams();
    const slug = params?.slug as string;
    const { toast } = useToast();

    const [filters, setFilters] = useState<EventsQueryParams>({});
    const [showCompleted, setShowCompleted] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
    const [productionLeads, setProductionLeads] = useState<Array<{ id: string; name: string }>>([]);

    const { hasPermission } = usePermissions();
    const canManageEvents = hasPermission(PERMISSIONS.EVENTS_MANAGE);
    const canViewEvents = hasPermission(PERMISSIONS.EVENTS_VIEW);

    const { data: events, isLoading, error, refetch, isRefetching } = useEventsList(slug, filters);
    const { data: teams = [] } = useTeams(slug, { status: 'active' });

    // Fetch production leads (org users) for dropdowns
    useEffect(() => {
        const fetchProductionLeads = async () => {
            try {
                const response = await apiGet<{ users: Array<{ id: string; displayName: string; email: string }> }>(`/org/${slug}/users`);
                const leads = response.users.map(user => ({
                    id: user.id,
                    name: user.displayName || user.email
                }));
                setProductionLeads(leads);
            } catch (error) {
                console.error('Failed to fetch production leads:', error);
            }
        };

        if (slug) {
            fetchProductionLeads();
        }
    }, [slug]);

    const handleSearchChange = (q: string) => {
        setFilters(prev => ({ ...prev, q }));
    };

    const handleDateRangeChange = (range: { from?: string; to?: string }) => {
        setFilters(prev => ({ ...prev, ...range }));
    };

    const handleEventTypeChange = (eventType: EventType | undefined) => {
        setFilters(prev => ({ ...prev, eventType }));
    };

    const handleGameTitleChange = (gameTitle: string | undefined) => {
        setFilters(prev => ({ ...prev, gameTitle }));
    };

    const handleProductionLeadChange = (productionLead: string | undefined) => {
        setFilters(prev => ({ ...prev, productionLead }));
    };

    const handleTeamChange = (teamId: string | undefined) => {
        setFilters(prev => ({ ...prev, teamId }));
    };

    const handleEventClick = (event: Event) => {
        setSelectedEventId(event.id);
    };

    const handleEditClick = (event: Event) => {
        setEditingEvent(event);
        setShowEditDialog(true);
    };

    const handleDeleteClick = (event: Event) => {
        setDeletingEvent(event);
        setShowDeleteDialog(true);
    };

    const handleUpdateEvent = async (data: CreateEventData) => {
        if (!editingEvent) return;
        try {
            await apiPut(`/org/${slug}/events/${editingEvent.id}`, data);
            toast({ title: "Event updated", description: "The event has been updated successfully." });
            refetch();
        } catch (error) {
            toast({ title: "Failed to update event", description: error instanceof Error ? error.message : "An error occurred", variant: "destructive" });
            throw error;
        }
    };

    const handleDeleteEvent = async () => {
        if (!deletingEvent) return;
        try {
            await apiDelete(`/org/${slug}/events/${deletingEvent.id}`);
            toast({ title: "Event deleted", description: "The event has been deleted successfully." });
            refetch();
        } catch (error) {
            toast({ title: "Failed to delete event", description: error instanceof Error ? error.message : "An error occurred", variant: "destructive" });
            throw error;
        }
    };

    if (!canViewEvents) {
        return <div className="container mx-auto p-6"><Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>You do not have permission to view events.</AlertDescription></Alert></div>;
    }

    if (error) {
        return <div className="container mx-auto p-6"><div className="space-y-6"><div><h1 className="text-2xl font-bold tracking-tight">Events</h1><p className="text-muted-foreground">Manage your tournaments and broadcasts</p></div><Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription className="flex items-center justify-between"><span>Failed to load events: {error instanceof Error ? error.message : 'Unknown error'}</span><Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>{isRefetching ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Retry'}</Button></AlertDescription></Alert></div></div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        Events
                    </h1>
                    <p className="text-muted-foreground">Manage your tournaments and broadcasts</p>
                </div>
                <EventsToolbar
                    searchValue={filters.q || ''}
                    onSearchChange={handleSearchChange}
                    eventType={filters.eventType}
                    onEventTypeChange={handleEventTypeChange}
                    gameTitle={filters.gameTitle}
                    onGameTitleChange={handleGameTitleChange}
                    productionLead={filters.productionLead}
                    onProductionLeadChange={handleProductionLeadChange}
                    teamId={filters.teamId}
                    onTeamChange={handleTeamChange}
                    teams={teams}
                    productionLeads={productionLeads}
                    showCompleted={showCompleted}
                    onShowCompletedChange={setShowCompleted}
                    dateRange={{ from: filters.from, to: filters.to }}
                    onDateRangeChange={handleDateRangeChange}
                    onCreateEvent={() => setShowCreateDialog(true)}
                    canCreateEvents={canManageEvents}
                />
                <EventsTable
                    events={(events || []).filter(event => showCompleted || event.status !== 'completed')}
                    isLoading={isLoading}
                    onRowClick={handleEventClick}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    canManageEvents={canManageEvents}
                    productionLeads={productionLeads}
                />
                <EventCreateDialog
                    slug={slug}
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                    productionLeads={productionLeads}
                />
                <EventEditDialog
                    slug={slug}
                    event={editingEvent}
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                    onSubmit={handleUpdateEvent}
                    productionLeads={productionLeads}
                />
                <EventDeleteDialog
                    event={deletingEvent}
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    onConfirm={handleDeleteEvent}
                />
                <EventDetailsDrawer
                    slug={slug}
                    eventId={selectedEventId}
                    open={!!selectedEventId}
                    onOpenChange={(open) => !open && setSelectedEventId(undefined)}
                    productionLeads={productionLeads}
                    onEdit={() => {
                        const event = events?.find(e => e.id === selectedEventId);
                        if (event) {
                            handleEditClick(event);
                            setSelectedEventId(undefined);
                        }
                    }}
                    canEdit={canManageEvents}
                />
            </div>
        </div>
    );
}