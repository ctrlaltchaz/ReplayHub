import { z } from 'zod';

const EmbedFieldSchema = z.object({
  name: z.string().min(1).max(256),
  value: z.string().min(1).max(1024),
  inline: z.boolean().optional(),
});

const ColorSchema = z
  .union([
    z.string().regex(/^#?[0-9a-fA-F]{6}$/, 'Color must be a 6 character hex string'),
    z.number().int().min(0).max(0xffffff),
  ])
  .optional()
  .nullable();

const BaseScheduledNotificationShape = z.object({
  name: z.string().min(1).max(80),
  channelId: z.string().min(1).optional(),
  deliveryMethod: z.enum(['channel', 'dm']).default('channel'),
  title: z.string().min(1).max(256),
  description: z.string().optional().nullable(),
  url: z.string().url().optional().nullable(),
  color: ColorSchema,
  fields: z.array(EmbedFieldSchema).max(10).optional().nullable(),
  mentionRoleId: z.string().optional().nullable(),
  mentionEveryone: z.boolean().optional(),
  timezone: z.string().min(1),
  firstRunAt: z.string().min(1),
  recurrenceType: z.enum(['none', 'daily', 'weekly']).default('none'),
  recurrenceInterval: z.number().int().min(1).max(30).optional(),
  endAfterRuns: z.number().int().min(1).max(365).optional().nullable(),
});

const withDeliveryRefinements = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((val: any, ctx) => {
    if (val.deliveryMethod === 'channel' && val.channelId === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Channel is required for channel delivery',
        path: ['channelId'],
      });
    }
    if (val.deliveryMethod === 'dm') {
      if (val.mentionEveryone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mentions are not supported for direct messages',
          path: ['mentionEveryone'],
        });
      }
      if (val.mentionRoleId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mentions are not supported for direct messages',
          path: ['mentionRoleId'],
        });
      }
    }
  });

const BaseScheduledNotificationSchema = withDeliveryRefinements(BaseScheduledNotificationShape);

export const CreateScheduledNotificationSchema = BaseScheduledNotificationSchema;
export type CreateScheduledNotificationDto = z.infer<typeof CreateScheduledNotificationSchema>;

export const UpdateScheduledNotificationSchema = withDeliveryRefinements(
  BaseScheduledNotificationShape.partial()
);
export type UpdateScheduledNotificationDto = z.infer<typeof UpdateScheduledNotificationSchema>;

export const UpdateScheduledNotificationStatusSchema = z.object({
  status: z.enum(['active', 'paused']),
});
export type UpdateScheduledNotificationStatusDto = z.infer<
  typeof UpdateScheduledNotificationStatusSchema
>;
