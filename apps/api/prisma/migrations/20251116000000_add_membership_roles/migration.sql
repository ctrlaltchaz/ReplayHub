-- CreateTable
CREATE TABLE "membership_roles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "membership_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "membership_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "membership_roles_tenant_id_membership_id_idx" ON "membership_roles" ("tenant_id", "membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "membership_roles_tenant_id_membership_id_role_id_key" ON "membership_roles" (
    "tenant_id",
    "membership_id",
    "role_id"
);

-- AddForeignKey
ALTER TABLE "membership_roles"
ADD CONSTRAINT "membership_roles_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "user_org_memberships" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_roles"
ADD CONSTRAINT "membership_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate data from org_user_roles to membership_roles
-- This matches OrgUser records to UserOrganisationMembership records by tenantId and email
INSERT INTO "membership_roles" ("id", "tenant_id", "membership_id", "role_id", "created_at")
SELECT 
    gen_random_uuid()::text,
    our.tenant_id,
    uom.id as membership_id,
    our.role_id,
    our.created_at
FROM "org_user_roles" our
INNER JOIN "org_users" ou ON our.org_user_id = ou.id
INNER JOIN "user_org_memberships" uom ON (
    uom.tenant_id = ou.tenant_id 
    AND uom.email = ou.email
)
ON CONFLICT (tenant_id, membership_id, role_id) DO NOTHING;