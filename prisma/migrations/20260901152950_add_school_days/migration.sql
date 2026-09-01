-- AlterTable
ALTER TABLE "attendance_rules" ADD COLUMN     "schoolDays" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[];
