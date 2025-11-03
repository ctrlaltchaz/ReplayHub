import { z } from 'zod';

/**
 * Update Discord DM Preferences DTO
 */
export const UpdateDiscordDMPreferencesSchema = z.object({
    enableDMs: z.boolean().optional(),
    dmEvents: z.boolean().optional(),
    dmMatches: z.boolean().optional(),
    dmRoster: z.boolean().optional(),
    dmIncidents: z.boolean().optional(),
    dmPersonalOnly: z.boolean().optional(),
});

export type UpdateDiscordDMPreferencesDto = z.infer<typeof UpdateDiscordDMPreferencesSchema>;

/**
 * Discord OAuth Callback Query Params
 */
export const DiscordOAuthCallbackSchema = z.object({
    code: z.string(),
    state: z.string().optional(), // Can use for CSRF protection
});

export type DiscordOAuthCallbackDto = z.infer<typeof DiscordOAuthCallbackSchema>;
