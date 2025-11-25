import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TenantGuard } from '../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../rbac/decorators/can.decorator';
import { PermissionGuard } from '../rbac/guards/permission.guard';
import { AssignRolesDto, CreateOrgUserDto, UpdateOrgUserDto } from './dto';
import { OrgUserService } from './org-user.service';

@Controller('org/:slug/users')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class OrgUserController {
  constructor(private orgUserService: OrgUserService) {}

  @Get('test')
  async testEndpoint(@Req() req: Request) {
    return {
      message: 'Users controller is working!',
      orgUser: {
        email: req.orgUser?.email,
        permissions: req.orgUser?.permissions,
      },
      tenant: req.tenant?.slug,
    };
  }

  @Post()
  @Can('users.create')
  @UseGuards(PermissionGuard)
  async createUser(@Body() createUserDto: CreateOrgUserDto, @Req() req: Request) {
    const result = await this.orgUserService.createUser(
      req.tenant!.id,
      createUserDto,
      req.orgUser!.id,
      req.orgUser?.email
    );
    return result;
  }

  @Get()
  @Can('users.read')
  @UseGuards(PermissionGuard)
  async getUsers(@Req() req: Request) {
    const users = await this.orgUserService.getUsers(req.tenant!.id);
    return { users };
  }

  @Get(':id')
  @Can('users.read')
  @UseGuards(PermissionGuard)
  async getUser(@Param('id') userId: string, @Req() req: Request) {
    const user = await this.orgUserService.getUserById(req.tenant!.id, userId);
    if (!user) {
      throw new Error('User not found');
    }
    return { user };
  }

  @Put(':id')
  @Can('users.update')
  @UseGuards(PermissionGuard)
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateOrgUserDto,
    @Req() req: Request
  ) {
    const user = await this.orgUserService.updateUser(
      req.tenant!.id,
      userId,
      updateUserDto,
      req.orgUser!.id,
      req.orgUser?.email
    );
    return { user };
  }

  @Put(':id/roles')
  @Can('users.update')
  @UseGuards(PermissionGuard)
  async assignRoles(
    @Param('id') userId: string,
    @Body() assignRolesDto: AssignRolesDto,
    @Req() req: Request
  ) {
    const user = await this.orgUserService.assignRoles(
      req.tenant!.id,
      userId,
      assignRolesDto,
      req.orgUser!.id,
      req.orgUser?.email
    );
    return { user };
  }

  @Put(':id/deactivate')
  @Can('users.delete')
  @UseGuards(PermissionGuard)
  async deactivateUser(@Param('id') userId: string, @Req() req: Request) {
    const user = await this.orgUserService.deactivateUser(
      req.tenant!.id,
      userId,
      req.orgUser!.id,
      req.orgUser?.email
    );
    return { user };
  }

  @Put(':id/reactivate')
  @Can('users.update')
  @UseGuards(PermissionGuard)
  async reactivateUser(@Param('id') userId: string, @Req() req: Request) {
    const user = await this.orgUserService.reactivateUser(
      req.tenant!.id,
      userId,
      req.orgUser!.id,
      req.orgUser?.email
    );
    return { user };
  }

  @Delete(':id')
  @Can('users.delete')
  @UseGuards(PermissionGuard)
  async deleteUser(@Param('id') userId: string, @Req() req: Request) {
    await this.orgUserService.deleteUser(
      req.tenant!.id,
      userId,
      req.orgUser!.id,
      req.orgUser?.email
    );
    return { message: 'User deleted successfully' };
  }
}
