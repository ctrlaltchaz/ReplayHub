-- CreateTable
CREATE TABLE IF NOT EXISTS "event_crew_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_crew_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "event_crew_template_members" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "org_user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_crew_template_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "event_crew_templates_tenant_id_idx" ON "event_crew_templates"("tenant_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "event_crew_template_members_template_id_idx" ON "event_crew_template_members"("template_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "event_crew_template_members_org_user_id_idx" ON "event_crew_template_members"("org_user_id");

-- AddForeignKey
ALTER TABLE "event_crew_templates" ADD CONSTRAINT "event_crew_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_crew_templates" ADD CONSTRAINT "event_crew_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "org_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_crew_template_members" ADD CONSTRAINT "event_crew_template_members_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "event_crew_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_crew_template_members" ADD CONSTRAINT "event_crew_template_members_org_user_id_fkey" FOREIGN KEY ("org_user_id") REFERENCES "org_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
