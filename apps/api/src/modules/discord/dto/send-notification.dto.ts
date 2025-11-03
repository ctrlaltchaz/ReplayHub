import { z } from 'zod';

export const SendNotificationSchema = z.object({
    type: z.enum(['event', 'match', 'roster', 'incident']),
    title: z.string(),
    description: z.string().optional(),
    url: z.string().optional(),
    color: z.string().optional(),
    fields: z.array(z.object({
        name: z.string(),
        value: z.string(),
        inline: z.boolean().optional(),
    })).optional(),
});

export type SendNotificationDto = z.infer<typeof SendNotificationSchema>;
