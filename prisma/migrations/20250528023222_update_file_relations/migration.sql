-- CreateIndex
CREATE INDEX "File_uploadedBy_idx" ON "File"("uploadedBy");

-- CreateIndex
CREATE INDEX "File_folderId_idx" ON "File"("folderId");

-- CreateIndex
CREATE INDEX "File_fiscalYearId_idx" ON "File"("fiscalYearId");

-- CreateIndex
CREATE INDEX "File_sourceId_idx" ON "File"("sourceId");

-- CreateIndex
CREATE INDEX "File_grantTypeId_idx" ON "File"("grantTypeId");
