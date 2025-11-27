-- Allow drafts and status tracking for live graphics
ALTER TABLE "live_graphics"
    ALTER COLUMN "file_path" DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'draft';
