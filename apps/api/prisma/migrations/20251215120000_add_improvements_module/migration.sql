-- CreateTable: improvement_entries
CREATE TABLE "improvement_entries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "event_id" TEXT,
    "match_id" TEXT,
    "vod_url" TEXT,
    "vod_timestamp" TEXT,
    "screenshot_url" TEXT,
    "what_went_wrong" TEXT,
    "root_cause" TEXT,
    "proposed_solution" TEXT,
    "actual_solution" TEXT,
    "prevention_steps" TEXT,
    "platform_type" TEXT,
    "post_url" TEXT,
    "engagement_metrics" TEXT,
    "reported_by" TEXT NOT NULL,
    "assigned_to" TEXT,
    "implemented_by" TEXT,
    "tags" TEXT,
    "impact_level" TEXT,
    "occurred_at" TIMESTAMP(3),
    "implemented_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "improvement_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable: improvement_comments
CREATE TABLE "improvement_comments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "improvement_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "improvement_entries_tenant_id_category_idx" ON "improvement_entries" ("tenant_id", "category");

-- CreateIndex
CREATE INDEX "improvement_entries_tenant_id_status_idx" ON "improvement_entries" ("tenant_id", "status");

-- CreateIndex
CREATE INDEX "improvement_entries_tenant_id_event_id_idx" ON "improvement_entries" ("tenant_id", "event_id");

-- CreateIndex
CREATE INDEX "improvement_entries_tenant_id_match_id_idx" ON "improvement_entries" ("tenant_id", "match_id");

-- CreateIndex
CREATE INDEX "improvement_entries_tenant_id_occurred_at_idx" ON "improvement_entries" ("tenant_id", "occurred_at");

-- CreateIndex
CREATE INDEX "improvement_entries_tenant_id_created_at_idx" ON "improvement_entries" ("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "improvement_comments_tenant_id_entry_id_idx" ON "improvement_comments" ("tenant_id", "entry_id");

-- CreateIndex
CREATE INDEX "improvement_comments_tenant_id_created_at_idx" ON "improvement_comments" ("tenant_id", "created_at");

-- AddForeignKey
ALTER TABLE "improvement_entries"
ADD CONSTRAINT "improvement_entries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "improvement_entries"
ADD CONSTRAINT "improvement_entries_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "improvement_entries"
ADD CONSTRAINT "improvement_entries_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "org_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "improvement_entries"
ADD CONSTRAINT "improvement_entries_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "org_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "improvement_entries"
ADD CONSTRAINT "improvement_entries_implemented_by_fkey" FOREIGN KEY ("implemented_by") REFERENCES "org_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "improvement_comments"
ADD CONSTRAINT "improvement_comments_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "improvement_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "improvement_comments"
ADD CONSTRAINT "improvement_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "org_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable RLS for improvement tables
ALTER TABLE "improvement_entries" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "improvement_comments" ENABLE ROW LEVEL SECURITY;

-- RLS Policy for improvement_entries
CREATE POLICY "improvement_entries_tenant_isolation" ON "improvement_entries" USING (
    tenant_id = current_setting ('app.tenant_id', TRUE)
);

-- RLS Policy for improvement_comments
CREATE POLICY "improvement_comments_tenant_isolation" ON "improvement_comments" USING (
    tenant_id = current_setting ('app.tenant_id', TRUE)
);