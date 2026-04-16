// ─── Supabase Database Types ─────────────────────────────────────────
// Auto-generated type definitions for the MSBM-HR database schema.
// Run `npx supabase gen types typescript` to regenerate from live schema.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enums ──────────────────────────────────────────────────────────

export type EmployeeStatus = "active" | "inactive" | "on_leave" | "terminated" | "probation";
export type PayType = "hourly" | "salary";
export type ContractType = "permanent" | "contract" | "part_time" | "casual" | "temporary" | "intern";
export type RoleTier = "ancillary" | "maintenance" | "admin" | "ict_tech" | "ict_sysadmin" | "ict_mgmt" | "faculty" | "executive" | "hr";
export type PayeCode = "A" | "B" | "C" | "D" | "E";
export type AttendanceStatus = "active" | "completed" | "flagged" | "approved";
export type PayrollStatus = "draft" | "processing" | "completed" | "paid";
export type PayrollRecordStatus = "pending" | "approved" | "paid" | "flagged";
export type PTOType = "sick" | "vacation" | "personal" | "other" | "bereavement" | "jury_duty" | "fmla";
export type PTOStatus = "pending" | "approved" | "rejected" | "cancelled";
export type ShiftAssignmentStatus = "scheduled" | "confirmed" | "completed" | "no_show" | "swapped";
export type SwapRequestStatus = "pending" | "approved" | "rejected" | "cancelled";
export type TimeEntryStatus = "draft" | "submitted" | "approved" | "rejected";
export type ExpenseStatus = "draft" | "submitted" | "approved" | "rejected" | "processing" | "paid";
export type DocumentStatus = "active" | "archived" | "expired";
export type CourseStatus = "draft" | "published" | "archived";
export type EnrollmentStatus = "enrolled" | "in_progress" | "completed" | "dropped";
export type GoalStatus = "not_started" | "in_progress" | "completed" | "cancelled";
export type SurveyStatus = "draft" | "active" | "closed";

// ─── Row Types ──────────────────────────────────────────────────────

export interface CompanyRow {
  id: string;
  name: string;
  logo: string | null;
  address: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface DepartmentRow {
  id: string;
  name: string;
  code: string;
  description: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeRow {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  status: EmployeeStatus;
  hire_date: string;
  department_id: string;
  company_id: string;
  pay_type: PayType;
  pay_rate: number;
  overtime_rate: number;
  work_location_id: string | null;
  address: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  bank_account: string | null;
  tax_filing_status: string | null;
  tax_allowances: number;
  // JA compliance fields
  trn: string | null;
  nis_number: string | null;
  nht_number: string | null;
  paye_tax_code: PayeCode | null;
  contract_type: ContractType;
  role_tier: RoleTier;
  grade_step: number;
  reporting_to: string | null;
  auth_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeofenceRow {
  id: string;
  name: string;
  address: string | null;
  type: string;
  is_active: boolean;
  polygon: Json;
  center_lat: number;
  center_lng: number;
  radius: number;
  company_id: string;
  department_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRow {
  id: string;
  employee_id: string;
  geofence_id: string;
  clock_in: string;
  clock_out: string | null;
  clock_in_lat: number;
  clock_in_lng: number;
  clock_out_lat: number | null;
  clock_out_lng: number | null;
  status: AttendanceStatus;
  notes: string | null;
  total_hours: number | null;
  overtime_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface ShiftRow {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  color: string;
  is_active: boolean;
  department_id: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  pto_request_id: string | null;
  created_at: string;
}

// ─── Database interface (for createClient generic) ──────────────────

export interface Database {
  public: {
    Tables: {
      companies: { Row: CompanyRow; Insert: Partial<CompanyRow>; Update: Partial<CompanyRow> };
      departments: { Row: DepartmentRow; Insert: Partial<DepartmentRow>; Update: Partial<DepartmentRow> };
      employees: { Row: EmployeeRow; Insert: Partial<EmployeeRow>; Update: Partial<EmployeeRow> };
      geofences: { Row: GeofenceRow; Insert: Partial<GeofenceRow>; Update: Partial<GeofenceRow> };
      attendance: { Row: AttendanceRow; Insert: Partial<AttendanceRow>; Update: Partial<AttendanceRow> };
      shifts: { Row: ShiftRow; Insert: Partial<ShiftRow>; Update: Partial<ShiftRow> };
      notifications: { Row: NotificationRow; Insert: Partial<NotificationRow>; Update: Partial<NotificationRow> };
      [key: string]: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      employee_status: EmployeeStatus;
      pay_type: PayType;
      contract_type: ContractType;
      role_tier: RoleTier;
      paye_code: PayeCode;
      attendance_status: AttendanceStatus;
    };
  };
}
