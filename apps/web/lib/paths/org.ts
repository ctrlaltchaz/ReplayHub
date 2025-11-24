import { PERMISSIONS } from "@/lib/permissions/utils";

export type OrgSlug = string;

export const orgPath = {
  root: (slug: OrgSlug) => `/org/${slug}`,
  overview: (slug: OrgSlug) => `/org/${slug}/overview`,
  profile: (slug: OrgSlug) => `/org/${slug}/profile`,
  events: (slug: OrgSlug) => `/org/${slug}/events`,
  calendar: (slug: OrgSlug) => `/org/${slug}/calendar/week`,
  calendarWeek: (slug: OrgSlug, start?: string, days = 7, tz?: string) => {
    const qs = new URLSearchParams();
    if (start) qs.set("start", start);
    if (days !== 7) qs.set("days", String(days));
    if (tz) qs.set("tz", tz);
    const q = qs.toString();
    return `/org/${slug}/calendar/week${q ? `?${q}` : ""}`;
  },
  rosters: (slug: OrgSlug) => `/org/${slug}/rosters`,
  rosterTeams: (slug: OrgSlug) => `/org/${slug}/rosters?tab=teams`,
  rosterPlayers: (slug: OrgSlug) => `/org/${slug}/rosters?tab=players`,
  rosterLineups: (slug: OrgSlug) => `/org/${slug}/rosters?tab=lineups`,
  rosterAchievements: (slug: OrgSlug) => `/org/${slug}/rosters?tab=achievements`,
  rosterAvailability: (slug: OrgSlug) => `/org/${slug}/rosters?tab=availability`,
  playerStats: (slug: OrgSlug) => `/org/${slug}/player-stats`,
  gamelog: (slug: OrgSlug) => `/org/${slug}/gamelog`,
  runsheets: (slug: OrgSlug) => `/org/${slug}/runsheets`,
  checklists: (slug: OrgSlug) => `/org/${slug}/checklists`,
  passwords: (slug: OrgSlug) => `/org/${slug}/passwords`,
  tasks: (slug: OrgSlug) => `/org/${slug}/tasks`,
  inventory: (slug: OrgSlug) => `/org/${slug}/inventory`,
  assets: (slug: OrgSlug) => `/org/${slug}/assets`,
  incidents: (slug: OrgSlug) => `/org/${slug}/incidents`,
  attendance: (slug: OrgSlug) => `/org/${slug}/attendance`,
  reports: (slug: OrgSlug) => `/org/${slug}/reports`,
  settings: (slug: OrgSlug) => `/org/${slug}/settings`,
  admin: (slug: OrgSlug) => `/org/${slug}/admin`,
};

// Navigation configuration for sidebar/topbar
export type NavItem = {
  key: string;
  label: string;
  href: (_slug: string) => string;
  icon?: string;
  required?: string | string[];
  children?: NavItem[];
};

export const ORG_NAV: NavItem[] = [
  { key: "overview", label: "Overview", href: orgPath.overview },
  { key: "tasks", label: "Your Tasks", href: orgPath.tasks, required: PERMISSIONS.CHECKLISTS_VIEW },
  { key: "profile", label: "My Profile", href: orgPath.profile },
  { key: "events", label: "Events", href: orgPath.events, required: PERMISSIONS.EVENTS_VIEW },
  { key: "calendar", label: "Calendar", href: orgPath.calendar, required: PERMISSIONS.EVENTS_VIEW },
  {
    key: "rosters",
    label: "Rosters",
    href: orgPath.rosters,
    required: PERMISSIONS.ROSTERS_VIEW,
    children: [
      {
        key: "teams",
        label: "Teams",
        href: orgPath.rosterTeams,
        required: PERMISSIONS.ROSTERS_VIEW,
      },
      {
        key: "players",
        label: "Players",
        href: orgPath.rosterPlayers,
        required: PERMISSIONS.ROSTERS_VIEW,
      },
      {
        key: "lineups",
        label: "Lineups",
        href: orgPath.rosterLineups,
        required: PERMISSIONS.ROSTERS_VIEW,
      },
      {
        key: "achievements",
        label: "Achievements",
        href: orgPath.rosterAchievements,
        required: PERMISSIONS.ROSTERS_VIEW,
      },
      {
        key: "availability",
        label: "Availability",
        href: orgPath.rosterAvailability,
        required: PERMISSIONS.ROSTERS_VIEW,
      },
    ],
  },
  { key: "gamelog", label: "Game Log", href: orgPath.gamelog, required: PERMISSIONS.GAMELOG_VIEW },
  {
    key: "player-stats",
    label: "Player Stats",
    href: orgPath.playerStats,
    required: PERMISSIONS.ROSTERS_VIEW,
  },
  {
    key: "runsheets",
    label: "Runsheets",
    href: orgPath.runsheets,
    required: PERMISSIONS.RUNSHEETS_VIEW,
  },
  {
    key: "checklists",
    label: "Checklists",
    href: orgPath.checklists,
    required: PERMISSIONS.CHECKLISTS_VIEW,
  },
  {
    key: "passwords",
    label: "Passwords",
    href: orgPath.passwords,
    required: PERMISSIONS.PASSWORDS_VIEW,
  },
  {
    key: "inventory",
    label: "Inventory",
    href: orgPath.inventory,
    required: PERMISSIONS.INVENTORY_VIEW,
  },
  { key: "assets", label: "Assets", href: orgPath.assets, required: PERMISSIONS.ASSETS_UPLOAD },
  {
    key: "incidents",
    label: "Incidents",
    href: orgPath.incidents,
    required: PERMISSIONS.INCIDENTS_VIEW,
  },
  {
    key: "attendance",
    label: "Attendance",
    href: orgPath.attendance,
    required: PERMISSIONS.ATTENDANCE_VIEW,
  },
  {
    key: "settings",
    label: "Settings",
    href: orgPath.settings,
    required: PERMISSIONS.ORG_SETTINGS_MANAGE,
  },
];

// Global admin paths
export const adminPath = {
  root: () => "/admin",
  overview: () => "/admin/overview",
  controlCenter: () => "/admin/control-center",
  organisations: () => "/admin/organisations",
  globalUsers: () => "/admin/global-users",
  audit: () => "/admin/audit",
};

// Admin navigation configuration for global admin pages
export type AdminNavItem = {
  key: string;
  label: string;
  href: () => string;
  icon?: string;
  required?: string | string[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  { key: "control-center", label: "Control Center", href: adminPath.controlCenter },
  { key: "organisations", label: "Organizations", href: adminPath.organisations },
  { key: "global-users", label: "Global Users", href: adminPath.globalUsers },
  { key: "audit", label: "Audit Logs", href: adminPath.audit },
];
