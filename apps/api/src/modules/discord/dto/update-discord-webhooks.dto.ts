import { z } from 'zod';

export const UpdateDiscordChannelsSchema = z.object({
    channelEvents: z.string().optional().nullable(),
    channelMatches: z.string().optional().nullable(),
    channelRoster: z.string().optional().nullable(),
    channelIncidents: z.string().optional().nullable(),
    channelGeneral: z.string().optional().nullable(),
});

export type UpdateDiscordChannelsDto = z.infer<typeof UpdateDiscordChannelsSchema>;
