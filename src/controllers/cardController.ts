import { Request, Response } from "express";
import { prisma } from "../db.js";
import { AppError } from "../middleware/errorHandler.js";
import { requireSchoolAdmin } from "../utils/requireSchoolAdmin.js";

export const assignCard = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const { studentId, uid } = req.body;

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.schoolId !== schoolId) {
    throw new AppError("Student not found", 404);
  }

  const activeClash = await prisma.card.findFirst({
    where: { schoolId, uid, status: "active" },
  });
  if (activeClash) {
    throw new AppError("This card UID is already active", 409);
  }

  const card = await prisma.card.create({
    data: { uid, schoolId, studentId, status: "active" },
  });

  res.status(201).json({ card });
};

export const revokeCard = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const id = req.params.id as string;

  const card = await prisma.card.findUnique({ where: { id } });
  if (!card || card.schoolId !== schoolId) {
    throw new AppError("Card not found", 404);
  }

  if (card.status === "revoked") {
    throw new AppError("Card is already revoked", 409);
  }

  const updated = await prisma.card.update({
    where: { id },
    data: { status: "revoked", revokedAt: new Date() },
  });

  res.json({ card: updated });
};