-- CreateIndex
CREATE INDEX "user_org_memberships_user_id_idx" ON "user_org_memberships"("user_id");

-- CreateIndex
CREATE INDEX "user_org_memberships_tenant_id_user_id_idx" ON "user_org_memberships"("tenant_id", "user_id");
