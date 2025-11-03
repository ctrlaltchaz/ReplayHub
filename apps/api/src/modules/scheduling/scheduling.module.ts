import { Module, forwardRef } from '@nestjs/common';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { DiscordModule } from '../discord/discord.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { PermissionGuard } from '../rbac/guards/permission.guard';
import { RbacModule } from '../rbac/rbac.module';

// Services
import { BookingsService } from './services/bookings.service';
import { CalendarUtilsService } from './services/calendar-utils.service';
import { EventsService } from './services/events.service';
import { ResourcesService } from './services/resources.service';

// Controllers
import { BookingsController } from './controllers/bookings.controller';
import { CalendarController, EventsController } from './controllers/events.controller';
import { ResourcesController } from './controllers/resources.controller';

@Module({
    imports: [
        forwardRef(() => TenantModule),
        forwardRef(() => GlobalAuthModule),
        forwardRef(() => OrgAuthModule),
        forwardRef(() => RbacModule),
        DatabaseModule,
        DiscordModule,
    ],
    providers: [
        CalendarUtilsService,
        EventsService,
        ResourcesService,
        BookingsService,
        UnifiedTenantAuthGuard,
        PermissionGuard,
    ],
    controllers: [
        EventsController,
        CalendarController,
        ResourcesController,
        BookingsController,
    ],
    exports: [
        EventsService,
        ResourcesService,
        BookingsService,
        UnifiedTenantAuthGuard,
    ],
})
export class SchedulingModule { }