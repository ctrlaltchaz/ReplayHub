import {
    BadRequestException,
    Controller,
    Get,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import { ExportService } from '../services/export.service';

interface RosterSheetQueryDto {
    teamId: string;
}

interface CallSheetQueryDto {
    eventId: string;
}

@Controller('org/:slug/exports')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class ExportController {
    constructor(private readonly exportService: ExportService) { }

    @Get('roster-sheet')
    @Can('reports.export')
    async getRosterSheet(
        @Req() req: Request,
        @Query() query: RosterSheetQueryDto,
        @Res() res: Response,
    ) {
        if (!query.teamId) {
            throw new BadRequestException('teamId is required');
        }

        try {
            const pdfBuffer = await this.exportService.generateRosterSheet(
                req.tenant!.id,
                query.teamId,
            );

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="roster-sheet-${query.teamId}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });

            res.send(pdfBuffer);
        } catch (error) {
            throw new BadRequestException(`Failed to generate roster sheet: ${error.message}`);
        }
    }

    @Get('call-sheet')
    @Can('reports.export')
    async getCallSheet(
        @Req() req: Request,
        @Query() query: CallSheetQueryDto,
        @Res() res: Response,
    ) {
        if (!query.eventId) {
            throw new BadRequestException('eventId is required');
        }

        try {
            const pdfBuffer = await this.exportService.generateCallSheet(
                req.tenant!.id,
                query.eventId,
            );

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="call-sheet-${query.eventId}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });

            res.send(pdfBuffer);
        } catch (error) {
            throw new BadRequestException(`Failed to generate call sheet: ${error.message}`);
        }
    }
}
