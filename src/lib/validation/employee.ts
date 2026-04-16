import { z } from "zod";

// ─── JA Format Validators ───────────────────────────────────────────

/** Tax Registration Number: exactly 9 digits */
export const trnSchema = z
  .string()
  .regex(/^\d{9}$/, "TRN must be exactly 9 digits")
  .nullable()
  .optional();

/** NIS Number: XX-XXXXXX-X format */
export const nisSchema = z
  .string()
  .regex(/^\d{2}-\d{6}-\d{1}$/, "NIS must be in XX-XXXXXX-X format")
  .nullable()
  .optional();

/** PAYE Tax Code: A through E */
export const payeCodeSchema = z
  .enum(["A", "B", "C", "D", "E"])
  .nullable()
  .optional();

// ─── Enums ──────────────────────────────────────────────────────────

export const employeeStatusSchema = z.enum([
  "active", "inactive", "on_leave", "terminated", "probation",
]);

export const payTypeSchema = z.enum(["hourly", "salary"]);

export const contractTypeSchema = z.enum([
  "permanent", "contract", "part_time", "casual", "temporary", "intern",
]);

export const roleTierSchema = z.enum([
  "ancillary", "maintenance", "admin", "ict_tech", "ict_sysadmin",
  "ict_mgmt", "faculty", "executive", "hr",
]);

// ─── Employee Create Schema ─────────────────────────────────────────

export const createEmployeeSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).nullable().optional(),
  role: z.enum(["admin", "hr", "manager", "employee"]).default("employee"),
  department_id: z.string().uuid("Invalid department ID"),
  pay_type: payTypeSchema.default("hourly"),
  pay_rate: z.number().min(0, "Pay rate must be non-negative").default(0),
  overtime_rate: z.number().min(1).max(5).default(1.5),
  hire_date: z.string().or(z.date()),
  work_location_id: z.string().uuid().nullable().optional(),
  address: z.string().nullable().optional(),
  emergency_contact: z.string().nullable().optional(),
  emergency_phone: z.string().nullable().optional(),
  bank_account: z.string().nullable().optional(),
  tax_filing_status: z.string().nullable().optional(),
  tax_allowances: z.number().int().min(0).default(1),

  // JA compliance fields
  trn: trnSchema,
  nis_number: nisSchema,
  nht_number: z.string().max(20).nullable().optional(),
  paye_tax_code: payeCodeSchema,
  contract_type: contractTypeSchema.default("permanent"),
  role_tier: roleTierSchema.default("admin"),
  grade_step: z.number().int().min(1).max(20).default(1),
  reporting_to: z.string().uuid().nullable().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

// ─── Employee Update Schema ─────────────────────────────────────────

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  id: z.string().uuid("Invalid employee ID"),
  status: employeeStatusSchema.optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

// ─── Employee Login Schema ──────────────────────────────────────────

export const loginSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Password Reset Schema ──────────────────────────────────────────

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const passwordResetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});
