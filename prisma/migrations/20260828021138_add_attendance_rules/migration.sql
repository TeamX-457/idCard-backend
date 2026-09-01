-- CreateTable
CREATE TABLE "attendance_rules" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "earlyThreshold" INTEGER NOT NULL DEFAULT 480,
    "presentThreshold" INTEGER NOT NULL DEFAULT 540,
    "absentThreshold" INTEGER NOT NULL DEFAULT 900,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_rules_schoolId_key" ON "attendance_rules"("schoolId");

-- AddForeignKey
ALTER TABLE "attendance_rules" ADD CONSTRAINT "attendance_rules_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
