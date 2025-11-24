export interface PasswordEntry {
  id: string;
  title: string;
  username?: string | null;
  url?: string | null;
  notes?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string | null;
  createdBy: string;
  updatedBy?: string | null;
}

export interface PasswordDetail extends PasswordEntry {
  password: string;
}

export interface PasswordAuditEntry {
  id: string;
  action: "VIEW" | "CREATE" | "UPDATE" | "DELETE";
  createdAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  membership?: {
    id: string;
    displayName: string | null;
    email: string;
  };
}

export interface CreatePasswordPayload {
  title: string;
  username?: string;
  password: string;
  url?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdatePasswordPayload extends Partial<CreatePasswordPayload> {}
