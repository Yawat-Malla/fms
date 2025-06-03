-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificationPreferences" JSONB DEFAULT '{"fileUpdates": true, "securityAlerts": true, "systemUpdates": false}';
