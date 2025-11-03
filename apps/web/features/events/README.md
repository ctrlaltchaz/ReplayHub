# Events Module

A complete events management system for the esports operations platform.

## Features

- **List View**: Server-rendered events list with client-side filtering and search
- **Create Event**: Modal form for creating new events with validation
- **Event Details**: Drawer and dedicated page views for event information
- **Calendar Integration**: Links to calendar week view
- **Org-scoped**: All operations are scoped to the current organization

## API Integration

Uses the `/org/:slug/events` API endpoints:

- `GET /org/:slug/events` - List events with filters
- `POST /org/:slug/events` - Create new event
- `GET /org/:slug/events/:id` - Get event details

## Query Keys Structure

All React Query caches are keyed with the following pattern:
```
['/org/{slug}/events', apiOptions?.slug]
['/org/{slug}/events/{eventId}', apiOptions?.slug]
```

This ensures proper cache isolation between organizations and automatic invalidation when data changes.

## Filter Parameters

The events list supports the following filters:

- `from` - Filter events from this datetime (ISO string)
- `to` - Filter events until this datetime (ISO string) 
- `teamId` - Filter by associated team ID
- `q` - Search query (searches title, location, notes)
- `status` - Filter by event status (scheduled, cancelled, completed)
- `page` - Page number for pagination
- `limit` - Items per page

## Extending Filters

To add new filter parameters:

1. Add the parameter to `EventsQueryParams` type in `hooks/events/types.ts`
2. Update the `useEventsList` hook to handle the new parameter
3. Add UI controls in `EventsToolbar` component
4. Update the search params handling in the main events page

## Permissions

The module respects the following permissions:

- `events.view` - Required to view events
- `events.create` / `events.manage` - Required to create events

Permissions are enforced at both the API level and UI level (hiding create buttons when user lacks permission).

## Components

- **EventsToolbar**: Search, date filters, and create button
- **EventsTable**: Responsive table with loading/empty states
- **EventCreateDialog**: Modal form for creating events
- **EventDetailsDrawer**: Side panel for viewing event details

## States Handled

- Loading: Skeleton components and spinners
- Empty: Friendly empty state with CTA
- Error: Inline errors with retry functionality
- Form validation: Real-time validation with helpful error messages

## Accessibility

All components include proper accessibility features:

- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Focus management for modals/drawers
- Screen reader friendly loading states

## Calendar Integration

Events can be viewed in the calendar module via:
```
/org/{slug}/calendar/week?start={YYYY-MM-DD}
```

The calendar link automatically calculates the appropriate week start date based on the event's date.