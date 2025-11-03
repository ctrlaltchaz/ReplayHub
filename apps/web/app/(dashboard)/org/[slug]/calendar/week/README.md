# Calendar Week View Module

## Overview
Complete visual broadcast scheduling system at `/org/[slug]/calendar/week/`

## Features
- 7-day week grid view (desktop) with time slots 08:00-23:00
- Collapsible day list view (mobile)
- Event cards colored by type:
  - Purple: Broadcast
  - Orange: Tournament
  - Pink: Showmatch
  - Yellow: Rehearsal
  - Gray: Other
- Week navigation (Previous/Next/Today)
- Filters: Event Type, Production Lead
- Click events to open EventDetailsDrawer
- Permission-gated "Create Event" button
- Loading skeletons with pulse animation

## File Structure
```
apps/web/app/(dashboard)/org/[slug]/calendar/week/
├── page.tsx                          # Main page with auth & integration
├── hooks/
│   └── useCalendarEvents.ts          # React Query data fetching
└── components/
    ├── CalendarToolbar.tsx           # Week nav + filters + create button
    ├── CalendarGrid.tsx              # Desktop grid + mobile list
    └── CalendarEventCard.tsx         # Individual event cards
```

## API Endpoint Expected
- `GET /api/org/:slug/calendar/week?startDate=YYYY-MM-DD&days=7&eventType=&gameTitle=&productionLead=`
- Returns: `Event[]` array

## Permissions
- `events.view` - Required to access calendar
- `events.manage` - Shows "Create Event" button

## Integration
- Reuses Event type from `@/hooks/events`
- Reuses GameLogo component from events module
- Opens EventDetailsDrawer on event click
- Links to events page for creation

## Components Detail

### CalendarToolbar
- Week navigation: Previous/Next buttons with ChevronLeft/Right icons
- "Today" button with Calendar icon to jump to current week
- Date range display: "Jan 1 - Jan 7, 2024"
- Event Type filter dropdown (All/Broadcast/Tournament/Showmatch/Rehearsal/Other)
- Production Lead filter dropdown (dynamically populated from events)
- "Clear Filters" button (shows when filters active)
- "Create Event" button (permission-gated, links to events page)

### CalendarGrid
- **Desktop Layout**: 8-column grid (time labels + 7 days)
  - Time slots: 08:00-23:00 (16 hourly rows)
  - Sticky header with day names and dates
  - Events positioned absolutely over time grid
  - Hover highlights on day columns
- **Mobile Layout**: Collapsible day sections
  - Full event cards in vertical list
  - "No events scheduled" message for empty days
  - Sticky day headers during scroll
- **Loading State**: Pulse animation skeleton with 7 placeholder rows

### CalendarEventCard
- Color-coded border and background by eventType
- Displays: title, time range (HH:mm), game logo, production lead
- Broadcast platforms as badges (shows first 2 + "+N" for overflow)
- White text on colored background for contrast
- Hover effects: scale(1.02) and shadow increase
- Tooltip with full event info
- Click handler for opening event details

### useCalendarEvents Hook
- Fetches from `/org/${slug}/calendar/week` endpoint
- Parameters: slug, startDate, days (default 7), optional filters
- Formats startDate to `yyyy-MM-dd` for API
- Cache: 2 minutes stale time, 10 minutes gc time
- Returns: Event[] array with loading and error states

## Usage Example
```tsx
// Navigate to calendar
<Link href={`/org/${slug}/calendar/week`}>
  <Button>View Calendar</Button>
</Link>

// The page handles all state management, auth, and permissions automatically
```

## Status: ✅ Complete
- All components implemented
- All TypeScript errors resolved
- Auth and permissions integrated
- Responsive layouts working
- Ready to test with backend API endpoint
