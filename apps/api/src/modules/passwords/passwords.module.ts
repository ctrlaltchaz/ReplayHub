import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { PasswordsController } from './controllers/passwords.controller';
import { PasswordsService } from './services/passwords.service';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    forwardRef(() => TenantModule),
    forwardRef(() => OrgAuthModule),
    forwardRef(() => GlobalAuthModule),
    forwardRef(() => RbacModule),
  ],
  controllers: [PasswordsController],
  providers: [PasswordsService],
})
export class PasswordsModule {}
