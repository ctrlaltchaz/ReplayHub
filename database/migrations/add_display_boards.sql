-- Create display_boards table
CREATE TABLE IF NOT EXISTS "display_boards" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "public_code" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 5000,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "display_boards_pkey" PRIMARY KEY ("id")
);

-- Create display_board_images table
CREATE TABLE IF NOT EXISTS "display_board_images" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "display_board_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "uploaded_by" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "display_board_images_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "display_boards_public_code_key" ON "display_boards" ("public_code");

CREATE INDEX IF NOT EXISTS "display_boards_tenant_id_idx" ON "display_boards" ("tenant_id");

CREATE INDEX IF NOT EXISTS "display_boards_public_code_idx" ON "display_boards" ("public_code");

CREATE INDEX IF NOT EXISTS "display_board_images_tenant_id_idx" ON "display_board_images" ("tenant_id");

CREATE INDEX IF NOT EXISTS "display_board_images_display_board_id_order_idx" ON "display_board_images" ("display_board_id", "order");

-- Add foreign key constraints
ALTER TABLE "display_boards"
ADD CONSTRAINT "display_boards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "display_boards"
ADD CONSTRAINT "display_boards_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "org_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "display_boards"
ADD CONSTRAINT "display_boards_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "org_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "display_board_images"
ADD CONSTRAINT "display_board_images_display_board_id_fkey" FOREIGN KEY ("display_board_id") REFERENCES "display_boards" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "display_board_images"
ADD CONSTRAINT "display_board_images_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "org_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add RLS policies for display_boards
ALTER TABLE "display_boards" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "display_boards_tenant_isolation" ON "display_boards"
    FOR ALL
    USING ("tenant_id" = current_setting('app.tenant_id', true)::text);

-- Add RLS policies for display_board_images
ALTER TABLE "display_board_images" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "display_board_images_tenant_isolation" ON "display_board_images"
    FOR ALL
    USING ("tenant_id" = current_setting('app.tenant_id', true)::text);