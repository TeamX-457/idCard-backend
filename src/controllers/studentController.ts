import { Request, Response } from "express";
import { prisma } from "../db.js";
import { AppError } from "../middleware/errorHandler.js";
import { requireSchoolAdmin } from "../utils/requireSchoolAdmin.js";

export const createStudent = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);

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
  const schoolId = requireSchoolAdmin(req);

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
  const schoolId = requireSchoolAdmin(req);
  const id = req.params.id as string;

  const student = await prisma.student.findUnique({ where: { id } });

  if (!student || student.schoolId !== schoolId) {
    throw new AppError("Student not found", 404);
  }

  res.json({ student });
};

export const editStudent = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const id = req.params.id as string;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student || student.schoolId !== schoolId) {
    throw new AppError("Student not found", 404);
  }

  const { name, class: studentClass, admissionNumber, metadata } = req.body;

  if (admissionNumber && admissionNumber !== student.admissionNumber) {
    const clash = await prisma.student.findUnique({
      where: { schoolId_admissionNumber: { schoolId, admissionNumber } },
    });
    if (clash) {
      throw new AppError("A student with this admission number already exists", 409);
    }
  }

  const updated = await prisma.student.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(studentClass && { class: studentClass }),
      ...(admissionNumber && { admissionNumber }),
      ...(metadata !== undefined && { metadata }),
    },
  });

  res.json({ student: updated });
};

export const unregisterStudent = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const id = req.params.id as string;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student || student.schoolId !== schoolId) {
    throw new AppError("Student not found", 404);
  }

  if (student.status === "unregistered") {
    throw new AppError("Student is already unregistered", 409);
  }

  const updated = await prisma.student.update({
    where: { id },
    data: { status: "unregistered" },
  });

  res.json({ student: updated });
};