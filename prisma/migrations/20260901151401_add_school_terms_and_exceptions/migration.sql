-- CreateTable
CREATE TABLE "school_terms" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_calendar_exceptions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "school_calendar_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "school_calendar_exceptions_schoolId_date_key" ON "school_calendar_exceptions"("schoolId", "date");

-- AddForeignKey
ALTER TABLE "school_terms" ADD CONSTRAINT "school_terms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_calendar_exceptions" ADD CONSTRAINT "school_calendar_exceptions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
