-- Create live_graphics table to host uploaded overlay HTML files and live state
CREATE TABLE "live_graphics" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "public_code" TEXT NOT NULL,
    "control_code" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "public_url" TEXT,
    "state" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_graphics_pkey" PRIMARY KEY ("id")
);

-- Indexes and uniqueness constraints
CREATE UNIQUE INDEX "live_graphics_public_code_key" ON "live_graphics"("public_code");
CREATE UNIQUE INDEX "live_graphics_control_code_key" ON "live_graphics"("control_code");
CREATE INDEX "live_graphics_tenant_id_idx" ON "live_graphics"("tenant_id");

-- Foreign keys
ALTER TABLE "live_graphics" ADD CONSTRAINT "live_graphics_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "live_graphics" ADD CONSTRAINT "live_graphics_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "org_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "live_graphics" ADD CONSTRAINT "live_graphics_updated_by_fkey"
    FOREIGN KEY ("updated_by") REFERENCES "org_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Row level security for tenant isolation
ALTER TABLE "live_graphics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "live_graphics" FORCE ROW LEVEL SECURITY;

CREATE POLICY live_graphics_tenant_isolation ON "live_graphics"
    USING ("tenant_id" = current_setting('app.tenant_id'));
