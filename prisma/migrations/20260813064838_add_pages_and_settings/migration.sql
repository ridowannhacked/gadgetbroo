-- AlterTable
ALTER TABLE "media_files" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "productName" DROP DEFAULT,
ALTER COLUMN "variantName" DROP DEFAULT,
ALTER COLUMN "skuAtOrder" DROP DEFAULT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "adminNotes" TEXT,
ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "shipping_zones" (
    "id" TEXT NOT NULL,
    "stateName" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "comments" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "adminReply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "bannerUrl" TEXT,
    "faviconUrl" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactAddress" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "shipping_zones_stateName_cityName_key" ON "shipping_zones"("stateName", "cityName");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "comments_productId_idx" ON "comments"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_language_key" ON "pages"("slug", "language");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "products_categoryId_isActive_idx" ON "products"("categoryId", "isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "site_media_placement_isActive_idx" ON "site_media"("placement", "isActive");

-- AddForeignKey safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_productId_fkey') THEN
        ALTER TABLE "comments" ADD CONSTRAINT "comments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_userId_fkey') THEN
        ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
