import { Module, forwardRef } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';

// Services
import { AttendanceService } from './services/attendance.service';
import { IncidentsService } from './services/incidents.service';
import { ReportsService } from './services/reports.service';

// Controllers
import { AttendanceController } from './controllers/attendance.controller';
import { IncidentsController } from './controllers/incidents.controller';
import { ReportsController } from './controllers/reports.controller';
import { TestDebugController } from './controllers/test-debug.controller';

@Module({
    imports: [
        forwardRef(() => TenantModule),
        forwardRef(() => GlobalAuthModule),
        forwardRef(() => OrgAuthModule),
        forwardRef(() => RbacModule),
        DatabaseModule,
    ],
    providers: [
        IncidentsService,
        AttendanceService,
        ReportsService,
    ],
    controllers: [
        IncidentsController,
        AttendanceController,
        ReportsController,
        TestDebugController,
    ],
    exports: [
        IncidentsService,
        AttendanceService,
        ReportsService,
    ],
})
export class IncidentsModule { }
