export interface PermissionDefinition {
  key: string;
  group: string;
  description: string;
}

export const DEFAULT_PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  { key: 'calendar', group: 'calendar', description: 'Access calendar module' },
  { key: 'calendar.view', group: 'calendar', description: 'View calendar events' },
  { key: 'calendar.manage', group: 'calendar', description: 'Manage calendar settings and events' },

  { key: 'events', group: 'events', description: 'Access events module' },
  { key: 'events.view', group: 'events', description: 'View events' },
  { key: 'events.create', group: 'events', description: 'Create new events' },
  { key: 'events.edit', group: 'events', description: 'Edit existing events' },
  { key: 'events.delete', group: 'events', description: 'Delete events' },
  { key: 'events.manage', group: 'events', description: 'Manage all event operations' },

  { key: 'runsheet', group: 'runsheet', description: 'Access runsheet module' },
  { key: 'runsheet.view', group: 'runsheet', description: 'View runsheets' },
  { key: 'runsheet.edit', group: 'runsheet', description: 'Edit runsheets' },
  { key: 'runsheet.approve', group: 'runsheet', description: 'Approve runsheets' },
  { key: 'runsheet.lock', group: 'runsheet', description: 'Lock runsheets' },

  { key: 'resources', group: 'resources', description: 'Access resources module' },
  { key: 'resources.view', group: 'resources', description: 'View resources' },
  { key: 'resources.manage', group: 'resources', description: 'Manage resources' },

  { key: 'checklists', group: 'checklists', description: 'Access checklists module' },
  { key: 'checklists.view', group: 'checklists', description: 'View checklists' },
  { key: 'checklists.run', group: 'checklists', description: 'Execute checklists' },
  { key: 'checklists.manage', group: 'checklists', description: 'Manage checklist templates' },

  { key: 'passwords', group: 'passwords', description: 'Access password manager' },
  { key: 'passwords.view', group: 'passwords', description: 'View vault entries' },
  {
    key: 'passwords.manage',
    group: 'passwords',
    description: 'Create, edit, and delete vault entries',
  },

  { key: 'inventory', group: 'inventory', description: 'Access inventory module' },
  { key: 'inventory.view', group: 'inventory', description: 'View inventory items' },
  { key: 'inventory.update', group: 'inventory', description: 'Update inventory status' },
  { key: 'inventory.book', group: 'inventory', description: 'Book inventory items' },
  { key: 'inventory.manage', group: 'inventory', description: 'Manage inventory items' },

  { key: 'assets', group: 'assets', description: 'Access assets module' },
  { key: 'assets.upload', group: 'assets', description: 'Upload assets' },
  { key: 'assets.approve', group: 'assets', description: 'Approve assets' },
  { key: 'assets.manage', group: 'assets', description: 'Manage asset library' },

  { key: 'roster', group: 'roster', description: 'Access roster module' },
  { key: 'roster.view', group: 'roster', description: 'View team rosters' },
  { key: 'roster.manage', group: 'roster', description: 'Manage team rosters' },
  { key: 'team.create', group: 'roster', description: 'Create teams' },
  { key: 'team.update', group: 'roster', description: 'Update teams' },
  { key: 'team.delete', group: 'roster', description: 'Delete teams' },
  { key: 'team.archive', group: 'roster', description: 'Archive teams' },
  { key: 'team.select_lineup', group: 'roster', description: 'Select team lineups' },

  { key: 'player.create', group: 'players', description: 'Create players' },
  { key: 'player.update', group: 'players', description: 'Update player profiles' },
  { key: 'player.delete', group: 'players', description: 'Delete players' },
  { key: 'player.link_user', group: 'players', description: 'Link players to organisation users' },
  { key: 'players.view', group: 'players', description: 'View player profiles' },
  { key: 'players.edit_profile_self', group: 'players', description: 'Edit own player profile' },
  { key: 'players.edit_admin', group: 'players', description: 'Edit any player profile' },

  { key: 'availability.manage', group: 'availability', description: 'Manage player availability' },
  { key: 'availability.set_self', group: 'availability', description: 'Set own availability' },

  { key: 'lineup.create', group: 'lineup', description: 'Create lineups' },
  { key: 'lineup.update', group: 'lineup', description: 'Update lineups' },
  { key: 'lineup.publish', group: 'lineup', description: 'Publish lineups' },

  { key: 'achievement.create', group: 'achievements', description: 'Create achievements' },
  { key: 'achievement.approve', group: 'achievements', description: 'Approve achievements' },
  {
    key: 'achievements.create',
    group: 'achievements',
    description: 'Create achievements (legacy scope)',
  },
  {
    key: 'achievements.approve',
    group: 'achievements',
    description: 'Approve achievements (legacy scope)',
  },

  { key: 'gamelog', group: 'gamelog', description: 'Access gamelog module' },
  { key: 'gamelog.view', group: 'gamelog', description: 'View match logs and results' },
  { key: 'gamelog.manage', group: 'gamelog', description: 'Manage match logs' },
  { key: 'gamelog.approve', group: 'gamelog', description: 'Approve match logs' },

  { key: 'stats', group: 'stats', description: 'Access statistics module' },
  { key: 'stats.record', group: 'stats', description: 'Record statistics' },
  { key: 'stats.edit', group: 'stats', description: 'Edit statistics' },
  { key: 'stats.approve', group: 'stats', description: 'Approve statistics' },

  { key: 'reports', group: 'reports', description: 'Access reporting module' },
  { key: 'reports.view', group: 'reports', description: 'View reports' },
  { key: 'reports.export', group: 'reports', description: 'Export reports' },

  { key: 'incidents', group: 'incidents', description: 'Access incidents module' },
  { key: 'incidents.view', group: 'incidents', description: 'View incidents' },
  { key: 'incidents.create', group: 'incidents', description: 'Create incidents' },
  { key: 'incidents.manage', group: 'incidents', description: 'Manage incidents' },

  { key: 'users', group: 'users', description: 'Access user management module' },
  { key: 'users.view', group: 'users', description: 'View users' },
  { key: 'users.read', group: 'users', description: 'Read user details' },
  { key: 'users.create', group: 'users', description: 'Create users' },
  { key: 'users.update', group: 'users', description: 'Update users' },
  { key: 'users.delete', group: 'users', description: 'Delete users' },

  { key: 'invites', group: 'invites', description: 'Access invitations module' },
  { key: 'invites.create', group: 'invites', description: 'Create invitations' },
  { key: 'invites.read', group: 'invites', description: 'View invitations' },
  { key: 'invites.delete', group: 'invites', description: 'Revoke invitations' },

  { key: 'org', group: 'org', description: 'Access organisation administration' },
  { key: 'org.settings.view', group: 'org', description: 'View organisation settings' },
  { key: 'org.settings.manage', group: 'org', description: 'Manage organisation settings' },
  { key: 'org.users.view', group: 'org', description: 'View organisation users' },
  { key: 'org.users.manage', group: 'org', description: 'Manage organisation users' },
  { key: 'org.roles.view', group: 'org', description: 'View roles and permissions' },
  { key: 'org.roles.manage', group: 'org', description: 'Manage roles and permissions' },
  { key: 'org.invites.view', group: 'org', description: 'View organisation invitations' },
  { key: 'org.invites.manage', group: 'org', description: 'Manage organisation invitations' },
  { key: 'org.audit.view', group: 'org', description: 'View audit logs' },

  { key: 'attendance', group: 'attendance', description: 'Access attendance module' },
  {
    key: 'attendance.view',
    group: 'attendance',
    description: 'View Wednesday attendance dashboard',
  },
  {
    key: 'attendance.manage',
    group: 'attendance',
    description: 'Review, edit, and override attendance entries',
  },
  {
    key: 'attendance.export',
    group: 'attendance',
    description: 'Export Wednesday attendance data',
  },

  { key: 'live-graphics', group: 'live-graphics', description: 'Access live graphics module' },
  { key: 'live-graphics.view', group: 'live-graphics', description: 'View live graphics overlays' },
  {
    key: 'live-graphics.manage',
    group: 'live-graphics',
    description: 'Upload, edit, and control live graphic overlays',
  },

  { key: 'feedback', group: 'feedback', description: 'Access feedback module' },
  { key: 'feedback.submit', group: 'feedback', description: 'Submit feedback and bug reports' },
];
