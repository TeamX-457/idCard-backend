/*
  Warnings:

  - You are about to drop the column `relationship` on the `guardians` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `guardians` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "guardians" DROP CONSTRAINT "guardians_student_id_fkey";

-- AlterTable
ALTER TABLE "guardians" DROP COLUMN "relationship",
DROP COLUMN "student_id";

-- CreateTable
CREATE TABLE "student_guardians" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "guardian_id" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_guardians_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_guardians_student_id_guardian_id_key" ON "student_guardians"("student_id", "guardian_id");

-- AddForeignKey
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
