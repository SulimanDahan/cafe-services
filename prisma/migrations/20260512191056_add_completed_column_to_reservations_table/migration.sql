-- AlterTable
ALTER TABLE "Reservation"
ADD COLUMN "completed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "currency_name" TEXT NOT NULL DEFAULT 'IQD',
    "tax_rate" DECIMAL(65, 30) NOT NULL DEFAULT 10,
    "allow_notifications" BOOLEAN NOT NULL DEFAULT true,
    "notification_threshold" INTEGER NOT NULL DEFAULT 100,
    "app_lang" TEXT NOT NULL DEFAULT 'ar',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);