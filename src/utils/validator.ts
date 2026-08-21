import { z } from "zod";

export const registerSchoolSchema = z.object({
  schoolName: z.string().min(2, "School name must be at least 2 characters"),
  adminName: z.string().min(2, "Admin name must be at least 2 characters"),
  email: z.email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createStudentSchema = z.object({
  name: z.string().min(2, "Student name must be at least 2 characters"),
  class: z.string().min(1, "Class is required"),
  admissionNumber: z.string().min(1, "Admission number is required"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});