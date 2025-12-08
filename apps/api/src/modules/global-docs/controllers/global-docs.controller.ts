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
import { SessionGuard } from '../../global-auth/guards/session.guard';
import {
    CreateGlobalDocCategoryDto,
    CreateGlobalDocDto,
    GlobalDocQueryDto,
    UpdateGlobalDocCategoryDto,
    UpdateGlobalDocDto,
} from '../dto';
import { GlobalDocsService } from '../services/global-docs.service';

@Controller('admin/docs')
@UseGuards(SessionGuard)
export class GlobalDocsController {
    constructor(private readonly globalDocsService: GlobalDocsService) { }

    // ============================================================================
    // CATEGORIES
    // ============================================================================

    @Get('categories')
    async getCategories() {
        return this.globalDocsService.getCategories();
    }

    @Post('categories')
    async createCategory(@Req() req: Request, @Body() dto: CreateGlobalDocCategoryDto) {
        const globalUserId = req.session.userId;
        return this.globalDocsService.createCategory(dto, globalUserId);
    }

    @Put('categories/:id')
    async updateCategory(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() dto: UpdateGlobalDocCategoryDto
    ) {
        const globalUserId = req.session.userId;
        return this.globalDocsService.updateCategory(id, dto, globalUserId);
    }

    @Delete('categories/:id')
    async deleteCategory(@Req() req: Request, @Param('id') id: string) {
        const globalUserId = req.session.userId;
        return this.globalDocsService.deleteCategory(id, globalUserId);
    }

    // ============================================================================
    // DOCS
    // ============================================================================

    @Get()
    async getDocs(@Query() query: GlobalDocQueryDto) {
        return this.globalDocsService.getDocs(query);
    }

    @Get(':id')
    async getDoc(@Param('id') id: string) {
        return this.globalDocsService.getDoc(id);
    }

    @Post()
    async createDoc(@Req() req: Request, @Body() dto: CreateGlobalDocDto) {
        const globalUserId = req.session.userId;
        const doc = await this.globalDocsService.createDoc(dto, globalUserId);
        return { doc };
    }

    @Put(':id')
    async updateDoc(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() dto: UpdateGlobalDocDto
    ) {
        const globalUserId = req.session.userId;
        return this.globalDocsService.updateDoc(id, dto, globalUserId);
    }

    @Delete(':id')
    async deleteDoc(@Req() req: Request, @Param('id') id: string) {
        const globalUserId = req.session.userId;
        return this.globalDocsService.deleteDoc(id, globalUserId);
    }

    @Get(':id/stats')
    async getDocStats(@Param('id') id: string) {
        return this.globalDocsService.getDocStats(id);
    }
}
