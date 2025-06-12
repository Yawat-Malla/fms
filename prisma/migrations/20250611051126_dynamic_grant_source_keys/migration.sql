/*
  Warnings:

  - You are about to drop the `BinItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[key]` on the table `GrantType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `Source` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `GrantType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `Source` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BinItem" DROP CONSTRAINT "BinItem_userId_fkey";

-- DropIndex
DROP INDEX "GrantType_name_key";

-- DropIndex
DROP INDEX "Source_name_key";

-- Add the columns as nullable first
ALTER TABLE "GrantType" ADD COLUMN "key" TEXT;
ALTER TABLE "Source" ADD COLUMN "key" TEXT;

-- Populate the new columns for existing rows
UPDATE "GrantType" SET "key" = lower(replace("name", ' ', '_')) WHERE "key" IS NULL;
UPDATE "Source" SET "key" = lower(replace("name", ' ', '_')) WHERE "key" IS NULL;

-- Alter the columns to be NOT NULL
ALTER TABLE "GrantType" ALTER COLUMN "key" SET NOT NULL;
ALTER TABLE "Source" ALTER COLUMN "key" SET NOT NULL;

-- DropTable
DROP TABLE "BinItem";

-- CreateIndex
CREATE UNIQUE INDEX "GrantType_key_key" ON "GrantType"("key");
CREATE UNIQUE INDEX "Source_key_key" ON "Source"("key");
