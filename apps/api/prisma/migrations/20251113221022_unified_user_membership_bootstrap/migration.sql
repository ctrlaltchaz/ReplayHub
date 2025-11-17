-- CreateTable
CREATE TABLE "user_org_memberships" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_totp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_org_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_org_memberships_tenant_id_idx" ON "user_org_memberships"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_org_memberships_tenant_id_email_key" ON "user_org_memberships"("tenant_id", "email");

-- AddForeignKey
ALTER TABLE "user_org_memberships" ADD CONSTRAINT "user_org_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "global_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_org_memberships" ADD CONSTRAINT "user_org_memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
