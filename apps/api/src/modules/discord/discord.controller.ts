import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { TenantId } from '../../common/tenant/decorators/tenant-id.decorator';
import { TenantGuard } from '../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { DiscordService } from './discord.service';
import {
    LinkDiscordServerDto,
    LinkDiscordServerSchema,
    UpdateDiscordChannelsDto,
    UpdateDiscordChannelsSchema,
    UpdateDiscordSettingsDto,
    UpdateDiscordSettingsSchema,
} from './dto';

@Controller('org/:slug/discord')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class DiscordController {
    constructor(private readonly discordService: DiscordService) { }

    /**
     * Get Discord configuration
     * GET /org/:tenantSlug/discord/config
     */
    @Get('config')
    async getConfig(@TenantId() tenantId: string) {
        return this.discordService.getConfig(tenantId);
    }

    /**
     * Link Discord server to organization
     * POST /org/:slug/discord/link
     */
    @Post('link')
    async linkServer(
        @TenantId() tenantId: string,
        @Body() dto: LinkDiscordServerDto,
    ) {
        // Validate with Zod
        const validated = LinkDiscordServerSchema.parse(dto);
        return this.discordService.linkServer(tenantId, validated);
    }

    /**
     * Update channel IDs
     * PUT /org/:slug/discord/channels
     */
    @Put('channels')
    async updateChannels(
        @TenantId() tenantId: string,
        @Body() dto: UpdateDiscordChannelsDto,
    ) {
        // Validate with Zod
        const validated = UpdateDiscordChannelsSchema.parse(dto);
        return this.discordService.updateChannels(tenantId, validated);
    }

    /**
     * Update Discord settings
     * PUT /org/:slug/discord/settings
     */
    @Put('settings')
    async updateSettings(
        @TenantId() tenantId: string,
        @Body() dto: UpdateDiscordSettingsDto,
    ) {
        // Validate with Zod
        const validated = UpdateDiscordSettingsSchema.parse(dto);
        return this.discordService.updateSettings(tenantId, validated);
    }

    /**
     * Unlink Discord server
     * DELETE /org/:slug/discord/unlink
     */
    @Delete('unlink')
    @HttpCode(HttpStatus.NO_CONTENT)
    async unlinkServer(@TenantId() tenantId: string) {
        await this.discordService.unlinkServer(tenantId);
    }

    /**
     * Send test notification
     * POST /org/:slug/discord/test
     */
    @Post('test')
    async sendTestNotification(@TenantId() tenantId: string) {
        return this.discordService.sendTestNotification(tenantId);
    }

    /**
     * Get Discord channels (list available channels)
     * GET /org/:slug/discord/channels/list
     */
    @Get('channels/list')
    async getChannels(@TenantId() tenantId: string) {
        const channels = await this.discordService.getChannels(tenantId);
        console.log(`[DiscordController] Returning ${channels.length} channels to frontend:`, JSON.stringify(channels.slice(0, 3)));
        return channels;
    }

    /**
     * Get Discord roles
     * GET /org/:slug/discord/roles
     */
    @Get('roles')
    async getRoles(@TenantId() tenantId: string) {
        return this.discordService.getRoles(tenantId);
    }
}
