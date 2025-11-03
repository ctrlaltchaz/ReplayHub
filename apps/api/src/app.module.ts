import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

// Common modules
import { AuditModule } from './common/audit/audit.module';
import { AuditInterceptor } from './common/audit/interceptors/audit.interceptor';
import { PermissionLoggingMiddleware } from './common/middleware/permission-logging.middleware';
import { TenantContextInterceptor } from './common/tenant/interceptors/tenant-context.interceptor';
import { TenantModule } from './common/tenant/tenant.module';
import { DatabaseModule } from './database/database.module';

// Health check
import { HealthController } from './health/health.controller';

// Global modules
import { FeedbackModule } from './modules/feedback/feedback.module';
import { GlobalAdminModule } from './modules/global-admin/global-admin.module';
import { GlobalAuthModule } from './modules/global-auth/global-auth.module';
import { GlobalOrganisationsModule } from './modules/global-organisations/global-organisations.module';
import { GlobalUsersModule } from './modules/global-users/global-users.module';
import { UniversalAuthModule } from './modules/universal-auth/universal-auth.module';

// Demo module (for tenant isolation testing)
import { DemoModule } from './modules/demo/demo.module';
import { TenantRoutesModule } from './modules/tenant-routes/tenant-routes.module';

// Org-scoped modules
import { InviteModule } from './modules/invites/invite.module';
import { OrgAuthModule } from './modules/org-auth/org-auth.module';
import { OrgUserModule } from './modules/org-users/org-user.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { RbacModule } from './modules/rbac/rbac.module';

// Business modules
import { AssetsModule } from './modules/assets/assets.module';
import { ChecklistsModule } from './modules/checklists/checklists.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DiscordModule } from './modules/discord/discord.module';
import { EventsModule } from './modules/events/events.module';
import { GameLogModule } from './modules/gamelog/gamelog.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { RolesModule } from './modules/roles/roles.module';
import { RosterModule } from './modules/roster/roster.module';
import { RunsheetsModule } from './modules/runsheets/runsheets.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Database
    DatabaseModule,

    // Common modules
    TenantModule,
    AuditModule,

    // Global modules
    GlobalAdminModule,
    GlobalAuthModule,
    GlobalUsersModule,
    GlobalOrganisationsModule,
    UniversalAuthModule,
    FeedbackModule,

    // Demo module
    DemoModule,

    // Org-scoped modules
    OrgAuthModule,
    IncidentsModule,  // Before RbacModule to test route precedence
    RbacModule,
    InviteModule,
    OrgUserModule,
    OrganizationModule,

    // Tenant route configuration
    TenantRoutesModule,

    // Business modules
    OrganizationsModule,
    UsersModule,
    RolesModule,
    EventsModule,
    RunsheetsModule,
    ChecklistsModule,
    InventoryModule,
    AssetsModule,
    RosterModule,
    GameLogModule,
    SchedulingModule,
    DashboardModule,
    DiscordModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PermissionLoggingMiddleware)
      .forRoutes('org/*/inventory/*', 'org/*/assets/*');
  }
}
