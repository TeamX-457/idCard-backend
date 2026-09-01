import { Request, Response } from "express";
import { prisma } from "../db.js";
import { AppError } from "../middleware/errorHandler.js";
import { classifyStatus, minutesSinceMidnight, startOfDay } from "../utils/classifyAttendance.js";
import { requireSchoolAdmin } from "../utils/requireSchoolAdmin.js";
import { listAttendanceEventsQuerySchema } from "../utils/validator.js";
import { Prisma } from "../generated/prisma/client.js";

export const createAttendanceEvent = async (req: Request, res: Response) => {
  const { id: deviceId, schoolId, locationName } = req.device!;
  const { uid, eventType } = req.body;

  const card = await prisma.card.findFirst({
    where: { uid, schoolId, status: "active" },
  });

  if (!card) {
    throw new AppError("Card not recognized", 404);
  }

  const event = await prisma.attendanceEvent.create({
    data: {
      studentId: card.studentId,
      cardId: card.id,
      deviceId,
      eventType,
      readerLocation: locationName,
    },
  });

  if (eventType === "check_in") {
    const today = startOfDay(event.timestamp);

    const existing = await prisma.dailyAttendanceStatus.findUnique({
      where: { studentId_date: { studentId: card.studentId, date: today } },
    });

    if (!existing) {
      const rule = await prisma.attendanceRule.upsert({
        where: { schoolId },
        update: {},
        create: { schoolId },
      });

      const status = classifyStatus(minutesSinceMidnight(event.timestamp), rule);

      await prisma.dailyAttendanceStatus.create({
        data: { studentId: card.studentId, schoolId, date: today, status },
      });
    }
  }

  res.status(201).json({ event });
};

export const listAttendanceEvents = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const { page, limit, studentId, eventType, startDate, endDate } =
    listAttendanceEventsQuerySchema.parse(req.query);

  const skip = (page - 1) * limit;

  const where: Prisma.AttendanceEventWhereInput = {
    student: { schoolId },
    ...(studentId && { studentId }),
    ...(eventType && { eventType }),
    ...((startDate || endDate) && {
      timestamp: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
    }),
  };

  const [events, total] = await Promise.all([
    prisma.attendanceEvent.findMany({
      where,
      skip,
      take: limit,
      orderBy: { timestamp: "desc" },
      include: {
        student: { select: { name: true, class: true, admissionNumber: true } },
      },
    }),
    prisma.attendanceEvent.count({ where }),
  ]);

  res.json({
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};