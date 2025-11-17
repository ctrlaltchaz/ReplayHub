-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notes_tenant_id_idx" ON "notes"("tenant_id");

-- Enable Row-Level Security on notes table
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policy for notes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='notes'
  ) THEN
    CREATE POLICY tenant_isolation ON "notes"
      USING (tenant_id = current_setting('app.tenant_id'));
  END IF;
END $$;
