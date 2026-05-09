-- Persist ordered product display snapshot for cross-device consistency
ALTER TABLE "OrderItem"
  ADD COLUMN "sourceProductRef" TEXT,
  ADD COLUMN "displayName" TEXT,
  ADD COLUMN "displayBrand" TEXT,
  ADD COLUMN "displayImage" TEXT;
