/*
  Warnings:

  - You are about to drop the column `documentType` on the `File` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "File_fiscalYearId_idx";

-- DropIndex
DROP INDEX "File_folderId_idx";

-- DropIndex
DROP INDEX "File_grantTypeId_idx";

-- DropIndex
DROP INDEX "File_sourceId_idx";

-- DropIndex
DROP INDEX "File_uploadedBy_idx";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "documentType";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePicture" TEXT;
