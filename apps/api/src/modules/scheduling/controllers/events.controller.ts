import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Delete,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../../common/tenant/decorators/tenant-id.decorator';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../../modules/rbac/decorators/can.decorator';
import { PermissionGuard } from '../../../modules/rbac/guards/permission.guard';
import {
    AssignLineupDto,
    CalendarWeekQueryDto,
    CreateEventDto,
    EventResponse,
    QueryEventsDto,
    UpdateEventDto
} from '../dto/scheduling.dto';
import { EventsService } from '../services/events.service';

@ApiTags('Scheduling - Events')
@ApiBearerAuth()
@Controller('org/:slug/events')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Get('summary')
    @Can('events.view')
    @ApiOperation({ summary: 'Get events summary for dashboard' })
    @ApiResponse({ status: 200, description: 'Events summary retrieved' })
    async getSummary(@Req() req: any) {
        const tenantId = req.tenant?.id;
        if (!tenantId) {
            throw new ConflictException('Tenant context required');
        }
        const total = await this.eventsService.countEvents(tenantId);
        const upcoming = await this.eventsService.countUpcomingEvents(tenantId);
        return { total, upcoming };
    }

    @Post()
    @ApiOperation({ summary: 'Create a new event' })
    @ApiResponse({ status: 201, description: 'Event created', type: EventResponse })
    @Can('events.manage')
    async createEvent(
        @TenantId() tenantId: string,
        @Req() req: any,
        @Body() createEventDto: CreateEventDto,
    ) {
        const principal = req.principal;
        const tenantId_ = req.tenant.id;
        const orgUser = req.orgUser ?? null;
        const globalUser = req.globalUser ?? null;

        console.log('Create Event - Auth context:', {
            hasPrincipal: !!principal,
            principalId: principal?.id,
            hasOrgUser: !!orgUser,
            orgUserId: orgUser?.id,
            hasGlobalUser: !!globalUser,
            globalUserId: globalUser?.id,
            tenantId: tenantId_
        });

        if (!principal) {
            throw new ConflictException('Authentication context required');
        }

        if (!globalUser) {
            throw new ConflictException('Global user context required for event creation');
        }

        // Validate datetime order
        if (new Date(createEventDto.endAt) <= new Date(createEventDto.startAt)) {
            throw new ConflictException('End time must be after start time');
        }

        // Use the globalUser ID as the creator for audit trail
        return await this.eventsService.createEvent(
            tenantId_,
            globalUser.id,
            createEventDto
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get events with filtering' })
    @ApiResponse({ status: 200, description: 'Events retrieved', type: [EventResponse] })
    @Can('events.view')
    async findEvents(
        @Req() req: any,
        @Query() queryDto: QueryEventsDto,
    ) {
        const tenantId = req.tenant?.id;
        if (!tenantId) {
            throw new ConflictException('Tenant context required');
        }
        return await this.eventsService.findEvents(tenantId, queryDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get event by ID' })
    @ApiResponse({ status: 200, description: 'Event found', type: EventResponse })
    @ApiResponse({ status: 404, description: 'Event not found' })
    @Can('events.view')
    async findEventById(
        @Req() req: any,
        @Param('id') id: string,
    ) {
        const tenantId = req.tenant?.id;
        if (!tenantId) {
            throw new ConflictException('Tenant context required');
        }
        const event = await this.eventsService.findOneEvent(tenantId, id);
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        return event;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update event' })
    @ApiResponse({ status: 200, description: 'Event updated', type: EventResponse })
    @ApiResponse({ status: 404, description: 'Event not found' })
    @Can('events.manage')
    async updateEvent(
        @Req() req: any,
        @Param('id') id: string,
        @Body() updateEventDto: UpdateEventDto,
    ) {
        const tenantId = req.tenant?.id;
        if (!tenantId) {
            throw new ConflictException('Tenant context required');
        }

        // Validate datetime order if both dates are provided
        if (updateEventDto.startAt && updateEventDto.endAt) {
            if (new Date(updateEventDto.endAt) <= new Date(updateEventDto.startAt)) {
                throw new ConflictException('End time must be after start time');
            }
        }

        const event = await this.eventsService.updateEvent(tenantId, id, updateEventDto);
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        return event;
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete event' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Event deleted' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    @Can('events.manage')
    async deleteEvent(
        @Req() req: any,
        @Param('id') id: string,
    ) {
        const tenantId = req.tenant?.id;
        if (!tenantId) {
            throw new ConflictException('Tenant context required');
        }
        const result = await this.eventsService.deleteEvent(tenantId, id);
        if (!result) {
            throw new NotFoundException('Event not found');
        }
        return { message: 'Event deleted successfully' };
    }

    @Put(':id/assign-lineup')
    @ApiOperation({ summary: 'Assign lineup to event' })
    @ApiResponse({ status: 200, description: 'Lineup assigned', type: EventResponse })
    @ApiResponse({ status: 404, description: 'Event not found' })
    @Can('events.manage')
    async assignLineup(
        @Req() req: any,
        @Param('id') eventId: string,
        @Body() assignLineupDto: AssignLineupDto,
    ) {
        const tenantId = req.tenant?.id;
        if (!tenantId) {
            throw new ConflictException('Tenant context required');
        }
        const event = await this.eventsService.assignLineup(tenantId, eventId, assignLineupDto.lineupId);
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        return event;
    }
}

@ApiTags('Scheduling - Calendar')
@ApiBearerAuth()
@Controller('org/:slug/calendar')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class CalendarController {
    constructor(private readonly eventsService: EventsService) { }

    @Get('week')
    @ApiOperation({
        summary: 'Get calendar week view',
        description: 'Retrieves events for a calendar week with timezone support and flexible date ranges. Defaults to current Monday if no start date provided.'
    })
    @ApiResponse({
        status: 200,
        description: 'Calendar events retrieved with metadata',
        schema: {
            type: 'object',
            properties: {
                events: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/CalendarEventResponse' }
                },
                meta: {
                    type: 'object',
                    properties: {
                        timezone: { type: 'string', example: 'America/New_York' },
                        period: {
                            type: 'object',
                            properties: {
                                start: { type: 'string', format: 'date', example: '2025-01-13' },
                                days: { type: 'number', example: 7 },
                                utcRange: {
                                    type: 'object',
                                    properties: {
                                        start: { type: 'string', format: 'date-time' },
                                        end: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid parameters' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @Can('events.view')
    async getWeekView(
        @Req() req: any,
        @Query() queryDto: CalendarWeekQueryDto,
    ) {
        const tenantId = req.tenant?.id;
        if (!tenantId) {
            throw new ConflictException('Tenant context required');
        }

        try {
            return await this.eventsService.getCalendarWeek(tenantId, queryDto);
        } catch (error) {
            console.error(`[CalendarController] Error in getWeekView:`, error);

            if (error.message?.includes('Invalid date format')) {
                throw new BadRequestException(error.message);
            }

            if (error.message?.includes('Invalid timezone')) {
                throw new BadRequestException('Invalid timezone identifier. Please use a valid IANA timezone (e.g., "America/New_York").');
            }

            throw error;
        }
    }
}