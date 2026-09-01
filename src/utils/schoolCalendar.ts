import { prisma } from "../db.js";

export async function isSchoolDay(schoolId: string, date: Date, schoolDays: number[]): Promise<boolean> {
  const inTerm = await prisma.schoolTerm.findFirst({
    where: { schoolId, startDate: { lte: date }, endDate: { gte: date } },
  });

  if (!inTerm) return false; // outside any term — vacation, holidays between sessions, etc.

  const exception = await prisma.schoolCalendarException.findUnique({
    where: { schoolId_date: { schoolId, date } },
  });

  if (exception) {
    return exception.type === "makeup";
  }

  return schoolDays.includes(date.getDay());
}