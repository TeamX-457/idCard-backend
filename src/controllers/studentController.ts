import { Request, Response } from "express";
import { prisma } from "../db.js";
import { AppError } from "../middleware/errorHandler.js";

export const createStudent = async (req: Request, res: Response) => {
  const schoolId = req.user!.schoolId;

  if (!schoolId) {
    throw new AppError("Only school admins can create students", 403);
  }

  const { name, class: studentClass, admissionNumber, metadata } = req.body;

  const existing = await prisma.student.findUnique({
    where: { schoolId_admissionNumber: { schoolId, admissionNumber } },
  });

  if (existing) {
    throw new AppError("A student with this admission number already exists", 409);
  }

  const student = await prisma.student.create({
    data: {
      schoolId,
      name,
      class: studentClass,
      admissionNumber,
      metadata,
    },
  });

  res.status(201).json({ student });
};

export const getStudents = async (req: Request, res: Response) => {
  const schoolId = req.user!.schoolId;

  if (!schoolId) {
    throw new AppError("Only school admins can view students", 403);
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where: { schoolId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.student.count({ where: { schoolId } }),
  ]);

  res.json({
    students,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getStudent = async (req: Request, res: Response) => {
  const schoolId = req.user!.schoolId;
  const id = req.params.id as string;

  const student = await prisma.student.findUnique({ where: { id } });

  if (!student || student.schoolId !== schoolId) {
    throw new AppError("Student not found", 404);
  }

  res.json({ student });
};