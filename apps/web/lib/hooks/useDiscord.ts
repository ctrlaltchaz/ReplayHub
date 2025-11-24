import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../api/client";

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

export interface DiscordRole {
  id: string;
  name: string;
  color?: string;
}

export interface DiscordScheduledNotification {
  id: string;
  tenantId: string;
  name: string;
  channelId: string;
  mentionRoleId?: string | null;
  mentionEveryone: boolean;
  embedTitle: string;
  embedDescription?: string | null;
  embedColor?: number | null;
  embedFields?: { name: string; value: string; inline?: boolean }[] | null;
  embedUrl?: string | null;
  timezone: string;
  firstRunAt: string;
  nextRunAt?: string | null;
  lastRunAt?: string | null;
  recurrenceType: "none" | "daily" | "weekly";
  recurrenceInterval: number;
  endAfterRuns?: number | null;
  totalRuns: number;
  status: "active" | "paused" | "completed" | "running";
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook to fetch Discord configuration
 */
export function useDiscordConfig(slug: string) {
  return useQuery<DiscordConfig>({
    queryKey: ["discord", "config", slug],
    queryFn: () => apiGet<DiscordConfig>(`/org/${slug}/discord/config`),
    retry: false,
  });
}

/**
 * Hook to fetch Discord channels
 */
export function useDiscordChannels(slug: string, enabled = true) {
  return useQuery<DiscordChannel[]>({
    queryKey: ["discord", "channels", slug],
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
      queryClient.invalidateQueries({ queryKey: ["discord", "config", slug] });
      queryClient.invalidateQueries({ queryKey: ["discord", "channels", slug] });
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
      queryClient.invalidateQueries({ queryKey: ["discord", "config", slug] });
      queryClient.invalidateQueries({ queryKey: ["discord", "channels", slug] });
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
      queryClient.invalidateQueries({ queryKey: ["discord", "config", slug] });
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
      queryClient.invalidateQueries({ queryKey: ["discord", "config", slug] });
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

/**
 * Hook to fetch Discord roles for the configured guild
 */
export function useDiscordRoles(slug: string, enabled = true) {
  return useQuery<DiscordRole[]>({
    queryKey: ["discord", "roles", slug],
    queryFn: () => apiGet<DiscordRole[]>(`/org/${slug}/discord/roles`),
    enabled,
    retry: false,
  });
}

/**
 * Hook to fetch scheduled notifications
 */
export function useScheduledNotifications(slug: string) {
  return useQuery<DiscordScheduledNotification[]>({
    queryKey: ["discord", "scheduled", slug],
    queryFn: () => apiGet<DiscordScheduledNotification[]>(`/org/${slug}/discord/notifications`),
    retry: false,
  });
}

/**
 * Hook to create a scheduled notification
 */
export function useCreateScheduledNotification(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DiscordScheduledNotification> & { firstRunAt: string }) =>
      apiPost(`/org/${slug}/discord/notifications`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discord", "scheduled", slug] });
    },
  });
}

/**
 * Hook to update a scheduled notification
 */
export function useUpdateScheduledNotification(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; data: Partial<DiscordScheduledNotification> }) =>
      apiPut(`/org/${slug}/discord/notifications/${params.id}`, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discord", "scheduled", slug] });
    },
  });
}

/**
 * Hook to update scheduled notification status (pause/resume)
 */
export function useUpdateScheduledNotificationStatus(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; status: "active" | "paused" }) =>
      apiPatch(`/org/${slug}/discord/notifications/${params.id}/status`, { status: params.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discord", "scheduled", slug] });
    },
  });
}

/**
 * Hook to delete a scheduled notification
 */
export function useDeleteScheduledNotification(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/org/${slug}/discord/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discord", "scheduled", slug] });
    },
  });
}

/**
 * Hook to run a scheduled notification immediately
 */
export function useRunScheduledNotification(slug: string) {
  return useMutation({
    mutationFn: (id: string) => apiPost(`/org/${slug}/discord/notifications/${id}/run-now`, {}),
  });
}
