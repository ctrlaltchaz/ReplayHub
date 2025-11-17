-- Create runsheet item templates table
CREATE TABLE "runsheet_item_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "duration_ms" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "equipment" TEXT,
    "priority" TEXT DEFAULT 'normal',
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Create indexes
CREATE INDEX "runsheet_item_templates_tenant_id_idx" ON "runsheet_item_templates"("tenant_id");
CREATE INDEX "runsheet_item_templates_tenant_id_type_idx" ON "runsheet_item_templates"("tenant_id", "type");
