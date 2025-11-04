import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Put,
    Query,
    Redirect,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { GlobalUserId } from '../../common/decorators/global-user.decorator';
import { SessionGuard } from '../global-auth/guards/session.guard';
import { DiscordService } from './discord.service';
import {
    DiscordOAuthCallbackSchema,
    UpdateDiscordDMPreferencesDto,
    UpdateDiscordDMPreferencesSchema,
} from './dto';

/**
 * User-level Discord linking controller
 * For personal Discord account linking and DM preferences
 */
@Controller('user/discord')
@UseGuards(SessionGuard)
export class UserDiscordController {
    constructor(private readonly discordService: DiscordService) { }

    /**
     * Get user's Discord link status and preferences
     * GET /user/discord/link
     */
    @Get('link')
    @HttpCode(HttpStatus.OK)
    async getLink(@GlobalUserId() globalUserId: string) {
        const link = await this.discordService.getUserDiscordLink(globalUserId);

        // Return 404 if no link exists (frontend expects this)
        if (!link) {
            throw new HttpException('Discord account not linked', HttpStatus.NOT_FOUND);
        }

        return link;
    }

    /**
     * Initiate Discord OAuth2 flow
     * GET /user/discord/auth
     */
    @Get('auth')
    @Redirect()
    authDiscord(@Req() req: any) {
        console.log('[Discord OAuth Auth] Initiating OAuth flow');
        console.log('[Discord OAuth Auth] Session userId:', req.session?.userId);

        // Discord should redirect to the BACKEND callback endpoint
        const apiUrl = process.env.API_URL || 
                       (process.env.FRONTEND_URL?.replace('app.', 'api.') || 'http://localhost:3001');
        const redirectUri = `${apiUrl}/api/user/discord/callback`;
        const state = req.session?.userId; // Use user ID as state for CSRF protection

        console.log('[Discord OAuth Auth] Redirect URI:', redirectUri);
        console.log('[Discord OAuth Auth] State:', state);

        const authUrl = this.discordService.getDiscordAuthUrl(redirectUri, state);

        console.log('[Discord OAuth Auth] Generated auth URL:', authUrl);

        return { url: authUrl };
    }    /**
     * Discord OAuth2 callback
     * GET /user/discord/callback?code=xxx&state=xxx
     */
    @Get('callback')
    async callback(
        @GlobalUserId() globalUserId: string,
        @Query() query: any,
        @Res() res: Response,
    ) {
        console.log('[Discord OAuth Callback] Started');
        console.log('[Discord OAuth Callback] globalUserId:', globalUserId);
        console.log('[Discord OAuth Callback] query:', query);

        try {
            // Validate query params
            const validated = DiscordOAuthCallbackSchema.parse(query);
            console.log('[Discord OAuth Callback] Validated query params:', validated);

            const apiUrl = process.env.API_URL || 
                           (process.env.FRONTEND_URL?.replace('app.', 'api.') || 'http://localhost:3001');
            const redirectUri = `${apiUrl}/api/user/discord/callback`;
            console.log('[Discord OAuth Callback] Using redirect URI:', redirectUri);

            await this.discordService.linkUserDiscord(
                globalUserId,
                validated.code,
                redirectUri,
            );

            console.log('[Discord OAuth Callback] Successfully linked Discord account');

            // Redirect to frontend callback page with success
            res.redirect(`${process.env.FRONTEND_URL}/discord-callback?success=true`);
        } catch (error) {
            console.error('[Discord OAuth Callback] Error occurred:', error);
            console.error('[Discord OAuth Callback] Error message:', error?.message);
            console.error('[Discord OAuth Callback] Error stack:', error?.stack);

            // Redirect to frontend callback page with error
            res.redirect(`${process.env.FRONTEND_URL}/discord-callback?error=true`);
        }
    }

    /**
     * Unlink Discord account
     * DELETE /user/discord/link
     */
    @Delete('link')
    @HttpCode(HttpStatus.NO_CONTENT)
    async unlinkDiscord(@GlobalUserId() globalUserId: string) {
        await this.discordService.unlinkUserDiscord(globalUserId);
    }

    /**
     * Update DM preferences
     * PUT /user/discord/preferences
     */
    @Put('preferences')
    async updatePreferences(
        @GlobalUserId() globalUserId: string,
        @Body() dto: UpdateDiscordDMPreferencesDto,
    ) {
        // Validate with Zod
        const validated = UpdateDiscordDMPreferencesSchema.parse(dto);
        return this.discordService.updateUserDMPreferences(globalUserId, validated);
    }
}
