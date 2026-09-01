import { Request, Response } from "express";
import { prisma } from "../db.js";
import { requireSchoolAdmin } from "../utils/requireSchoolAdmin.js";
import { startOfDay } from "../utils/classifyAttendance.js";

export const getTodayDashboard = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const today = startOfDay(new Date());

  const [students, statuses, events] = await Promise.all([
    prisma.student.findMany({
      where: { schoolId, status: { not: "unregistered" } },
      select: { id: true, name: true, class: true, admissionNumber: true },
    }),
    prisma.dailyAttendanceStatus.findMany({
      where: { schoolId, date: today },
    }),
    prisma.attendanceEvent.findMany({
      where: { student: { schoolId }, timestamp: { gte: today } },
      orderBy: { timestamp: "desc" },
      select: { studentId: true, eventType: true, timestamp: true, readerLocation: true },
    }),
  ]);

  const statusMap = new Map(statuses.map((s) => [s.studentId, s.status]));

  // events are ordered desc, so the first one seen per student is their latest today
  const lastEventMap = new Map<string, (typeof events)[number]>();
  for (const event of events) {
    if (!lastEventMap.has(event.studentId)) {
      lastEventMap.set(event.studentId, event);
    }
  }

  const roster = students.map((student) => {
    const timingStatus = statusMap.get(student.id) ?? "unknown";
    const lastEvent = lastEventMap.get(student.id);
    const presenceStatus = lastEvent
      ? lastEvent.eventType === "check_in"
        ? "signed_in"
        : "signed_out"
      : "unknown";

    return {
      ...student,
      timingStatus,
      presenceStatus,
      lastEventTime: lastEvent?.timestamp ?? null,
      lastLocation: lastEvent?.readerLocation ?? null,
    };
  });

  const counts = { early: 0, present: 0, late: 0, absent: 0, unknown: 0 };
  for (const r of roster) counts[r.timingStatus as keyof typeof counts]++;

  res.json({ date: today, counts, students: roster });
};