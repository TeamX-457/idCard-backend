import { Request } from "express";
import { AppError } from "../middleware/errorHandler.js";

export function requireSchoolAdmin(req: Request): string {
  const { role, schoolId } = req.user!;
  if (role !== "SCHOOL_ADMIN" || !schoolId) {
    throw new AppError("Only school admins can perform this action", 403);
  }
  return schoolId;
}