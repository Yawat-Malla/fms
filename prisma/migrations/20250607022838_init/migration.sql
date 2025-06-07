/*
  Warnings:

  - The values [data_entry,auditor] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[name,parentId,isDeleted]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('admin', 'editor', 'viewer');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "Folder_name_parentId_isDeleted_key" ON "Folder"("name", "parentId", "isDeleted");
