-- Manual migration to align database schema with Prisma schema
-- Generated via `prisma migrate diff`

-- Create enums introduced in Prisma schema
CREATE TYPE "InviteMethod" AS ENUM ('EMAIL', 'LINK');

CREATE TYPE "FeedbackType" AS ENUM ('BUG', 'SUGGESTION');

CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'REVIEWING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Update global users for email verification workflow
ALTER TABLE "global_users"
ADD COLUMN "pending_email" TEXT,
ADD COLUMN "email_verification_code" TEXT,
ADD COLUMN "email_verification_expiry" TIMESTAMP(3);

-- Update organisations with quick link configuration
ALTER TABLE "organisations"
ADD COLUMN "quick_links_json" JSONB DEFAULT '[]';

-- Evolve org_invites to support invite links and tokens
ALTER TABLE "org_invites"
DROP CONSTRAINT IF EXISTS "org_invites_tenant_id_email_accepted_at_key";

ALTER TABLE "org_invites"
ADD COLUMN "invite_method" "InviteMethod" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN "token" TEXT NOT NULL,
ADD COLUMN "accepted_by_id" TEXT,
ALTER COLUMN "email"
DROP NOT NULL;

CREATE UNIQUE INDEX "org_invites_token_key" ON "org_invites" ("token");

CREATE INDEX "org_invites_token_idx" ON "org_invites" ("token");

-- Refresh foreign key to organisations (required by Prisma schema)
ALTER TABLE "org_invites"
ADD CONSTRAINT "org_invites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organisations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Extend players with avatar metadata and visibility flag
ALTER TABLE "players"
ADD COLUMN "avatar" TEXT,
ADD COLUMN "stats_visible" BOOLEAN NOT NULL DEFAULT true;

-- Add Discord channel columns and retire legacy webhooks
ALTER TABLE "organization_discord"
DROP COLUMN IF EXISTS "webhook_events",
DROP COLUMN IF EXISTS "webhook_matches",
DROP COLUMN IF EXISTS "webhook_roster",
DROP COLUMN IF EXISTS "webhook_incidents";

ALTER TABLE "organization_discord"
ADD COLUMN "channel_events" TEXT,
ADD COLUMN "channel_matches" TEXT,
ADD COLUMN "channel_roster" TEXT,
ADD COLUMN "channel_incidents" TEXT,
ADD COLUMN "channel_general" TEXT;

-- Enhance user Discord links with OAuth tokens and DM preferences
ALTER TABLE "user_discord_links"
ADD COLUMN "access_token" TEXT,
ADD COLUMN "refresh_token" TEXT,
ADD COLUMN "token_expiry" TIMESTAMP(3),
ADD COLUMN "dm_events" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "dm_matches" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "dm_roster" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "dm_incidents" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "dm_personal_only" BOOLEAN NOT NULL DEFAULT true;

-- Password reset support
CREATE TABLE "password_reset_tokens" (
    "id" TEXT PRIMARY KEY,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens" ("token");

CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens" ("token");

CREATE INDEX "password_reset_tokens_email_idx" ON "password_reset_tokens" ("email");

CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens" ("expires_at");

-- Structured feedback system
CREATE TABLE "feedback_submissions" (
    "id" TEXT PRIMARY KEY,
    "type" "FeedbackType" NOT NULL DEFAULT 'SUGGESTION',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "FeedbackPriority" NOT NULL DEFAULT 'MEDIUM',
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT,
    "organization_name" TEXT,
    "category" TEXT,
    "metadata" JSONB,
    "attachments" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "feedback_submissions_user_id_idx" ON "feedback_submissions" ("user_id");

CREATE INDEX "feedback_submissions_status_idx" ON "feedback_submissions" ("status");

CREATE INDEX "feedback_submissions_type_idx" ON "feedback_submissions" ("type");

CREATE INDEX "feedback_submissions_created_at_idx" ON "feedback_submissions" ("created_at");

CREATE TABLE "feedback_comments" (
    "id" TEXT PRIMARY KEY,
    "submission_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "feedback_comments_submission_id_idx" ON "feedback_comments" ("submission_id");

CREATE INDEX "feedback_comments_admin_id_idx" ON "feedback_comments" ("admin_id");

-- Foreign keys for new tables
ALTER TABLE "feedback_submissions"
ADD CONSTRAINT "feedback_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "global_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "feedback_comments"
ADD CONSTRAINT "feedback_comments_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "feedback_submissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "feedback_comments"
ADD CONSTRAINT "feedback_comments_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "global_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Ensure org_users tenant link uses cascades as defined in schema
ALTER TABLE "org_users"
ADD CONSTRAINT "org_users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE;