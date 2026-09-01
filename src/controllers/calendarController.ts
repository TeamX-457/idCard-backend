import { Request, Response } from "express";
import { prisma } from "../db.js";
import { AppError } from "../middleware/errorHandler.js";
import { requireSchoolAdmin } from "../utils/requireSchoolAdmin.js";

export const listCalendarExceptions = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const exceptions = await prisma.schoolCalendarException.findMany({
    where: { schoolId },
    orderBy: { date: "asc" },
  });
  res.json({ exceptions });
};

export const createCalendarException = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const { date, type, label } = req.body;

  const existing = await prisma.schoolCalendarException.findUnique({
    where: { schoolId_date: { schoolId, date: new Date(date) } },
  });
  if (existing) {
    throw new AppError("An exception already exists for this date", 409);
  }

  const exception = await prisma.schoolCalendarException.create({
    data: { schoolId, date: new Date(date), type, label },
  });
  res.status(201).json({ exception });
};

export const deleteCalendarException = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const id = req.params.id as string;

  const exception = await prisma.schoolCalendarException.findUnique({ where: { id } });
  if (!exception || exception.schoolId !== schoolId) {
    throw new AppError("Exception not found", 404);
  }

  await prisma.schoolCalendarException.delete({ where: { id } });
  res.status(204).send();
};