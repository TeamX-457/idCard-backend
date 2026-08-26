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

export const editStudentSchema = z.object({
  name: z.string().min(2, "Student name must be at least 2 characters").optional(),
  class: z.string().min(1, "Class is required").optional(),
  admissionNumber: z.string().min(1, "Admission number is required").optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createGuardianSchema = z.object({
  name: z.string().min(2, "Guardian name must be at least 2 characters"),
  phoneNumber: z.string().min(7, "A valid phone number is required"),
  notificationPreference: z.string().optional(),
});

export const attachStudentToGuardianSchema = z.object({
  studentId: z.string().uuid("A valid studentId is required"),
  relationship: z.string().min(1, "Relationship is required"),
});

export const assignCardSchema = z.object({
  studentId: z.string().min(1, "A valid studentId is required"),
  uid: z.string().min(1, "Card UID is required"),
});

export const registerDeviceSchema = z.object({
  locationName: z.string().min(1, "Location name is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});