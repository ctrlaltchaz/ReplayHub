import { z } from 'zod';

export const UpdateDiscordSettingsSchema = z.object({
    enableChannelNotifications: z.boolean().optional(),
    enableUserDMs: z.boolean().optional(),
    enableEventNotifications: z.boolean().optional(),
    enableMatchNotifications: z.boolean().optional(),
    enableRosterNotifications: z.boolean().optional(),
    enableIncidentNotifications: z.boolean().optional(),
});

export type UpdateDiscordSettingsDto = z.infer<typeof UpdateDiscordSettingsSchema>;
