-- Add transition field to display_boards table
ALTER TABLE "display_boards"
ADD COLUMN "transition" VARCHAR(50) NOT NULL DEFAULT 'fade';