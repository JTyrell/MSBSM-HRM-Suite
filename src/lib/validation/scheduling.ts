import { z } from "zod";

// ─── Shift Schemas ──────────────────────────────────────────────────

export const createShiftSchema = z.object({
  name: z.string().min(1, "Shift name is required").max(100),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  break_minutes: z.number().int().min(0).max(120).default(30),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").default("#10b981"),
  is_active: z.boolean().default(true),
  department_id: z.string().uuid().nullable().optional(),
});

export type CreateShiftInput = z.infer<typeof createShiftSchema>;

// ─── Shift Assignment Schemas ───────────────────────────────────────

export const shiftAssignmentStatusSchema = z.enum([
  "scheduled", "confirmed", "completed", "no_show", "swapped",
]);

export const createShiftAssignmentSchema = z.object({
  employee_id: z.string().uuid(),
  shift_id: z.string().uuid(),
  date: z.string().or(z.date()),
  status: shiftAssignmentStatusSchema.default("scheduled"),
  notes: z.string().nullable().optional(),
  assigned_by: z.string().uuid().optional(),
});

export type CreateShiftAssignmentInput = z.infer<typeof createShiftAssignmentSchema>;

// ─── Availability Schemas ───────────────────────────────────────────

export const createAvailabilitySchema = z.object({
  employee_id: z.string().uuid(),
  day_of_week: z.number().int().min(0).max(6), // 0 = Sunday
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  is_available: z.boolean().default(true),
  effective_from: z.string().or(z.date()).optional(),
  effective_to: z.string().or(z.date()).nullable().optional(),
});

export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;

// ─── Time Entry Schemas ─────────────────────────────────────────────

export const timeEntryStatusSchema = z.enum([
  "draft", "submitted", "approved", "rejected",
]);

export const createTimeEntrySchema = z.object({
  employee_id: z.string().uuid(),
  date: z.string().or(z.date()),
  start_time: z.string().or(z.date()),
  end_time: z.string().or(z.date()).nullable().optional(),
  break_minutes: z.number().int().min(0).default(0),
  description: z.string().nullable().optional(),
  project: z.string().nullable().optional(),
  gps_lat: z.number().nullable().optional(),
  gps_lng: z.number().nullable().optional(),
});

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;

// ─── Swap Request Schemas ───────────────────────────────────────────

export const swapRequestStatusSchema = z.enum([
  "pending", "approved", "rejected", "cancelled",
]);

export const createSwapRequestSchema = z.object({
  requester_id: z.string().uuid(),
  target_id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  target_assignment_id: z.string().uuid().nullable().optional(),
  reason: z.string().nullable().optional(),
});

export type CreateSwapRequestInput = z.infer<typeof createSwapRequestSchema>;

// ─── Schedule Conflict Detection ────────────────────────────────────

export const conflictTypeSchema = z.enum([
  "overtime", "double_booking", "budget_overrun", "availability", "max_shift",
]);

export interface ScheduleConflict {
  employee_id: string;
  assignment_id?: string;
  conflict_type: z.infer<typeof conflictTypeSchema>;
  description: string;
  severity: "info" | "warning" | "error";
}
