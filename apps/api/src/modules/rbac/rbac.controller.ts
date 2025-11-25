import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TenantAccessGuard } from '../../common/tenant/guards/tenant-access.guard';
import { TenantGuard } from '../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { AuditService } from '../../common/audit/audit.service';
import { Can } from './decorators/can.decorator';
import { PermissionGuard } from './guards/permission.guard';
import { PermissionService } from './services/permission.service';
import {
  AssignRoleDto,
  CreateRoleDto,
  RemoveRoleDto,
  RoleService,
  UpdateRoleDto,
} from './services/role.service';

@Controller('org/:slug/admin')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, TenantAccessGuard)
export class RbacController {
  constructor(
    private permissionService: PermissionService,
    private roleService: RoleService,
    private readonly auditService: AuditService
  ) {}

  // Permissions endpoints
  @Get('permissions')
  @Can('org.settings.view')
  @UseGuards(PermissionGuard)
  async getPermissions(@Req() req: Request) {
    const permissions = await this.permissionService.getPermissionRegistry(req.tenant!.id);
    return { permissions };
  }

  @Post('permissions/seed')
  @Can('org.settings.manage')
  @UseGuards(PermissionGuard)
  async seedPermissions(@Req() req: Request) {
    const result = await this.permissionService.seedDefaultPermissions(req.tenant!.id);
    await this.auditService.log({
      tenantId: req.tenant?.id,
      action: 'permission.seed',
      entity: 'permission',
      entityType: 'PERMISSION',
      orgUserId: req.orgUser?.id ?? null,
      description: 'Seeded default permissions',
      metadata: { created: result.created },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  // Roles endpoints
  @Get('roles')
  @Can('org.settings.view')
  @UseGuards(PermissionGuard)
  async getRoles(@Req() req: Request) {
    const roles = await this.roleService.getRoles(req.tenant!.id);
    return { roles };
  }

  @Get('roles/:id')
  @Can('org.settings.view')
  @UseGuards(PermissionGuard)
  async getRoleById(@Param('id') roleId: string, @Req() req: Request) {
    const role = await this.roleService.getRoleById(req.tenant!.id, roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return { role };
  }

  @Post('roles')
  @Can('org.settings.manage')
  @UseGuards(PermissionGuard)
  async createRole(@Body() createRoleDto: CreateRoleDto, @Req() req: Request) {
    const role = await this.roleService.createRole(
      req.tenant!.id,
      createRoleDto,
      req.orgUser!.id,
      req.orgUser?.email
    );
    return { role };
  }

  @Put('roles/:id')
  @Can('org.settings.manage')
  @UseGuards(PermissionGuard)
  async updateRole(
    @Param('id') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: Request
  ) {
    const role = await this.roleService.updateRole(
      req.tenant!.id,
      roleId,
      updateRoleDto,
      req.orgUser!.id,
      req.orgUser?.email
    );
    return { role };
  }

  @Delete('roles/:id')
  @Can('org.settings.manage')
  @UseGuards(PermissionGuard)
  async deleteRole(@Param('id') roleId: string, @Req() req: Request) {
    const result = await this.roleService.deleteRole(
      req.tenant!.id,
      roleId,
      req.orgUser!.id,
      req.orgUser?.email
    );
    return result;
  }

  @Post('roles/seed')
  @Can('org.settings.manage')
  @UseGuards(PermissionGuard)
  async seedRoles(@Req() req: Request) {
    // First seed permissions
    const permResult = await this.permissionService.seedDefaultPermissions(req.tenant!.id);

    // Then seed roles
    const result = await this.roleService.seedDefaultRoles(req.tenant!.id);

    await this.auditService.log({
      tenantId: req.tenant?.id,
      action: 'role.seed',
      entity: 'role',
      entityType: 'ROLE',
      orgUserId: req.orgUser?.id ?? null,
      description: 'Seeded default roles',
      metadata: { createdRoles: result.created, permissionsCreated: permResult.created },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  // Role Assignment endpoints
  @Post('users/:userId/roles')
  @Can('users.manage')
  @UseGuards(PermissionGuard)
  async assignRoles(
    @Param('userId') userId: string,
    @Body() assignRoleDto: Omit<AssignRoleDto, 'membershipId'>,
    @Req() req: Request
  ) {
    const result = await this.roleService.assignRoles(
      req.tenant!.id,
      { ...assignRoleDto, membershipId: userId },
      req.orgUser!.id,
      req.orgUser?.email
    );
    return result;
  }

  @Delete('users/:userId/roles')
  @Can('users.manage')
  @UseGuards(PermissionGuard)
  async removeRoles(
    @Param('userId') userId: string,
    @Body() removeRoleDto: Omit<RemoveRoleDto, 'membershipId'>,
    @Req() req: Request
  ) {
    const result = await this.roleService.removeRoles(
      req.tenant!.id,
      { ...removeRoleDto, membershipId: userId },
      req.orgUser!.id,
      req.orgUser?.email
    );
    return result;
  }

  @Get('users/:userId/roles')
  @Can('users.view')
  @UseGuards(PermissionGuard)
  async getUserRoles(@Param('userId') userId: string, @Req() req: Request) {
    const result = await this.roleService.getUserRoles(req.tenant!.id, userId);
    return result;
  }
}
