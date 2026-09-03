/*
  Warnings:

  - A unique constraint covering the columns `[idempotency_key]` on the table `attendance_events` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idempotency_key` to the `attendance_events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attendance_events" ADD COLUMN     "idempotency_key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "attendance_events_idempotency_key_key" ON "attendance_events"("idempotency_key");
