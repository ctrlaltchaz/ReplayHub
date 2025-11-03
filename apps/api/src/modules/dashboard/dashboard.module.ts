import { Module } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
    imports: [DatabaseModule, TenantModule],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule { }
