import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditModule } from '../../common/audit/audit.module';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { DiscordModule } from '../discord/discord.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { PermissionGuard } from '../rbac/guards/permission.guard';
import { RbacModule } from '../rbac/rbac.module';

// Services
import { EventRemindersService } from '../events/event-reminders.service';
import { BookingsService } from './services/bookings.service';
import { CalendarUtilsService } from './services/calendar-utils.service';
import { CrewTemplatesService } from './services/crew-templates.service';
import { EventsService } from './services/events.service';
import { ResourcesService } from './services/resources.service';

// Controllers
import { BookingsController } from './controllers/bookings.controller';
import { CrewTemplatesController } from './controllers/crew-templates.controller';
import { CalendarController, EventsController } from './controllers/events.controller';
import { ResourcesController } from './controllers/resources.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    forwardRef(() => TenantModule),
    forwardRef(() => GlobalAuthModule),
    forwardRef(() => OrgAuthModule),
    forwardRef(() => RbacModule),
    DatabaseModule,
    DiscordModule,
    AuditModule,
  ],
  providers: [
    CalendarUtilsService,
    EventsService,
    ResourcesService,
    BookingsService,
    EventRemindersService,
    CrewTemplatesService,
    PermissionGuard,
  ],
  controllers: [
    EventsController,
    CalendarController,
    ResourcesController,
    BookingsController,
    CrewTemplatesController,
  ],
  exports: [EventsService, ResourcesService, BookingsService, CrewTemplatesService],
})
export class SchedulingModule {}
