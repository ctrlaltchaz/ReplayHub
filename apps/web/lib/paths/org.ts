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
  playerStats: (slug: OrgSlug) => `/org/${slug}/player-stats`,
  gamelog: (slug: OrgSlug) => `/org/${slug}/gamelog`,
  liveGraphics: (slug: OrgSlug) => `/org/${slug}/live-graphics`,
  displayBoards: (slug: OrgSlug) => `/org/${slug}/display-boards`,
  runsheets: (slug: OrgSlug) => `/org/${slug}/runsheets`,
  checklists: (slug: OrgSlug) => `/org/${slug}/checklists`,
  passwords: (slug: OrgSlug) => `/org/${slug}/passwords`,
  tasks: (slug: OrgSlug) => `/org/${slug}/tasks`,
  inventory: (slug: OrgSlug) => `/org/${slug}/inventory`,
  assets: (slug: OrgSlug) => `/org/${slug}/assets`,
  incidents: (slug: OrgSlug) => `/org/${slug}/incidents`,
  improvements: (slug: OrgSlug) => `/org/${slug}/improvements`,
  attendance: (slug: OrgSlug) => `/org/${slug}/attendance`,
  reports: (slug: OrgSlug) => `/org/${slug}/reports`,
  docs: (slug: OrgSlug) => `/org/${slug}/docs`,
  settings: (slug: OrgSlug) => `/org/${slug}/settings`,
  admin: (slug: OrgSlug) => `/org/${slug}/admin`,
  socialMedia: (slug: OrgSlug) => `/org/${slug}/social-media`,
  crewTemplates: (slug: OrgSlug) => `/org/${slug}/crew-templates`,
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
  {
    key: "attendance",
    label: "Attendance",
    href: orgPath.attendance,
    required: PERMISSIONS.ATTENDANCE_VIEW,
  },
  {
    key: "events",
    label: "Events",
    href: orgPath.events,
    required: PERMISSIONS.EVENTS_VIEW,
    children: [
      {
        key: "events-list",
        label: "Event Manager",
        href: orgPath.events,
        required: PERMISSIONS.EVENTS_VIEW,
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
        key: "calendar",
        label: "Calendar",
        href: orgPath.calendar,
        required: PERMISSIONS.EVENTS_VIEW,
      },
      {
        key: "crew-templates",
        label: "Crew Management",
        href: orgPath.crewTemplates,
        required: PERMISSIONS.EVENTS_MANAGE,
      },
    ],
  },
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
    ],
  },
  {
    key: "gamelog",
    label: "Game Log",
    href: orgPath.gamelog,
    required: PERMISSIONS.GAMELOG_VIEW,
    children: [
      {
        key: "gamelog-list",
        label: "Game Logging",
        href: orgPath.gamelog,
        required: PERMISSIONS.GAMELOG_VIEW,
      },
      {
        key: "player-stats",
        label: "Player Stats",
        href: orgPath.playerStats,
        required: PERMISSIONS.ROSTERS_VIEW,
      },
    ],
  },
  {
    key: "social-media",
    label: "Social Media",
    href: orgPath.socialMedia,
    children: [
      {
        key: "social-media-coming-soon",
        label: "Features Coming Soon",
        href: orgPath.socialMedia,
      },
    ],
  },
  {
    key: "utilities",
    label: "Utilities",
    href: orgPath.liveGraphics,
    required: [
      PERMISSIONS.LIVE_GRAPHICS_VIEW,
      PERMISSIONS.PASSWORDS_VIEW,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INCIDENTS_VIEW,
      PERMISSIONS.IMPROVEMENTS_VIEW,
    ],
    children: [
      {
        key: "live-graphics",
        label: "Live Graphics",
        href: orgPath.liveGraphics,
        required: PERMISSIONS.LIVE_GRAPHICS_VIEW,
      },
      {
        key: "display-boards",
        label: "Display Boards",
        href: orgPath.displayBoards,
        required: PERMISSIONS.DISPLAY_BOARDS.VIEW,
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
      {
        key: "incidents",
        label: "Incidents",
        href: orgPath.incidents,
        required: PERMISSIONS.INCIDENTS_VIEW,
      },
      {
        key: "improvements",
        label: "Improvements",
        href: orgPath.improvements,
        required: PERMISSIONS.IMPROVEMENTS_VIEW,
      },
    ],
  },
  { key: "assets", label: "Assets", href: orgPath.assets, required: PERMISSIONS.ASSETS_UPLOAD },
  { key: "docs", label: "Documentation", href: orgPath.docs, required: PERMISSIONS.DOCS_VIEW },
  {
    key: "settings",
    label: "Admin / Settings",
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
  docs: () => "/admin/docs",
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
  { key: "docs", label: "Documentation", href: adminPath.docs },
  { key: "audit", label: "Audit Logs", href: adminPath.audit },
];
