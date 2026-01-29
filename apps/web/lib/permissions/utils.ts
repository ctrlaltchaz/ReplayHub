import { PermissionKey } from "@/lib/auth/session";

/**
 * Centralized permission checking utilities
 * Provides consistent permission validation across all components
 */

export type PermissionRequirement = string | string[] | undefined;

/**
 * Check if user has the required permission(s)
 *
 * @param userPermissions - Array of permissions the user has
 * @param required - Permission requirement (string, array of strings, or undefined)
 * @returns boolean - True if user has required permissions
 */
export function hasPermission(
  userPermissions: PermissionKey[],
  required?: PermissionRequirement
): boolean {
  // No permission required - allow access
  if (!required) {
    return true;
  }

  // Handle array of permissions (user needs ANY of them)
  if (Array.isArray(required)) {
    return required.some((perm) => userPermissions.includes(perm));
  }

  // Handle single permission requirement
  return userPermissions.includes(required);
}

/**
 * Check if user has ALL of the required permissions
 *
 * @param userPermissions - Array of permissions the user has
 * @param required - Array of permissions that are ALL required
 * @returns boolean - True if user has all required permissions
 */
export function hasAllPermissions(userPermissions: PermissionKey[], required: string[]): boolean {
  return required.every((perm) => userPermissions.includes(perm));
}

/**
 * Check if user has global admin permissions
 *
 * @param globalUser - Global user object (null if not logged in globally)
 * @returns boolean - True if user is a global admin
 */
export function isGlobalAdmin(globalUser: any): boolean {
  return !!globalUser; // For now, any global user is considered admin
}

/**
 * Check if user has specific org-level admin permissions
 *
 * @param userPermissions - Array of permissions the user has
 * @param orgPermission - Specific org permission to check (defaults to 'org.admin')
 * @returns boolean - True if user has org admin permissions
 */
export function isOrgAdmin(
  userPermissions: PermissionKey[],
  orgPermission: string = "org.admin"
): boolean {
  return userPermissions.includes(orgPermission);
}

/**
 * Filter navigation items based on user permissions
 *
 * @param items - Array of navigation items with 'required' permission property
 * @param userPermissions - Array of permissions the user has
 * @param globalUser - Global user object for global admin checks
 * @returns Filtered array of navigation items
 */
export function filterNavByPermissions<
  T extends { required?: PermissionRequirement; globalAdminOnly?: boolean },
>(items: T[], userPermissions: PermissionKey[], globalUser?: any): T[] {
  return items.filter((item) => {
    // Check global admin requirement
    if (item.globalAdminOnly && !isGlobalAdmin(globalUser)) {
      return false;
    }

    // Check permission requirement
    return hasPermission(userPermissions, item.required);
  });
}

/**
 * Permission constants for common use cases
 */
export const PERMISSIONS = {
  // Organization management
  ORG_ADMIN: "org.admin" as const,
  ORG_SETTINGS_MANAGE: "org.settings.manage" as const,
  ORG_SETTINGS_VIEW: "org.settings.view" as const,
  ORG_USERS_MANAGE: "org.users.manage" as const,
  ORG_USERS_VIEW: "org.users.view" as const,
  ORG_ROLES_MANAGE: "org.roles.manage" as const,
  ORG_ROLES_VIEW: "org.roles.view" as const,

  // Events and calendar
  EVENTS_VIEW: "events.view" as const,
  EVENTS_CREATE: "events.create" as const,
  EVENTS_EDIT: "events.edit" as const,
  EVENTS_DELETE: "events.delete" as const,
  EVENTS_MANAGE: "events.manage" as const,
  CALENDAR_VIEW: "calendar.view" as const,
  CALENDAR_MANAGE: "calendar.manage" as const,

  // Teams and rosters
  ROSTERS_VIEW: "roster.view" as const,
  ROSTERS_MANAGE: "roster.manage" as const,
  TEAM_CREATE: "team.create" as const,
  TEAM_UPDATE: "team.update" as const,
  TEAM_DELETE: "team.delete" as const,
  TEAM_ARCHIVE: "team.archive" as const,
  TEAM_SELECT_LINEUP: "team.select_lineup" as const,

  // Players
  PLAYER_CREATE: "player.create" as const,
  PLAYER_UPDATE: "player.update" as const,
  PLAYER_DELETE: "player.delete" as const,
  PLAYER_LINK_USER: "player.link_user" as const,
  PLAYERS_VIEW: "players.view" as const,
  PLAYERS_EDIT_PROFILE_SELF: "players.edit_profile_self" as const,
  PLAYERS_EDIT_ADMIN: "players.edit_admin" as const,

  // Lineups
  LINEUP_CREATE: "lineup.create" as const,
  LINEUP_UPDATE: "lineup.update" as const,
  LINEUP_PUBLISH: "lineup.publish" as const,

  // Achievements
  ACHIEVEMENT_CREATE: "achievement.create" as const,
  ACHIEVEMENT_APPROVE: "achievement.approve" as const,
  ACHIEVEMENTS_CREATE: "achievements.create" as const,
  ACHIEVEMENTS_APPROVE: "achievements.approve" as const,

  // Availability
  AVAILABILITY_MANAGE: "availability.manage" as const,
  AVAILABILITY_SET_SELF: "availability.set_self" as const,

  // Game logs and results
  GAMELOG_VIEW: "gamelog.view" as const,
  GAMELOG_MANAGE: "gamelog.manage" as const,
  GAMELOG_APPROVE: "gamelog.approve" as const,

  // Stats
  STATS_RECORD: "stats.record" as const,
  STATS_EDIT: "stats.edit" as const,
  STATS_APPROVE: "stats.approve" as const,

  // Inventory and assets
  INVENTORY_VIEW: "inventory.view" as const,
  INVENTORY_UPDATE: "inventory.update" as const,
  INVENTORY_BOOK: "inventory.book" as const,
  INVENTORY_MANAGE: "inventory.manage" as const,
  ASSETS_UPLOAD: "assets.upload" as const,
  ASSETS_APPROVE: "assets.approve" as const,
  ASSETS_MANAGE: "assets.manage" as const,

  // Incidents and reports
  INCIDENTS_VIEW: "incidents.view" as const,
  INCIDENTS_CREATE: "incidents.create" as const,
  INCIDENTS_MANAGE: "incidents.manage" as const,
  IMPROVEMENTS_VIEW: "improvements.view" as const,
  IMPROVEMENTS_CREATE: "improvements.create" as const,
  IMPROVEMENTS_EDIT: "improvements.edit" as const,
  IMPROVEMENTS_MANAGE: "improvements.manage" as const,
  IMPROVEMENTS_DELETE: "improvements.delete" as const,
  REPORTS_VIEW: "reports.view" as const,
  REPORTS_EXPORT: "reports.export" as const,
  ATTENDANCE_VIEW: "attendance.view" as const,
  ATTENDANCE_MANAGE: "attendance.manage" as const,
  ATTENDANCE_EXPORT: "attendance.export" as const,
  LIVE_GRAPHICS_VIEW: "live-graphics.view" as const,
  LIVE_GRAPHICS_MANAGE: "live-graphics.manage" as const,

  // Runsheets and checklists
  RUNSHEETS_VIEW: "runsheet.view" as const,
  RUNSHEETS_EDIT: "runsheet.edit" as const,
  RUNSHEETS_APPROVE: "runsheet.approve" as const,
  RUNSHEETS_LOCK: "runsheet.lock" as const,
  CHECKLISTS_VIEW: "checklists.view" as const,
  CHECKLISTS_RUN: "checklists.run" as const,
  CHECKLISTS_MANAGE: "checklists.manage" as const,
  PASSWORDS_VIEW: "passwords.view" as const,
  PASSWORDS_MANAGE: "passwords.manage" as const,
  RESOURCES_VIEW: "resources.view" as const,
  RESOURCES_MANAGE: "resources.manage" as const,

  // Documentation
  DOCS_VIEW: "docs.view" as const,
  DOCS_CREATE: "docs.create" as const,
  DOCS_EDIT: "docs.edit" as const,
  DOCS_DELETE: "docs.delete" as const,
  DOCS_MANAGE: "docs.manage" as const,
  DOCS_COMPLETIONS_TRACK: "docs.completions.track" as const,

  // Display Boards
  DISPLAY_BOARDS: {
    VIEW: "display-boards.view" as const,
    MANAGE: "display-boards.manage" as const,
  },

  // Users and invites
  USERS_VIEW: "users.view" as const,
  USERS_READ: "users.read" as const,
  USERS_CREATE: "users.create" as const,
  USERS_UPDATE: "users.update" as const,
  USERS_DELETE: "users.delete" as const,
  INVITES_CREATE: "invites.create" as const,
  INVITES_READ: "invites.read" as const,
  INVITES_DELETE: "invites.delete" as const,

  // Global admin permissions
  GLOBAL_ADMIN: "global.admin" as const,
  GLOBAL_USERS_MANAGE: "global.users.manage" as const,
  GLOBAL_ORGS_MANAGE: "global.orgs.manage" as const,
  GLOBAL_IMPERSONATE: "global.impersonate" as const,
} as const;

/**
 * Permission groups for easier management
 */
export const PERMISSION_GROUPS = {
  ORG_ADMINS: [PERMISSIONS.ORG_ADMIN, PERMISSIONS.ORG_SETTINGS_MANAGE] as const,
  EVENT_MANAGERS: [PERMISSIONS.EVENTS_MANAGE, PERMISSIONS.CALENDAR_MANAGE] as const,
  ROSTER_MANAGERS: [PERMISSIONS.ROSTERS_MANAGE] as const,
  ASSET_MANAGERS: [PERMISSIONS.INVENTORY_MANAGE, PERMISSIONS.ASSETS_MANAGE] as const,
  GLOBAL_ADMINS: [
    PERMISSIONS.GLOBAL_ADMIN,
    PERMISSIONS.GLOBAL_USERS_MANAGE,
    PERMISSIONS.GLOBAL_ORGS_MANAGE,
  ] as const,
} as const;
