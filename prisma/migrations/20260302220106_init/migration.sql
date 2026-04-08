/*
  Warnings:

  - A unique constraint covering the columns `[mpPaymentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('TMP', 'COMMITTED', 'DELETED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "mpPaymentId" TEXT,
ADD COLUMN     "mpPreferenceId" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OrderUpload" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "UploadStatus" NOT NULL DEFAULT 'TMP',
    "tmpKey" TEXT NOT NULL,
    "finalKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderUpload_orderId_idx" ON "OrderUpload"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderUpload_orderId_tmpKey_key" ON "OrderUpload"("orderId", "tmpKey");

-- CreateIndex
CREATE UNIQUE INDEX "Order_mpPaymentId_key" ON "Order"("mpPaymentId");

-- AddForeignKey
ALTER TABLE "OrderUpload" ADD CONSTRAINT "OrderUpload_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
