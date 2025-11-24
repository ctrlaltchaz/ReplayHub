import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import { PermissionGuard } from '../../rbac/guards/permission.guard';
import { CreatePasswordDto, PasswordQueryDto, UpdatePasswordDto } from '../dto/password.dto';
import { PasswordsService } from '../services/passwords.service';

@Controller('org/:slug/passwords')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class PasswordsController {
  constructor(private readonly passwordsService: PasswordsService) {}

  @Post()
  @Can('passwords.manage')
  async createPassword(@Req() req: Request, @Body() dto: CreatePasswordDto) {
    return this.passwordsService.createPassword(req.tenant!.id, req.orgUser!.id, dto, req);
  }

  @Get()
  @Can('passwords.view')
  async listPasswords(@Req() req: Request, @Query() query: PasswordQueryDto) {
    return { data: await this.passwordsService.listPasswords(req.tenant!.id, query) };
  }

  @Get(':id')
  @Can('passwords.view')
  async getPassword(@Req() req: Request, @Param('id') id: string) {
    return this.passwordsService.getPassword(req.tenant!.id, id, req.orgUser!.id, req);
  }

  @Put(':id')
  @Can('passwords.manage')
  async updatePassword(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto
  ) {
    return this.passwordsService.updatePassword(req.tenant!.id, id, req.orgUser!.id, dto, req);
  }

  @Delete(':id')
  @Can('passwords.manage')
  async deletePassword(@Req() req: Request, @Param('id') id: string) {
    return this.passwordsService.deletePassword(req.tenant!.id, id, req.orgUser!.id, req);
  }

  @Get(':id/audit')
  @Can('passwords.manage')
  async getAuditLogs(@Req() req: Request, @Param('id') id: string) {
    return { data: await this.passwordsService.getAuditLogs(req.tenant!.id, id) };
  }
}
