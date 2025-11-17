-- CreateTable
CREATE TABLE "runsheet_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "runsheet_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runsheet_template_items" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "idx" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT,
    "owner_id" TEXT,
    "duration_ms" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "equipment" TEXT,
    "priority" TEXT DEFAULT 'normal',
    "notes" TEXT,

    CONSTRAINT "runsheet_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "runsheet_templates_tenant_id_idx" ON "runsheet_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "runsheet_template_items_template_id_idx" ON "runsheet_template_items"("template_id");

-- AddForeignKey
ALTER TABLE "runsheet_template_items" ADD CONSTRAINT "runsheet_template_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "runsheet_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
