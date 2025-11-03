import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TenantGuard } from '../../common/tenant/guards/tenant.guard';
import { DemoService } from './demo.service';
import { CreateNoteDto, NoteDto } from './dto';

@Controller('org/:slug/_demo/notes')
@UseGuards(TenantGuard)
export class DemoController {
    constructor(private demoService: DemoService) { }

    @Post()
    async createNote(
        @Body() createNoteDto: CreateNoteDto,
        @Req() req: Request,
    ): Promise<{ note: NoteDto }> {
        const note = await this.demoService.createNote(
            createNoteDto,
            req.tenant!.id,
            req.session.userId!,
        );

        return { note };
    }

    @Get()
    async getNotes(@Req() req: Request): Promise<{ notes: NoteDto[] }> {
        const notes = await this.demoService.getNotes(req.tenant!.id);
        return { notes };
    }

    @Get('/debug')
    async debugContext(@Req() req: Request): Promise<{ context: any }> {
        const context = await this.demoService.debugContext(req.tenant?.id);
        return { context };
    }
}