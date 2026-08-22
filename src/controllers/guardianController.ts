import { Request, Response } from "express";
import { prisma } from "../db.js";
import { AppError } from "../middleware/errorHandler.js";

export const createGuardian = async (req: Request, res: Response) => {
  const { name, phoneNumber, notificationPreference } = req.body;

  const guardian = await prisma.guardian.create({
    data: {
      name,
      phoneNumber,
      ...(notificationPreference && { notificationPreference }),
    },
  });

  res.status(201).json({ guardian });
};

export const getGuardiansForStudent = async (req: Request, res: Response) => {
  const schoolId = req.user!.schoolId;
  const studentId = req.params.studentId as string;

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.schoolId !== schoolId) {
    throw new AppError("Student not found", 404);
  }

  const links = await prisma.studentGuardian.findMany({
    where: { studentId },
    include: { guardian: true },
  });

  const guardians = links.map((link) => ({
    ...link.guardian,
    relationship: link.relationship,
  }));

  res.json({ guardians });
};

export const getStudentsForGuardian = async (req: Request, res: Response) => {
  const schoolId = req.user!.schoolId as string;
  const guardianId = req.params.guardianId as string;

  const guardian = await prisma.guardian.findUnique({ where: { id: guardianId } });
  if (!guardian) {
    throw new AppError("Guardian not found", 404);
  }

  const links = await prisma.studentGuardian.findMany({
    where: { guardianId, student: { schoolId } },
    include: { student: true },
  });

  const students = links.map((link) => ({
    ...link.student,
    relationship: link.relationship,
  }));

  res.json({ students });
};

export const attachStudentToGuardian = async (req: Request, res: Response) => {
  const schoolId = req.user!.schoolId;
  const guardianId = req.params.guardianId as string;
  const { studentId, relationship } = req.body;

  const guardian = await prisma.guardian.findUnique({ where: { id: guardianId } });
  if (!guardian) {
    throw new AppError("Guardian not found", 404);
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.schoolId !== schoolId) {
    throw new AppError("Student not found", 404);
  }

  const existing = await prisma.studentGuardian.findUnique({
    where: { studentId_guardianId: { studentId, guardianId } },
  });
  if (existing) {
    throw new AppError("This guardian is already linked to this student", 409);
  }

  const link = await prisma.studentGuardian.create({
    data: { studentId, guardianId, relationship },
  });

  res.status(201).json({ link });
};