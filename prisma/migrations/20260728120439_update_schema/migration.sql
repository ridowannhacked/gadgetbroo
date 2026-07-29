/*
  Warnings:

  - The `name` column on the `roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'CUSTOMER', 'MANAGER');

-- DropIndex
DROP INDEX "roles_name_key";

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "name",
ADD COLUMN     "name" "RoleType" NOT NULL DEFAULT 'CUSTOMER';
