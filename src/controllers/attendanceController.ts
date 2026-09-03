import { Request, Response } from "express";
import { prisma } from "../db.js";
import { AppError } from "../middleware/errorHandler.js";
import { classifyStatus, minutesSinceMidnight, startOfDay } from "../utils/classifyAttendance.js";
import { requireSchoolAdmin } from "../utils/requireSchoolAdmin.js";
import { listAttendanceEventsQuerySchema } from "../utils/validator.js";
import { Prisma } from "../generated/prisma/client.js";
import crypto from "crypto";

export const createAttendanceEvent = async (req: Request, res: Response) => {
  const { id: deviceId, schoolId, locationName } = req.device!;
  const { uid, eventType, timestamp } = req.body;

  if (!timestamp) {
    throw new AppError("timestamp is required", 400);
  }

  const idempotencyKey = crypto
    .createHash("sha256")
    .update(`${deviceId}:${uid}:${timestamp}`)
    .digest("hex");

  const card = await prisma.card.findFirst({
    where: { uid, schoolId, status: "active" },
  });

  if (!card) {
    throw new AppError("Card not recognized", 404);
  }

  let event;
  try {
    event = await prisma.attendanceEvent.create({
      data: {
        studentId: card.studentId,
        cardId: card.id,
        deviceId,
        eventType,
        timestamp: new Date(timestamp),
        readerLocation: locationName,
        idempotencyKey,
      },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      const existing = await prisma.attendanceEvent.findUnique({
        where: { idempotencyKey },
      });
      return res.status(200).json({ event: existing, duplicate: true });
    }
    throw err;
  }

  if (eventType === "check_in") {
      const today = startOfDay(event.timestamp);

      const rule = await prisma.attendanceRule.upsert({
        where: { schoolId },
        update: {},
        create: { schoolId },
      });

      const status = classifyStatus(minutesSinceMidnight(event.timestamp), rule);

      await prisma.dailyAttendanceStatus.upsert({
        where: { studentId_date: { studentId: card.studentId, date: today } },
        update: {}, // first check-in of the day wins; do nothing on repeat
        create: { studentId: card.studentId, schoolId, date: today, status },
      });
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