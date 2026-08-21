import { Request, Response } from "express";
import { prisma } from "../db.js";
import { hashPassword, comparePassword } from "../lib/password.js";
import { signToken } from "../lib/jwt.js";
import { AppError } from "../middleware/errorHandler.js";

// register school
export const registerSchool = async (req: Request, res: Response) => {
  const { schoolName, adminName, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const passwordHash = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const school = await tx.school.create({ data: { name: schoolName } });

    const user = await tx.user.create({
      data: {
        name: adminName,
        email,
        passwordHash,
        role: "SCHOOL_ADMIN",
        schoolId: school.id,
      },
    });

    return { school, user };
  });

  const token = signToken({
    userId: result.user.id,
    schoolId: result.school.id,
    role: "SCHOOL_ADMIN",
  });

  res.status(201).json({
    token,
    school: result.school,
    user: { id: result.user.id, name: result.user.name, email: result.user.email },
  });
};

// login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { school: true },
  });

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new AppError("Invalid credentials", 401);
  }

  // We cast role to match your TokenPayload interface from jwt.ts
  const token = signToken({
    userId: user.id,
    schoolId: user.schoolId,
    role: user.role as "SUPER_ADMIN" | "SCHOOL_ADMIN", 
  });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    school: user.school,
  });
};