import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SessionGuard } from '../global-auth/guards/session.guard';
import { CreateOrgDto, OrganisationDto } from './dto';
import { GlobalOrganisationsService } from './global-organisations.service';

@Controller('global/orgs')
@UseGuards(SessionGuard)
export class GlobalOrganisationsController {
    constructor(private globalOrganisationsService: GlobalOrganisationsService) { }

    @Post()
    async createOrganisation(
        @Body() createOrgDto: CreateOrgDto,
        @Req() req: Request,
    ): Promise<{ organisation: OrganisationDto }> {
        const organisation = await this.globalOrganisationsService.create(
            createOrgDto,
            req.session.userId!,
        );

        return { organisation };
    }

    @Get()
    async getUserOrganisations(@Req() req: Request): Promise<{ organisations: OrganisationDto[] }> {
        const organisations = await this.globalOrganisationsService.findAll(
            req.session.userId!,
        );

        return { organisations };
    }

    @Get(':slug')
    async getOrganisationBySlug(
        @Param('slug') slug: string,
        @Req() req: Request,
    ): Promise<{ organisation: OrganisationDto }> {
        const organisation = await this.globalOrganisationsService.findBySlug(
            slug,
            req.session.userId!,
        );

        return { organisation };
    }
}