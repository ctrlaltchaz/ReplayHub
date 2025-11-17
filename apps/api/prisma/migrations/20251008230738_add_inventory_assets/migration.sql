-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serial" TEXT,
    "condition" TEXT NOT NULL DEFAULT 'good',
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_kits" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_kit_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "kit_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,

    CONSTRAINT "inventory_kit_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "from_loc" TEXT,
    "to_loc" TEXT,
    "by_user_id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "tags" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_versions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_items_tenant_id_type_status_idx" ON "inventory_items"("tenant_id", "type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_tenant_id_tag_key" ON "inventory_items"("tenant_id", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_kits_tenant_id_name_key" ON "inventory_kits"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_kit_items_tenant_id_kit_id_item_id_key" ON "inventory_kit_items"("tenant_id", "kit_id", "item_id");

-- CreateIndex
CREATE INDEX "inventory_movements_tenant_id_item_id_at_idx" ON "inventory_movements"("tenant_id", "item_id", "at");

-- CreateIndex
CREATE INDEX "assets_tenant_id_status_idx" ON "assets"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "asset_versions_tenant_id_asset_id_idx" ON "asset_versions"("tenant_id", "asset_id");

-- AddForeignKey
ALTER TABLE "inventory_kit_items" ADD CONSTRAINT "inventory_kit_items_kit_id_fkey" FOREIGN KEY ("kit_id") REFERENCES "inventory_kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_kit_items" ADD CONSTRAINT "inventory_kit_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_versions" ADD CONSTRAINT "asset_versions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS on all inventory and asset tables
ALTER TABLE "inventory_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_kits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_kit_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_movements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "asset_versions" ENABLE ROW LEVEL SECURITY;

-- Force RLS on all inventory and asset tables
ALTER TABLE "inventory_items" FORCE ROW LEVEL SECURITY;
ALTER TABLE "inventory_kits" FORCE ROW LEVEL SECURITY;
ALTER TABLE "inventory_kit_items" FORCE ROW LEVEL SECURITY;
ALTER TABLE "inventory_movements" FORCE ROW LEVEL SECURITY;
ALTER TABLE "assets" FORCE ROW LEVEL SECURITY;
ALTER TABLE "asset_versions" FORCE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY "inventory_items_tenant_isolation" ON "inventory_items"
  USING (tenant_id = current_setting('app.tenant_id'));

CREATE POLICY "inventory_kits_tenant_isolation" ON "inventory_kits"
  USING (tenant_id = current_setting('app.tenant_id'));

CREATE POLICY "inventory_kit_items_tenant_isolation" ON "inventory_kit_items"
  USING (tenant_id = current_setting('app.tenant_id'));

CREATE POLICY "inventory_movements_tenant_isolation" ON "inventory_movements"
  USING (tenant_id = current_setting('app.tenant_id'));

CREATE POLICY "assets_tenant_isolation" ON "assets"
  USING (tenant_id = current_setting('app.tenant_id'));

CREATE POLICY "asset_versions_tenant_isolation" ON "asset_versions"
  USING (tenant_id = current_setting('app.tenant_id'));
