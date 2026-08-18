/*
  Warnings:

  - You are about to drop the column `color` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `storage` on the `product_variants` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('ONLINE', 'POS', 'SOCIAL_MEDIA');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'CASH';
ALTER TYPE "PaymentMethod" ADD VALUE 'MANUAL_BKASH';

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_addressId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customerAddress" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "orderSource" "OrderSource" NOT NULL DEFAULT 'ONLINE',
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "addressId" DROP NOT NULL;

-- 1. Add new columns
ALTER TABLE "product_variants" ADD COLUMN     "attributes" JSONB DEFAULT '{}';

ALTER TABLE "products" ADD COLUMN     "options" JSONB DEFAULT '[]',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. CUSTOM DATA MIGRATION: Copy existing data into attributes JSON
UPDATE "product_variants"
SET "attributes" = jsonb_strip_nulls(
  jsonb_build_object(
    'Color', "color",
    'Size', "size",
    'Storage', "storage"
  )
);

-- 3. CUSTOM DATA MIGRATION: Build product options array based on the variants
UPDATE "products"
SET "options" = (
  SELECT COALESCE(
    jsonb_agg(jsonb_build_object('name', sub.k, 'values', sub.v)), 
    '[]'::jsonb
  )
  FROM (
    SELECT key AS k, jsonb_agg(DISTINCT value) AS v
    FROM "product_variants" pv, jsonb_each_text(pv.attributes)
    WHERE pv."productId" = "products".id
    GROUP BY key
  ) sub
);

-- 4. Safe to drop old columns now
ALTER TABLE "product_variants" DROP COLUMN "color",
DROP COLUMN "size",
DROP COLUMN "storage";

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
