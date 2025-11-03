import { Module, forwardRef } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { AssetController } from './controllers/asset.controller';
import { InventoryController } from './controllers/inventory.controller';
import { AssetService } from './services/asset.service';
import { InventoryService } from './services/inventory.service';

@Module({
    imports: [
        DatabaseModule,
        OrgAuthModule,
        forwardRef(() => GlobalAuthModule),
        forwardRef(() => RbacModule),
        forwardRef(() => TenantModule),
    ],
    controllers: [InventoryController, AssetController],
    providers: [InventoryService, AssetService],
    exports: [InventoryService, AssetService],
})
export class InventoryModule { }
