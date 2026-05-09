/*
  Warnings:

  - Added the required column `orderNumber` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- 1. Add as nullable
ALTER TABLE "Order" ADD COLUMN "orderNumber" INTEGER;

-- 2. Backfill per-user orderNumber (PostgreSQL syntax)
WITH ranked_orders AS (
  SELECT id, "userId", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt", id) AS rn
  FROM "Order"
)
UPDATE "Order"
SET "orderNumber" = ranked_orders.rn
FROM ranked_orders
WHERE "Order".id = ranked_orders.id;

-- 3. Set NOT NULL
ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL;
