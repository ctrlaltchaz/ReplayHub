-- CreateTable
CREATE TABLE "runsheets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_id" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "runsheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runsheet_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "runsheet_id" TEXT NOT NULL,
    "idx" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "owner_id" TEXT,
    "duration_ms" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "attachments_json" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "runsheet_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "items_json" JSONB NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklists" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "scope_ref" TEXT,
    "due_at" TIMESTAMP(3),
    "assignee_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_runs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "checklist_id" TEXT NOT NULL,
    "runner_id" TEXT NOT NULL,
    "run_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result_json" JSONB NOT NULL,

    CONSTRAINT "checklist_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "runsheets_tenant_id_idx" ON "runsheets"("tenant_id");

-- CreateIndex
CREATE INDEX "runsheets_tenant_id_event_id_idx" ON "runsheets"("tenant_id", "event_id");

-- CreateIndex
CREATE INDEX "runsheet_items_tenant_id_runsheet_id_idx" ON "runsheet_items"("tenant_id", "runsheet_id");

-- CreateIndex
CREATE UNIQUE INDEX "runsheet_items_tenant_id_runsheet_id_idx_key" ON "runsheet_items"("tenant_id", "runsheet_id", "idx");

-- CreateIndex
CREATE INDEX "checklist_templates_tenant_id_idx" ON "checklist_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "checklist_templates_tenant_id_scope_idx" ON "checklist_templates"("tenant_id", "scope");

-- CreateIndex
CREATE INDEX "checklists_tenant_id_template_id_idx" ON "checklists"("tenant_id", "template_id");

-- CreateIndex
CREATE INDEX "checklists_tenant_id_status_idx" ON "checklists"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "checklists_tenant_id_assignee_id_idx" ON "checklists"("tenant_id", "assignee_id");

-- CreateIndex
CREATE INDEX "checklist_runs_tenant_id_checklist_id_idx" ON "checklist_runs"("tenant_id", "checklist_id");

-- CreateIndex
CREATE INDEX "checklist_runs_tenant_id_runner_id_idx" ON "checklist_runs"("tenant_id", "runner_id");

-- AddForeignKey
ALTER TABLE "runsheet_items" ADD CONSTRAINT "runsheet_items_runsheet_id_fkey" FOREIGN KEY ("runsheet_id") REFERENCES "runsheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklists" ADD CONSTRAINT "checklists_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "checklist_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_runs" ADD CONSTRAINT "checklist_runs_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
