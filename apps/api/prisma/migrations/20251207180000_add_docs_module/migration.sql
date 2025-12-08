-- CreateTable: doc_categories
CREATE TABLE "doc_categories" (
    "id" TEXT NOT NULL,
    "organisation_id" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "slug" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "doc_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable: docs
CREATE TABLE "docs" (
    "id" TEXT NOT NULL,
    "organisation_id" TEXT,
    "category_id" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "estimated_read_time" INTEGER NOT NULL DEFAULT 5,
    "author_type" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: doc_completions
CREATE TABLE "doc_completions" (
    "id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "doc_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "doc_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: doc_attachments
CREATE TABLE "doc_attachments" (
    "id" TEXT NOT NULL,
    "doc_id" TEXT NOT NULL,
    "filename" VARCHAR(500) NOT NULL,
    "file_path" VARCHAR(1000) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "mime_type" VARCHAR(100),
    "uploaded_by" TEXT NOT NULL,
    "uploader_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "doc_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_doc_categories_org" ON "doc_categories" ("organisation_id")
WHERE
    "organisation_id" IS NOT NULL;

-- CreateIndex
CREATE INDEX "idx_doc_categories_global" ON "doc_categories" ("organisation_id")
WHERE
    "organisation_id" IS NULL;

-- CreateIndex
CREATE INDEX "idx_doc_categories_active" ON "doc_categories" ("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "idx_docs_org" ON "docs" ("organisation_id")
WHERE
    "organisation_id" IS NOT NULL;

-- CreateIndex
CREATE INDEX "idx_docs_global" ON "docs" ("organisation_id")
WHERE
    "organisation_id" IS NULL;

-- CreateIndex
CREATE INDEX "idx_docs_category" ON "docs" ("category_id");

-- CreateIndex
CREATE INDEX "idx_docs_status" ON "docs" ("status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "idx_docs_featured" ON "docs" (
    "is_featured",
    "published_at" DESC
)
WHERE
    "is_featured" = true;

-- CreateIndex
CREATE INDEX "idx_docs_author" ON "docs" ("author_type", "author_id");

-- CreateIndex
CREATE INDEX "idx_doc_completions_org" ON "doc_completions" ("organisation_id");

-- CreateIndex
CREATE INDEX "idx_doc_completions_user" ON "doc_completions" (
    "user_id",
    "completed_at" DESC
);

-- CreateIndex
CREATE INDEX "idx_doc_completions_doc" ON "doc_completions" ("doc_id");

-- CreateIndex
CREATE INDEX "idx_doc_attachments_doc" ON "doc_attachments" ("doc_id");

-- AddForeignKey
ALTER TABLE "doc_categories"
ADD CONSTRAINT "doc_categories_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docs"
ADD CONSTRAINT "docs_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docs"
ADD CONSTRAINT "docs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "doc_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doc_completions"
ADD CONSTRAINT "doc_completions_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doc_completions"
ADD CONSTRAINT "doc_completions_doc_id_fkey" FOREIGN KEY ("doc_id") REFERENCES "docs" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doc_completions"
ADD CONSTRAINT "doc_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "org_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doc_attachments"
ADD CONSTRAINT "doc_attachments_doc_id_fkey" FOREIGN KEY ("doc_id") REFERENCES "docs" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex (Unique constraints)
CREATE UNIQUE INDEX "doc_categories_organisation_id_slug_key" ON "doc_categories" ("organisation_id", "slug");

-- CreateIndex (Unique constraints)
CREATE UNIQUE INDEX "docs_organisation_id_slug_key" ON "docs" ("organisation_id", "slug");

-- CreateIndex (Unique constraint for completions)
CREATE UNIQUE INDEX "doc_completions_organisation_id_doc_id_user_id_key" ON "doc_completions" (
    "organisation_id",
    "doc_id",
    "user_id"
);

-- Enable RLS
ALTER TABLE "doc_categories" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "docs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "doc_completions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "doc_attachments" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY tenant_isolation_doc_categories ON "doc_categories" FOR ALL USING (
    "organisation_id" IS NULL
    OR "organisation_id" = current_setting ('app.current_tenant_id', TRUE)
);

CREATE POLICY tenant_isolation_docs ON "docs" FOR ALL USING (
    "organisation_id" IS NULL
    OR "organisation_id" = current_setting ('app.current_tenant_id', TRUE)
);

CREATE POLICY tenant_isolation_doc_completions ON "doc_completions" FOR ALL USING (
    "organisation_id" = current_setting ('app.current_tenant_id', TRUE)
);

CREATE POLICY tenant_isolation_doc_attachments ON "doc_attachments"
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM "docs" 
            WHERE "docs"."id" = "doc_attachments"."doc_id"
            AND (
                "docs"."organisation_id" IS NULL OR 
                "docs"."organisation_id" = current_setting('app.current_tenant_id', TRUE)
            )
        )
    );