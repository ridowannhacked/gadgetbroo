/*
  Warnings:

  - Added the required column `name` to the `product_variants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_isFeatured_isActive_idx" ON "products"("isFeatured", "isActive");

-- CreateIndex
CREATE INDEX "user_email_name_idx" ON "user"("email", "name");
