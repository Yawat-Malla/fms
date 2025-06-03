/*
  Warnings:

  - The primary key for the `SystemSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "SystemSettings" DROP CONSTRAINT "SystemSettings_pkey",
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "siteNameNepali" TEXT NOT NULL DEFAULT 'फाइल व्यवस्थापन प्रणाली',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id");
