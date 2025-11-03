import { z } from 'zod';

export const LinkDiscordServerSchema = z.object({
    botToken: z.string().optional(),
    guildId: z.string().optional(),
});

export type LinkDiscordServerDto = z.infer<typeof LinkDiscordServerSchema>;
