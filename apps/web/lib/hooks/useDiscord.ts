import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client';

interface DiscordConfig {
    id?: string;
    tenantId: string;
    botToken?: string;
    guildId?: string;
    guildName?: string;
    channelEvents?: string;
    channelMatches?: string;
    channelRoster?: string;
    channelIncidents?: string;
    channelGeneral?: string;
    enableChannelNotifications: boolean;
    enableUserDMs: boolean;
    enableEventNotifications: boolean;
    enableMatchNotifications: boolean;
    enableRosterNotifications: boolean;
    enableIncidentNotifications: boolean;
}

interface DiscordChannel {
    id: string;
    name: string;
    type: number;
}

/**
 * Hook to fetch Discord configuration
 */
export function useDiscordConfig(slug: string) {
    return useQuery<DiscordConfig>({
        queryKey: ['discord', 'config', slug],
        queryFn: () => apiGet<DiscordConfig>(`/org/${slug}/discord/config`),
        retry: false,
    });
}

/**
 * Hook to fetch Discord channels
 */
export function useDiscordChannels(slug: string, enabled = true) {
    return useQuery<DiscordChannel[]>({
        queryKey: ['discord', 'channels', slug],
        queryFn: () => apiGet<DiscordChannel[]>(`/org/${slug}/discord/channels/list`),
        enabled,
        retry: false,
    });
}

/**
 * Hook to link Discord server
 */
export function useLinkDiscord(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { botToken: string; guildId: string }) =>
            apiPost(`/org/${slug}/discord/link`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discord', 'config', slug] });
            queryClient.invalidateQueries({ queryKey: ['discord', 'channels', slug] });
        },
    });
}

/**
 * Hook to unlink Discord server
 */
export function useUnlinkDiscord(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => apiDelete(`/org/${slug}/discord/unlink`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discord', 'config', slug] });
            queryClient.invalidateQueries({ queryKey: ['discord', 'channels', slug] });
        },
    });
}

/**
 * Hook to update Discord channel assignments
 */
export function useUpdateChannels(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            channelEvents?: string | null;
            channelMatches?: string | null;
            channelRoster?: string | null;
            channelIncidents?: string | null;
            channelGeneral?: string | null;
        }) => apiPut(`/org/${slug}/discord/channels`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discord', 'config', slug] });
        },
    });
}

/**
 * Hook to update Discord notification settings
 */
export function useUpdateDiscordSettings(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            enableEventNotifications?: boolean;
            enableMatchNotifications?: boolean;
            enableRosterNotifications?: boolean;
            enableIncidentNotifications?: boolean;
        }) => apiPut(`/org/${slug}/discord/settings`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discord', 'config', slug] });
        },
    });
}

/**
 * Hook to send test Discord notification
 */
export function useTestDiscordNotification(slug: string) {
    return useMutation({
        mutationFn: () => apiPost(`/org/${slug}/discord/test`, {}),
    });
}
