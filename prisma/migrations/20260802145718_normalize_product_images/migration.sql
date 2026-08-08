/*
  Warnings:

  - You are about to drop the column `altText` on the `product_images` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `product_images` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `product_images` table. All the data in the column will be lost.
  - Added the required column `mediaFileId` to the `product_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_images" DROP COLUMN "altText",
DROP COLUMN "fileId",
DROP COLUMN "url",
ADD COLUMN     "mediaFileId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "media_files" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileType" TEXT NOT NULL DEFAULT 'image',
    "size" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_files_fileId_key" ON "media_files"("fileId");

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "media_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
