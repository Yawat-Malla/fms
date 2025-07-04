-- CreateTable
CREATE TABLE "BinItem" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BinItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BinItem_userId_idx" ON "BinItem"("userId");

-- AddForeignKey
ALTER TABLE "BinItem" ADD CONSTRAINT "BinItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
