/*
  Warnings:

  - A unique constraint covering the columns `[user_id,tenant_id]` on the table `user_org_memberships` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_org_memberships_user_id_tenant_id_key" ON "user_org_memberships"("user_id", "tenant_id");
