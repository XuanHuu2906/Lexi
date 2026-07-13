-- AlterTable
-- Per-user IANA timezone for the reminder time (UC18). Existing rows default to
-- Vietnam time, matching the app's primary audience and the previous implicit
-- assumption that reminderTime was "local" time.
ALTER TABLE "settings"
    ADD COLUMN "timeZone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh';
