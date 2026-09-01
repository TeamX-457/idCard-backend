import { Request, Response } from "express";
import { prisma } from "../db.js";
import { AppError } from "../middleware/errorHandler.js";
import { requireSchoolAdmin } from "../utils/requireSchoolAdmin.js";

export const listTerms = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const terms = await prisma.schoolTerm.findMany({
    where: { schoolId },
    orderBy: { startDate: "asc" },
  });
  res.json({ terms });
};

export const createTerm = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const { name, startDate, endDate } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new AppError("startDate must be before endDate", 400);
  }

  const overlap = await prisma.schoolTerm.findFirst({
    where: { schoolId, startDate: { lte: end }, endDate: { gte: start } },
  });
  if (overlap) {
    throw new AppError("This term overlaps an existing term", 409);
  }

  const term = await prisma.schoolTerm.create({
    data: { schoolId, name, startDate: start, endDate: end },
  });
  res.status(201).json({ term });
};

export const deleteTerm = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const id = req.params.id as string;

  const term = await prisma.schoolTerm.findUnique({ where: { id } });
  if (!term || term.schoolId !== schoolId) {
    throw new AppError("Term not found", 404);
  }

  await prisma.schoolTerm.delete({ where: { id } });
  res.status(204).send();
};