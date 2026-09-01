import { prisma } from "../db.js";
import { startOfDay, minutesSinceMidnight } from "../utils/classifyAttendance.js";
import { isSchoolDay } from "../utils/schoolCalendar.js";

export async function markAbsences() {
  const now = new Date();
  const nowMinutes = minutesSinceMidnight(now);
  const today = startOfDay(now);

  const rules = await prisma.attendanceRule.findMany({
    where: { absentThreshold: { lte: nowMinutes } },
  });

  for (const rule of rules) {
    const schoolDay = await isSchoolDay(rule.schoolId, today, rule.schoolDays);
    if (!schoolDay) continue;

    const studentsWithStatus = await prisma.dailyAttendanceStatus.findMany({
      where: { schoolId: rule.schoolId, date: today },
      select: { studentId: true },
    });
    const alreadyMarked = new Set(studentsWithStatus.map((s) => s.studentId));

    const activeStudents = await prisma.student.findMany({
      where: { schoolId: rule.schoolId, status: { not: "unregistered" } },
      select: { id: true },
    });

    const toMarkAbsent = activeStudents
      .filter((s) => !alreadyMarked.has(s.id))
      .map((s) => ({
        studentId: s.id,
        schoolId: rule.schoolId,
        date: today,
        status: "absent",
      }));

    if (toMarkAbsent.length > 0) {
      await prisma.dailyAttendanceStatus.createMany({
        data: toMarkAbsent,
        skipDuplicates: true, // guards against the job overlapping itself if a run takes longer than 15 min
      });
    }
  }
}