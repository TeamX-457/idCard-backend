import { Request, Response } from "express";
import { prisma } from "../db.js";
import { AppError } from "../middleware/errorHandler.js";
import { requireSchoolAdmin } from "../utils/requireSchoolAdmin.js";

export const getAttendanceRule = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);

  const rule = await prisma.attendanceRule.upsert({
    where: { schoolId },
    update: {},
    create: { schoolId },
  });

  res.json({ attendanceRule: rule });
};

export const updateAttendanceRule = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const { earlyThreshold, presentThreshold, absentThreshold, schoolDays } = req.body;

  const existing = await prisma.attendanceRule.upsert({
    where: { schoolId },
    update: {},
    create: { schoolId },
  });

  const merged = {
    earlyThreshold: earlyThreshold ?? existing.earlyThreshold,
    presentThreshold: presentThreshold ?? existing.presentThreshold,
    absentThreshold: absentThreshold ?? existing.absentThreshold,
    schoolDays: schoolDays ?? existing.schoolDays,
  };

  if (merged.earlyThreshold >= merged.presentThreshold) {
    throw new AppError("earlyThreshold must be less than presentThreshold", 400);
  }
  if (merged.presentThreshold >= merged.absentThreshold) {
    throw new AppError("presentThreshold must be less than absentThreshold", 400);
  }

  const updated = await prisma.attendanceRule.update({
    where: { schoolId },
    data: merged,
  });

  res.json({ attendanceRule: updated });
};