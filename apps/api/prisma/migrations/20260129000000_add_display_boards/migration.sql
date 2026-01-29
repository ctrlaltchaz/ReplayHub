-- CreateTable
CREATE TABLE "display_boards" (
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

-- CreateTable
CREATE TABLE "display_board_images" (
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

-- CreateIndex
CREATE UNIQUE INDEX "display_boards_public_code_key" ON "display_boards" ("public_code");

-- CreateIndex
CREATE INDEX "display_boards_tenant_id_idx" ON "display_boards" ("tenant_id");

-- CreateIndex
CREATE INDEX "display_boards_public_code_idx" ON "display_boards" ("public_code");

-- CreateIndex
CREATE INDEX "display_board_images_tenant_id_idx" ON "display_board_images" ("tenant_id");

-- CreateIndex
CREATE INDEX "display_board_images_display_board_id_order_idx" ON "display_board_images" ("display_board_id", "order");

-- AddForeignKey
ALTER TABLE "display_boards"
ADD CONSTRAINT "display_boards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "display_boards"
ADD CONSTRAINT "display_boards_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "org_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "display_boards"
ADD CONSTRAINT "display_boards_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "org_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "display_board_images"
ADD CONSTRAINT "display_board_images_display_board_id_fkey" FOREIGN KEY ("display_board_id") REFERENCES "display_boards" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "display_board_images"
ADD CONSTRAINT "display_board_images_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "org_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable RLS
ALTER TABLE "display_boards" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy
CREATE POLICY "display_boards_tenant_isolation" ON "display_boards"
    FOR ALL
    USING ("tenant_id" = current_setting('app.tenant_id', true)::text);

-- Enable RLS
ALTER TABLE "display_board_images" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy
CREATE POLICY "display_board_images_tenant_isolation" ON "display_board_images"
    FOR ALL
    USING ("tenant_id" = current_setting('app.tenant_id', true)::text);