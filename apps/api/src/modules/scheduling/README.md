# Scheduling Module Implementation

## Overview
The scheduling module provides comprehensive event, resource, and booking management functionality for the esports operations platform. It includes full tenant isolation, authentication, and authorization.

## Features Implemented

### 🎯 Events Management
- **CRUD Operations**: Create, read, update, and delete events
- **Team/Lineup Assignment**: Link events to teams and lineups
- **Date/Time Validation**: Ensure end times are after start times
- **Tenant Isolation**: Full RLS support with tenant context

### 🏢 Resources Management
- **Resource Types**: Support for 'room' and 'kit' resources
- **Location Tracking**: Optional location information for resources
- **Reference IDs**: Link to external systems (e.g., inventory kits)
- **Conflict Detection**: Check for booking conflicts

### 📋 Bookings Management
- **Multi-Resource Booking**: Book multiple resources for an event
- **Conflict Prevention**: Optional soft booking for conflict override
- **Booking Removal**: Remove individual or all bookings from events
- **Availability Checking**: Real-time conflict detection

### 📅 Calendar Integration
- **Week View**: Get calendar view for a specific week
- **Event Aggregation**: Show events with associated resources
- **Time-based Filtering**: Efficient date range queries

## API Endpoints

### Events
- `POST /org/:orgSlug/events` - Create new event
- `GET /org/:orgSlug/events` - List events with filtering
- `GET /org/:orgSlug/events/:id` - Get specific event
- `PUT /org/:orgSlug/events/:id` - Update event
- `DELETE /org/:orgSlug/events/:id` - Delete event
- `PUT /org/:orgSlug/events/:id/assign-lineup` - Assign lineup to event

### Resources
- `POST /org/:orgSlug/resources` - Create new resource
- `GET /org/:orgSlug/resources` - List resources with filtering
- `GET /org/:orgSlug/resources/:id` - Get specific resource
- `PUT /org/:orgSlug/resources/:id` - Update resource
- `DELETE /org/:orgSlug/resources/:id` - Delete resource

### Bookings
- `POST /org/:orgSlug/events/:eventId/bookings` - Create bookings
- `GET /org/:orgSlug/events/:eventId/bookings` - Get event bookings
- `DELETE /org/:orgSlug/events/:eventId/bookings/:resourceId` - Remove specific booking
- `DELETE /org/:orgSlug/events/:eventId/bookings` - Remove all bookings

### Calendar
- `GET /org/:orgSlug/calendar/week` - Get calendar week view

## Security & Authorization

### Required Permissions
- `events.view` - View events and calendar
- `events.manage` - Create, update, delete events and bookings
- `resources.view` - View resources
- `resources.manage` - Create, update, delete resources

### Guards Applied
- `TenantGuard` - Ensures tenant context is set
- `OrgAuthGuard` - Validates user belongs to organization
- `PermissionGuard` - Checks user has required permissions

## Database Schema

### Event Model
```sql
model Event {
  id        String   @id @default(cuid())
  tenantId  String   @map("tenant_id")
  title     String
  startAt   DateTime @map("start_at")
  endAt     DateTime @map("end_at")
  location  String?
  teamId    String?  @map("team_id")
  lineupId  String?  @map("lineup_id")
  notes     String?
  status    String   @default("scheduled")
  createdBy String   @map("created_by")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations and indexes...
}
```

### Resource Model
```sql
model Resource {
  id        String   @id @default(cuid())
  tenantId  String   @map("tenant_id")
  kind      String   // room|kit
  name      String
  refId     String?  @map("ref_id")
  location  String?
  createdAt DateTime @default(now()) @map("created_at")
  
  // Relations and indexes...
}
```

### Booking Model
```sql
model Booking {
  id         String   @id @default(cuid())
  tenantId   String   @map("tenant_id")
  eventId    String   @map("event_id")
  resourceId String   @map("resource_id")
  createdAt  DateTime @default(now()) @map("created_at")
  
  // Relations and indexes...
}
```

## Implementation Notes

### Tenant Isolation
- All services use raw SQL queries with RLS (Row Level Security)
- Tenant context is set via `SELECT set_config('app.tenant_id', $1, true)`
- All database operations are scoped to the tenant

### Error Handling
- Comprehensive validation using class-validator
- Conflict detection for overlapping bookings
- Foreign key constraint handling
- Proper HTTP status codes and error messages

### Performance Considerations
- Indexed queries on tenant_id and date ranges
- Efficient JOIN operations for calendar views
- Parameterized queries to prevent SQL injection
- Minimal data transfer with targeted projections

## Testing Recommendations

1. **Unit Tests**: Test service methods with mock data
2. **Integration Tests**: Test API endpoints with real database
3. **Conflict Resolution**: Test booking conflict scenarios
4. **Permission Tests**: Verify authorization works correctly
5. **Tenant Isolation**: Ensure data doesn't leak between tenants

## Future Enhancements

- Recurring events support
- Resource capacity management
- Booking approval workflows
- Integration with external calendar systems
- Real-time notifications for conflicts
- Bulk operations for resource management