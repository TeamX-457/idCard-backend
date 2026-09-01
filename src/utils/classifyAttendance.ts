// utils/classifyAttendance.ts
export function classifyStatus(
  eventMinutes: number,
  rule: { earlyThreshold: number; presentThreshold: number }
): "early" | "present" | "late" {
  if (eventMinutes < rule.earlyThreshold) return "early";
  if (eventMinutes <= rule.presentThreshold) return "present";
  return "late";
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}