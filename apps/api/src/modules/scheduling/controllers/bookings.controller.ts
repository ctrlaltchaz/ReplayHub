import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Post,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../../common/tenant/decorators/tenant-id.decorator';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../../modules/rbac/decorators/can.decorator';
import { PermissionGuard } from '../../../modules/rbac/guards/permission.guard';
import {
    BookingResponse,
    CreateBookingsDto
} from '../dto/scheduling.dto';
import { BookingsService } from '../services/bookings.service';

@ApiTags('Scheduling - Bookings')
@ApiBearerAuth()
@Controller('org/:slug/events/:eventId/bookings')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Post()
    @ApiOperation({ summary: 'Create bookings for event resources' })
    @ApiResponse({ status: 201, description: 'Bookings created', type: [BookingResponse] })
    @Can('events.manage')
    async createBookings(
        @TenantId() tenantId: string,
        @Param('eventId') eventId: string,
        @Body() createBookingsDto: CreateBookingsDto,
    ) {
        return await this.bookingsService.createBookings(tenantId, eventId, createBookingsDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get event bookings' })
    @ApiResponse({ status: 200, description: 'Bookings retrieved', type: [BookingResponse] })
    @Can('events.view')
    async getEventBookings(
        @TenantId() tenantId: string,
        @Param('eventId') eventId: string,
    ) {
        return await this.bookingsService.getEventBookings(tenantId, eventId);
    }

    @Delete(':resourceId')
    @ApiOperation({ summary: 'Remove specific resource booking from event' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Booking removed' })
    @Can('events.manage')
    async removeBooking(
        @TenantId() tenantId: string,
        @Param('eventId') eventId: string,
        @Param('resourceId') resourceId: string,
    ) {
        return await this.bookingsService.removeBooking(tenantId, eventId, resourceId);
    }

    @Delete()
    @ApiOperation({ summary: 'Remove all bookings from event' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'All bookings removed' })
    @Can('events.manage')
    async removeAllBookings(
        @TenantId() tenantId: string,
        @Param('eventId') eventId: string,
    ) {
        return await this.bookingsService.removeAllEventBookings(tenantId, eventId);
    }
}
