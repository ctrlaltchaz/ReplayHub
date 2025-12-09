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
import {
    CompleteDocDto,
    CreateDocCategoryDto,
    CreateDocDto,
    DocQueryDto,
    UpdateDocDto,
} from '../dto';
import { DocsService } from '../services/docs.service';

@Controller('org/:slug/docs')
export class DocsController {
    constructor(private readonly docsService: DocsService) { }

    // ============================================================================
    // CATEGORIES
    // ============================================================================

    @Get('categories')
    @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
    @Can('docs.view')
    async getCategories(@Req() req: Request) {
        return this.docsService.getCategories(req.tenant!.id);
    }

    @Post('categories')
    @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
    @Can('docs.manage')
    async createCategory(@Req() req: Request, @Body() createCategoryDto: CreateDocCategoryDto) {
        return this.docsService.createCategory(
            req.tenant!.id,
            createCategoryDto,
            req.orgUser!.id
        );
    }

    // ============================================================================
    // DOCS
    // ============================================================================

    @Get()
    @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
    @Can('docs.view')
    async getDocs(@Req() req: Request, @Query() query: DocQueryDto) {
        return this.docsService.getDocs(req.tenant!.id, query);
    }

    @Get(':id')
    @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
    @Can('docs.view')
    async getDoc(@Req() req: Request, @Param('id') id: string) {
        return this.docsService.getDoc(req.tenant!.id, id, req.orgUser?.id);
    }

    @Post()
    @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
    @Can('docs.create')
    async createDoc(@Req() req: Request, @Body() createDocDto: CreateDocDto) {
        const doc = await this.docsService.createDoc(
            req.tenant!.id,
            createDocDto,
            req.orgUser!.id
        );
        return { doc };
    }

    @Put(':id')
    @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
    @Can('docs.edit')
    async updateDoc(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() updateDocDto: UpdateDocDto
    ) {
        return this.docsService.updateDoc(
            req.tenant!.id,
            id,
            updateDocDto,
            req.orgUser!.id
        );
    }

    @Delete(':id')
    @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
    @Can('docs.delete')
    async deleteDoc(@Req() req: Request, @Param('id') id: string) {
        return this.docsService.deleteDoc(req.tenant!.id, id, req.orgUser!.id);
    }

    // ============================================================================
    // COMPLETIONS
    // ============================================================================

    @Post(':id/complete')
    @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
    @Can('docs.completions.track')
    async completeDoc(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() completeDocDto: CompleteDocDto
    ) {
        if (!req.orgUser?.id) {
            throw new Error('User not authenticated or orgUser not found');
        }
        console.log('Complete doc - orgUser:', req.orgUser.id, 'tenant:', req.tenant!.id);
        return this.docsService.completeDoc(
            req.tenant!.id,
            id,
            req.orgUser.id,
            completeDocDto
        );
    }

    @Get('my/completions')
    @UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
    @Can('docs.view')
    async getMyCompletions(@Req() req: Request) {
        return this.docsService.getUserCompletions(req.tenant!.id, req.orgUser!.id);
    }
}
