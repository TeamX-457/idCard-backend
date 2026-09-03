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

export const createAttendanceEventSchema = z.object({
  uid: z.string().min(1, "uid is required"),
  eventType: z.enum(["check_in", "check_out"]),
  timestamp: z.string().datetime({ message: "timestamp must be a valid ISO 8601 datetime" }),
});

export const updateAttendanceRuleSchema = z
  .object({
    earlyThreshold: z.number().int().min(0).max(1439).optional(),
    presentThreshold: z.number().int().min(0).max(1439).optional(),
    absentThreshold: z.number().int().min(0).max(1439).optional(),
    schoolDays: z.array(z.number().int().min(0).max(6)).min(1, "At least one school day is required").optional(),
  })
  .refine(
    (data) => {
      const { earlyThreshold, presentThreshold, absentThreshold } = data;
      if (earlyThreshold !== undefined && presentThreshold !== undefined) {
        if (earlyThreshold >= presentThreshold) return false;
      }
      if (presentThreshold !== undefined && absentThreshold !== undefined) {
        if (presentThreshold >= absentThreshold) return false;
      }
      return true;
    },
    { message: "Thresholds must be ordered: early < present < absent" }
  );


  export const createTermSchema = z.object({
  name: z.string().min(1, "Term name is required"),
  startDate: z.string().date("A valid startDate (YYYY-MM-DD) is required"),
  endDate: z.string().date("A valid endDate (YYYY-MM-DD) is required"),
});

export const createCalendarExceptionSchema = z.object({
  date: z.string().date("A valid date (YYYY-MM-DD) is required"),
  type: z.enum(["holiday", "makeup"]),
  label: z.string().min(1, "Label is required"),
});

export const listAttendanceEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  studentId: z.string().min(1).optional(),
  eventType: z.enum(["check_in", "check_out"]).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});