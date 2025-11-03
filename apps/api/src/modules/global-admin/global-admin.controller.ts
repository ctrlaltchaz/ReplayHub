import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { Request } from 'express';
import { CreateCommentDto, FilterFeedbackDto, UpdateFeedbackDto } from '../feedback/dto';
import { FeedbackService } from '../feedback/feedback.service';
import { SessionGuard } from '../global-auth/guards/session.guard';
import {
    CreateGlobalUserDto,
    CreateOrganisationDto,
    CreateOrganisationRoleDto,
    CreateOrganisationUserDto,
    ImpersonateDto,
    UpdateGlobalUserDto,
    UpdateOrganisationDto,
    UpdateOrganisationRoleDto,
    UpdateOrganisationUserDto
} from './dto/admin.dto';
import { GlobalAdminService } from './global-admin.service';

// Simple guard to check if user is authenticated globally
@Controller('admin')
@UseGuards(SessionGuard) // Ensure global session exists
export class GlobalAdminController {
    constructor(
        private readonly globalAdminService: GlobalAdminService,
        private readonly feedbackService: FeedbackService,
    ) { }

    // Overview
    @Get('overview')
    @HttpCode(HttpStatus.OK)
    async getOverview() {
        return this.globalAdminService.getOverview();
    }

    // Organisations
    @Get('organisations')
    @HttpCode(HttpStatus.OK)
    async getOrganisations(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.globalAdminService.getOrganisations(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            search
        );
    }

    @Post('organisations')
    @HttpCode(HttpStatus.CREATED)
    async createOrganisation(@Body() dto: CreateOrganisationDto) {
        return this.globalAdminService.createOrganisation(dto);
    }

    @Get('organisations/:orgId')
    @HttpCode(HttpStatus.OK)
    async getOrganisation(@Param('orgId') orgId: string) {
        return this.globalAdminService.getOrganisation(orgId);
    }

    @Put('organisations/:orgId')
    @HttpCode(HttpStatus.OK)
    async updateOrganisation(
        @Param('orgId') orgId: string,
        @Body() dto: UpdateOrganisationDto
    ) {
        return this.globalAdminService.updateOrganisation(orgId, dto);
    }

    @Delete('organisations/:orgId')
    @HttpCode(HttpStatus.OK)
    async deleteOrganisation(@Param('orgId') orgId: string) {
        return this.globalAdminService.deleteOrganisation(orgId);
    }

    // Global Users
    @Get('global-users')
    @HttpCode(HttpStatus.OK)
    async getGlobalUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.globalAdminService.getGlobalUsers(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            search
        );
    }

    @Post('global-users')
    @HttpCode(HttpStatus.CREATED)
    async createGlobalUser(@Body() dto: CreateGlobalUserDto) {
        return this.globalAdminService.createGlobalUser(dto);
    }

    @Get('global-users/:userId')
    @HttpCode(HttpStatus.OK)
    async getGlobalUser(@Param('userId') userId: string) {
        return this.globalAdminService.getGlobalUser(userId);
    }

    @Put('global-users/:userId')
    @HttpCode(HttpStatus.OK)
    async updateGlobalUser(
        @Param('userId') userId: string,
        @Body() dto: UpdateGlobalUserDto
    ) {
        return this.globalAdminService.updateGlobalUser(userId, dto);
    }

    @Delete('global-users/:userId')
    @HttpCode(HttpStatus.OK)
    async deleteGlobalUser(@Param('userId') userId: string) {
        return this.globalAdminService.deleteGlobalUser(userId);
    }

    // Audit
    @Get('audit')
    @HttpCode(HttpStatus.OK)
    async getGlobalAudit(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.globalAdminService.getGlobalAudit(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 50
        );
    }

    // Impersonation
    @Post('impersonate')
    @HttpCode(HttpStatus.OK)
    async startImpersonation(
        @Body() dto: ImpersonateDto,
        @Req() req: Request
    ) {
        const globalUserId = req.session.userId;
        return this.globalAdminService.startImpersonation(globalUserId, dto, req);
    }

    @Post('impersonate/stop')
    @HttpCode(HttpStatus.OK)
    async stopImpersonation(@Req() req: Request) {
        return this.globalAdminService.stopImpersonation(req);
    }

    @Get('impersonate/status')
    @HttpCode(HttpStatus.OK)
    async getImpersonationStatus(@Req() req: Request) {
        return this.globalAdminService.getImpersonationStatus(req);
    }

    // Organization Users Management
    @Get('organisations/:orgId/users')
    @HttpCode(HttpStatus.OK)
    async getOrganisationUsers(@Param('orgId') orgId: string) {
        return this.globalAdminService.getOrganisationUsers(orgId);
    }

    @Post('organisations/:orgId/users')
    @HttpCode(HttpStatus.CREATED)
    async createOrganisationUser(
        @Param('orgId') orgId: string,
        @Body() dto: CreateOrganisationUserDto
    ) {
        return this.globalAdminService.createOrganisationUser(orgId, dto);
    }

    @Put('organisations/:orgId/users/:userId')
    @HttpCode(HttpStatus.OK)
    async updateOrganisationUser(
        @Param('orgId') orgId: string,
        @Param('userId') userId: string,
        @Body() dto: UpdateOrganisationUserDto
    ) {
        return this.globalAdminService.updateOrganisationUser(orgId, userId, dto);
    }

    @Delete('organisations/:orgId/users/:userId')
    @HttpCode(HttpStatus.OK)
    async deleteOrganisationUser(
        @Param('orgId') orgId: string,
        @Param('userId') userId: string
    ) {
        return this.globalAdminService.deleteOrganisationUser(orgId, userId);
    }

    // Organization Roles Management
    @Get('organisations/:orgId/roles')
    @HttpCode(HttpStatus.OK)
    async getOrganisationRoles(@Param('orgId') orgId: string) {
        return this.globalAdminService.getOrganisationRoles(orgId);
    }

    @Post('organisations/:orgId/roles')
    @HttpCode(HttpStatus.CREATED)
    async createOrganisationRole(
        @Param('orgId') orgId: string,
        @Body() dto: CreateOrganisationRoleDto
    ) {
        console.log(`[CONTROLLER] Creating role for org: ${orgId}`, dto);
        return this.globalAdminService.createOrganisationRole(orgId, dto);
    }

    @Put('organisations/:orgId/roles/:roleId')
    @HttpCode(HttpStatus.OK)
    async updateOrganisationRole(
        @Param('orgId') orgId: string,
        @Param('roleId') roleId: string,
        @Body() dto: UpdateOrganisationRoleDto
    ) {
        return this.globalAdminService.updateOrganisationRole(orgId, roleId, dto);
    }

    @Delete('organisations/:orgId/roles/:roleId')
    @HttpCode(HttpStatus.OK)
    async deleteOrganisationRole(
        @Param('orgId') orgId: string,
        @Param('roleId') roleId: string
    ) {
        return this.globalAdminService.deleteOrganisationRole(orgId, roleId);
    }

    // Organization Permissions
    @Get('organisations/:orgId/permissions')
    @HttpCode(HttpStatus.OK)
    async getOrganisationPermissions(@Param('orgId') orgId: string) {
        console.log(`[CONTROLLER] Getting permissions for org: ${orgId}`);
        return this.globalAdminService.getOrganisationPermissions(orgId);
    }

    // Feedback & Bug Reports Management
    @Get('feedback')
    @HttpCode(HttpStatus.OK)
    async getFeedback(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('priority') priority?: string,
        @Query('organizationId') organizationId?: string,
        @Query('userId') userId?: string,
        @Query('category') category?: string,
        @Query('search') search?: string,
    ) {
        const filters: FilterFeedbackDto = {
            type: type as any,
            status: status as any,
            priority: priority as any,
            organizationId,
            userId,
            category,
            search,
        };

        return this.feedbackService.listFeedback(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            filters,
        );
    }

    @Get('feedback/statistics')
    @HttpCode(HttpStatus.OK)
    async getFeedbackStatistics() {
        return this.feedbackService.getStatistics();
    }

    @Get('feedback/:id')
    @HttpCode(HttpStatus.OK)
    async getFeedbackById(@Param('id') id: string) {
        return this.feedbackService.getFeedback(id);
    }

    @Put('feedback/:id')
    @HttpCode(HttpStatus.OK)
    async updateFeedback(
        @Param('id') id: string,
        @Body() dto: UpdateFeedbackDto,
    ) {
        return this.feedbackService.updateFeedback(id, dto);
    }

    @Post('feedback/:id/comments')
    @HttpCode(HttpStatus.CREATED)
    async addFeedbackComment(
        @Param('id') id: string,
        @Body() dto: CreateCommentDto,
        @Req() req: Request,
    ) {
        const adminId = req.session.userId;
        return this.feedbackService.addComment(id, adminId, dto);
    }
}