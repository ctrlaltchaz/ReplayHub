export type AttendanceDepartment =
  | "broadcasting"
  | "graphics"
  | "social_media"
  | "production"
  | "camera_operator"
  | "other";

export type AttendanceAbsenceReason = "illness" | "appointment" | "forgot" | "other";

export type AttendanceSource = "student" | "auto" | "tutor" | "admin";

export type AttendanceStatus = "pending" | "approved" | "rejected" | "absent" | "auto_clocked_out";

export interface AttendanceEntry {
  id: string;
  tenantId: string;
  eventId: string;
  orgUserId: string;
  role?: string;
  department?: AttendanceDepartment;
  roleNotes?: string;
  status: AttendanceStatus;
  note?: string;
  absenceReason?: AttendanceAbsenceReason;
  absenceNotes?: string;
  clockInAt?: string;
  clockOutAt?: string;
  autoClockOut: boolean;
  lateFlag: boolean;
  source: AttendanceSource;
  overrideReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  scheduledDate?: string;
  event?: {
    id: string;
    title: string;
    startAt: string;
  };
  orgUser?: {
    id: string;
    displayName?: string;
    email?: string;
  };
}
