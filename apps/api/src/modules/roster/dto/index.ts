import { z } from 'zod';

// Team DTOs
export const CreateTeamDto = z.object({
    name: z.string().min(1).max(100),
    game: z.string().min(1).max(50),
    season: z.string().max(20).optional(),
    coachId: z.string().optional(),
    captainId: z.string().optional(),
});

export const UpdateTeamDto = z.object({
    name: z.string().min(1).max(100).optional(),
    game: z.string().min(1).max(50).optional(),
    season: z.string().max(20).optional(),
    coachId: z.string().optional(),
    captainId: z.string().optional(),
    status: z.enum(['active', 'archived']).optional(),
});

export const TeamQueryDto = z.object({
    game: z.string().optional(),
    season: z.string().optional(),
    status: z.enum(['active', 'archived']).optional(),
    q: z.string().optional(), // search term
});

// Player DTOs
export const CreatePlayerDto = z.object({
    gamerTag: z.string().min(1).max(50),
    realName: z.string().max(100).optional(),
    orgUserId: z.string().optional(),
    role: z.string().max(50).optional(),
    rank: z.string().max(30).optional(),
    mains: z.array(z.string()).optional(),
    bio: z.string().max(500).optional(),
    socials: z.record(z.string()).optional(),
    eligibility: z.enum(['eligible', 'probation', 'ineligible']).optional(),
    consent: z.record(z.any()).optional(),
    teamId: z.string().optional(),
});

export const UpdatePlayerDto = z.object({
    gamerTag: z.string().min(1).max(50).optional(),
    realName: z.string().max(100).optional(),
    orgUserId: z.string().optional(),
    role: z.string().max(50).optional(),
    rank: z.string().max(30).optional(),
    mains: z.array(z.string()).optional(),
    bio: z.string().max(500).optional(),
    socials: z.record(z.string()).optional(),
    eligibility: z.enum(['eligible', 'probation', 'ineligible']).optional(),
    consent: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
    statsVisible: z.boolean().optional(),
    teamId: z.string().optional(),
});

export const PlayerQueryDto = z.object({
    q: z.string().optional(),
    active: z.preprocess(
        (val) => {
            if (val === 'true') return true;
            if (val === 'false') return false;
            if (typeof val === 'boolean') return val;
            return undefined;
        },
        z.boolean().optional()
    ),
    teamId: z.string().optional(),
    eligibility: z.enum(['eligible', 'probation', 'ineligible']).optional(),
});

export const LinkPlayerToUserDto = z.object({
    email: z.string().email().optional(),
    userId: z.string().optional(),
}).refine(data => data.email || data.userId, {
    message: "Either email or userId must be provided"
});

// Team Member DTOs
export const AddTeamMemberDto = z.object({
    playerId: z.string(),
    isStarter: z.boolean().optional(),
    position: z.string().max(50).optional(),
});

export const UpdateTeamMemberDto = z.object({
    isStarter: z.boolean().optional(),
    position: z.string().max(50).optional(),
});

// Availability DTOs
export const SetAvailabilityDto = z.object({
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    status: z.enum(['available', 'unsure', 'unavailable']),
    note: z.string().max(200).optional(),
});

export const AvailabilityQueryDto = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    teamId: z.string().optional(),
});

// Lineup DTOs
export const CreateLineupDto = z.object({
    teamId: z.string(),
    title: z.string().max(100).optional(),
});

export const UpdateLineupDto = z.object({
    title: z.string().max(100).optional(),
});

export const LineupSlotDto = z.object({
    playerId: z.string(),
    role: z.string().max(50).optional(),
    isSub: z.boolean().optional(),
    notes: z.string().max(200).optional(),
    idx: z.number().min(0).optional(),
});

export const SetLineupSlotsDto = z.object({
    slots: z.array(LineupSlotDto),
    autoAttachMissing: z.boolean().optional().default(false),
});

// Achievement DTOs
export const CreateAchievementDto = z.object({
    teamId: z.string().optional(),
    playerId: z.string().optional(),
    title: z.string().min(1).max(200),
    eventRef: z.string().max(100).optional(),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    details: z.string().max(500).optional(),
}).refine(data => data.teamId || data.playerId, {
    message: "Either teamId or playerId must be provided"
});

export const AchievementQueryDto = z.object({
    teamId: z.string().optional(),
    playerId: z.string().optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Export DTOs
export const RosterSheetQueryDto = z.object({
    teamId: z.string(),
});

export const CallSheetQueryDto = z.object({
    eventId: z.string(),
});

// Type exports
export type CreateTeamDto = z.infer<typeof CreateTeamDto>;
export type UpdateTeamDto = z.infer<typeof UpdateTeamDto>;
export type TeamQueryDto = z.infer<typeof TeamQueryDto>;
export type CreatePlayerDto = z.infer<typeof CreatePlayerDto>;
export type UpdatePlayerDto = z.infer<typeof UpdatePlayerDto>;
export type PlayerQueryDto = z.infer<typeof PlayerQueryDto>;
export type LinkPlayerToUserDto = z.infer<typeof LinkPlayerToUserDto>;
export type AddTeamMemberDto = z.infer<typeof AddTeamMemberDto>;
export type UpdateTeamMemberDto = z.infer<typeof UpdateTeamMemberDto>;
export type SetAvailabilityDto = z.infer<typeof SetAvailabilityDto>;
export type AvailabilityQueryDto = z.infer<typeof AvailabilityQueryDto>;
export type CreateLineupDto = z.infer<typeof CreateLineupDto>;
export type UpdateLineupDto = z.infer<typeof UpdateLineupDto>;
export type LineupSlotDto = z.infer<typeof LineupSlotDto>;
export type SetLineupSlotsDto = z.infer<typeof SetLineupSlotsDto>;
export type CreateAchievementDto = z.infer<typeof CreateAchievementDto>;
export type AchievementQueryDto = z.infer<typeof AchievementQueryDto>;
export type RosterSheetQueryDto = z.infer<typeof RosterSheetQueryDto>;
export type CallSheetQueryDto = z.infer<typeof CallSheetQueryDto>;