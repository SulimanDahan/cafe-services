/*
Warnings:

- You are about to drop the `ReservationItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReservationItem"
DROP CONSTRAINT "ReservationItem_item_id_fkey";

-- DropForeignKey
ALTER TABLE "ReservationItem"
DROP CONSTRAINT "ReservationItem_reservation_id_fkey";

-- DropTable
DROP TABLE "ReservationItem";

-- CreateTable
CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "reservation_id" TEXT NOT NULL,
  "item_id" TEXT NOT NULL,
  "item_price" DECIMAL(65, 30) NOT NULL DEFAULT 0,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "Reservation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;