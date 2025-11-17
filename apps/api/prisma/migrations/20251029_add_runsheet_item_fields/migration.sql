-- Add new fields to runsheet_items table
ALTER TABLE "runsheet_items" ADD COLUMN "type" TEXT;
ALTER TABLE "runsheet_items" ADD COLUMN "location" TEXT;
ALTER TABLE "runsheet_items" ADD COLUMN "equipment" TEXT;
ALTER TABLE "runsheet_items" ADD COLUMN "priority" TEXT DEFAULT 'normal';

-- Add check constraint for priority
ALTER TABLE "runsheet_items" ADD CONSTRAINT "runsheet_items_priority_check" 
CHECK ("priority" IN ('low', 'normal', 'high', 'critical'));
