import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

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
import { GlobalDocsModule } from './modules/global-docs/global-docs.module';
import { GlobalOrganisationsModule } from './modules/global-organisations/global-organisations.module';
import { GlobalUsersModule } from './modules/global-users/global-users.module';
import { RateLimitModule } from './modules/rate-limit/rate-limit.module';
import { UniversalAuthModule } from './modules/universal-auth/universal-auth.module';

// Demo module (for tenant isolation testing)
import { DemoModule } from './modules/demo/demo.module';
import { TenantRoutesModule } from './modules/tenant-routes/tenant-routes.module';

// Org-scoped modules
import { AuditLogsModule } from './modules/audit/audit.module';
import { InviteModule } from './modules/invites/invite.module';
import { OrgAuthModule } from './modules/org-auth/org-auth.module';
import { OrgUserModule } from './modules/org-users/org-user.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { RbacModule } from './modules/rbac/rbac.module';

// Business modules
import { AssetsModule } from './modules/assets/assets.module';
import { AttendanceLoggerModule } from './modules/attendance-logger/attendance-logger.module';
import { ProductionSessionsModule } from './modules/attendance-sessions/attendance-sessions.module';
import { ChecklistsModule } from './modules/checklists/checklists.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DiscordModule } from './modules/discord/discord.module';
import { DocsModule } from './modules/docs/docs.module';
import { EventsModule } from './modules/events/events.module';
import { GameLogModule } from './modules/gamelog/gamelog.module';
import { ImprovementsModule } from './modules/improvements/improvements.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { LiveGraphicsModule } from './modules/live-graphics/live-graphics.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { PasswordsModule } from './modules/passwords/passwords.module';
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

    RateLimitModule,

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
    GlobalDocsModule,
    UniversalAuthModule,
    FeedbackModule,

    // Demo module
    DemoModule,

    // Org-scoped modules
    OrgAuthModule,
    IncidentsModule, // Before RbacModule to test route precedence
    ImprovementsModule,
    RbacModule,
    InviteModule,
    OrgUserModule,
    OrganizationModule,
    AuditLogsModule,

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
    AttendanceLoggerModule,
    DiscordModule,
    ProductionSessionsModule,
    PasswordsModule,
    LiveGraphicsModule,
    DocsModule,
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
    consumer.apply(PermissionLoggingMiddleware).forRoutes('org/*/inventory/*', 'org/*/assets/*');
  }
}
