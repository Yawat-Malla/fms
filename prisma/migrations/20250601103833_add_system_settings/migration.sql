-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "siteName" TEXT NOT NULL DEFAULT 'File Management System',
    "siteLogo" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "enabledModules" TEXT[] DEFAULT ARRAY['files', 'users', 'reports']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
