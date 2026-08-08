-- Phase 1: Enterprise Schema & Performance Indexes
-- Applied via `prisma db push` because migrate dev requires an interactive TTY.
-- This migration file is marked as applied below.

-- Step 1.1: Generator output changed from app/generated/prisma -> src/generated/prisma (code only, no SQL)

-- Step 1.2: Add FK indexes for all relational tables
CREATE INDEX IF NOT EXISTS "user_roleId_idx" ON "user"("roleId");
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("userId");
CREATE INDEX IF NOT EXISTS "permissions_roleId_idx" ON "permissions"("roleId");
CREATE INDEX IF NOT EXISTS "product_images_productId_idx" ON "product_images"("productId");
CREATE INDEX IF NOT EXISTS "product_images_mediaFileId_idx" ON "product_images"("mediaFileId");
CREATE INDEX IF NOT EXISTS "product_variants_productId_idx" ON "product_variants"("productId");
CREATE INDEX IF NOT EXISTS "addresses_userId_idx" ON "addresses"("userId");
CREATE INDEX IF NOT EXISTS "orders_userId_idx" ON "orders"("userId");
CREATE INDEX IF NOT EXISTS "orders_addressId_idx" ON "orders"("addressId");
CREATE INDEX IF NOT EXISTS "orders_status_createdAt_idx" ON "orders"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX IF NOT EXISTS "order_items_variantId_idx" ON "order_items"("variantId");
CREATE INDEX IF NOT EXISTS "reviews_productId_idx" ON "reviews"("productId");
CREATE INDEX IF NOT EXISTS "reviews_userId_idx" ON "reviews"("userId");

-- Step 1.3: Upgrade MediaFile for SHA-256 deduplication
ALTER TABLE "media_files" ADD COLUMN IF NOT EXISTS "filePath" TEXT NOT NULL DEFAULT '/gadgetbroo/products';
ALTER TABLE "media_files" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE "media_files" ADD COLUMN IF NOT EXISTS "hash" TEXT UNIQUE;
ALTER TABLE "media_files" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS "media_files_fileType_createdAt_idx" ON "media_files"("fileType", "createdAt");

-- Step 1.4: Soft-delete columns on Product and ProductVariant
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- OrderItem snapshot columns
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "productName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variantName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "skuAtOrder" TEXT NOT NULL DEFAULT '';
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "imageSnapshot" TEXT;

-- Step 1.5: AuditLog table
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "audit_logs_actorId_idx" ON "audit_logs"("actorId");
CREATE INDEX IF NOT EXISTS "audit_logs_entity_entityId_createdAt_idx" ON "audit_logs"("entity", "entityId", "createdAt");
