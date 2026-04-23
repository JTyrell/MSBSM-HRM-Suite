-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- ═══════════════════════════════════════════════════════════════════════
-- MSBM-HR Suite — PostgreSQL Schema (Supabase)
-- Migration 001: Initial schema — full conversion from Prisma/SQLite
-- ═══════════════════════════════════════════════════════════════════════
-- ═══════════════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TYPE employee_status AS ENUM (
  'active',
  'inactive',
  'on_leave',
  'terminated',
  'probation'
);
CREATE TYPE pay_type AS ENUM ('hourly', 'salary');
CREATE TYPE contract_type AS ENUM (
  'permanent',
  'contract',
  'part_time',
  'casual',
  'temporary',
  'intern'
);
CREATE TYPE role_tier AS ENUM (
  'ancillary',
  'maintenance',
  'admin',
  'ict_tech',
  'ict_sysadmin',
  'ict_mgmt',
  'faculty',
  'executive',
  'hr'
);
CREATE TYPE paye_code AS ENUM ('A', 'B', 'C', 'D', 'E');
CREATE TYPE attendance_status AS ENUM ('active', 'completed', 'flagged', 'approved');
CREATE TYPE payroll_period_status AS ENUM ('draft', 'processing', 'completed', 'paid');
CREATE TYPE payroll_record_status AS ENUM ('pending', 'approved', 'paid', 'flagged');
CREATE TYPE pto_type AS ENUM (
  'sick',
  'vacation',
  'personal',
  'other',
  'bereavement',
  'jury_duty',
  'fmla'
);
CREATE TYPE pto_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'alert', 'success');
CREATE TYPE announcement_category AS ENUM (
  'general',
  'urgent',
  'policy',
  'event',
  'celebration'
);
CREATE TYPE announcement_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE review_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE job_listing_status AS ENUM ('draft', 'open', 'closed', 'filled', 'archived');
CREATE TYPE job_listing_type AS ENUM ('full_time', 'part_time', 'contract', 'remote');
CREATE TYPE shift_assignment_status AS ENUM (
  'scheduled',
  'confirmed',
  'completed',
  'no_show',
  'swapped'
);
CREATE TYPE swap_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE time_entry_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
CREATE TYPE expense_status AS ENUM (
  'draft',
  'submitted',
  'approved',
  'rejected',
  'processing',
  'paid'
);
CREATE TYPE document_status AS ENUM ('active', 'archived', 'expired');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE enrollment_status AS ENUM (
  'enrolled',
  'in_progress',
  'completed',
  'dropped'
);
CREATE TYPE goal_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'cancelled'
);
CREATE TYPE survey_status AS ENUM ('draft', 'active', 'closed');
CREATE TYPE geofence_type AS ENUM ('office', 'remote_site', 'field', 'campus');
CREATE TYPE message_type AS ENUM ('text', 'announcement', 'shift_update', 'system');
CREATE TYPE booking_status AS ENUM ('confirmed', 'pending', 'cancelled');
CREATE TYPE kudos_category AS ENUM (
  'teamwork',
  'innovation',
  'leadership',
  'service',
  'dedication',
  'growth'
);
-- ═══════════════════════════════════════════════════════════════════════ --
-- CORE ORGANIZATION TABLES --
-- ═══════════════════════════════════════════════════════════════════════ --
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  address TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Jamaica',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_departments_company ON departments(company_id);
-- ═══════════════════════════════════════════════════════════════════════
-- EMPLOYEES (extended with JA compliance fields)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL UNIQUE,
  -- e.g. EMP-0001
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'employee',
  -- admin, hr, manager, employee
  status employee_status NOT NULL DEFAULT 'active',
  hire_date DATE NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  pay_type pay_type NOT NULL DEFAULT 'hourly',
  pay_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  overtime_rate NUMERIC(4, 2) NOT NULL DEFAULT 1.5,
  work_location_id UUID,
  -- FK added after geofences table
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  bank_account TEXT,
  tax_filing_status TEXT,
  tax_allowances INTEGER NOT NULL DEFAULT 1,
  -- ─── JA Compliance Fields ─────────────────────────────────────
  trn VARCHAR(9),
  -- Tax Registration Number (9 digits)
  nis_number VARCHAR(12),
  -- NIS format: XX-XXXXXX-X
  nht_number VARCHAR(20),
  -- NHT contribution number
  paye_tax_code paye_code DEFAULT 'A',
  -- PAYE code A-E
  contract_type contract_type NOT NULL DEFAULT 'permanent',
  role_tier role_tier NOT NULL DEFAULT 'admin',
  grade_step INTEGER NOT NULL DEFAULT 1,
  reporting_to UUID REFERENCES employees(id),
  -- ─── Auth Link ────────────────────────────────────────────────
  auth_user_id UUID UNIQUE,
  -- Links to auth.users
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- ─── Constraints ──────────────────────────────────────────────
  CONSTRAINT chk_trn_format CHECK (
    trn IS NULL
    OR trn ~ '^\d{9}$'
  ),
  CONSTRAINT chk_nis_format CHECK (
    nis_number IS NULL
    OR nis_number ~ '^\d{2}-\d{6}-\d{1}$'
  ),
  CONSTRAINT chk_paye_code CHECK (paye_tax_code IN ('A', 'B', 'C', 'D', 'E'))
);
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_auth ON employees(auth_user_id);
-- ═══════════════════════════════════════════════════════════════════════
-- GEOFENCES
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE geofences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  type geofence_type NOT NULL DEFAULT 'office',
  is_active BOOLEAN NOT NULL DEFAULT true,
  polygon JSONB NOT NULL,
  -- GeoJSON polygon
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  radius DOUBLE PRECISION NOT NULL DEFAULT 200,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_geofences_company ON geofences(company_id);
-- Add FK for employees.work_location_id
ALTER TABLE employees
ADD CONSTRAINT fk_employees_work_location FOREIGN KEY (work_location_id) REFERENCES geofences(id);
-- ═══════════════════════════════════════════════════════════════════════
-- ATTENDANCE
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  geofence_id UUID NOT NULL REFERENCES geofences(id),
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  clock_in_lat DOUBLE PRECISION NOT NULL,
  clock_in_lng DOUBLE PRECISION NOT NULL,
  clock_out_lat DOUBLE PRECISION,
  clock_out_lng DOUBLE PRECISION,
  status attendance_status NOT NULL DEFAULT 'active',
  notes TEXT,
  total_hours NUMERIC(6, 2),
  overtime_hours NUMERIC(6, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_clock_in ON attendance(clock_in);
CREATE INDEX idx_attendance_status ON attendance(status);
-- ═══════════════════════════════════════════════════════════════════════
-- SHIFTS & SCHEDULING
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  -- e.g. "09:00"
  end_time TEXT NOT NULL,
  -- e.g. "17:00"
  break_minutes INTEGER NOT NULL DEFAULT 30,
  color TEXT NOT NULL DEFAULT '#10b981',
  is_active BOOLEAN NOT NULL DEFAULT true,
  department_id UUID REFERENCES departments(id),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_shifts_department ON shifts(department_id);
CREATE INDEX idx_shifts_company ON shifts(company_id);
CREATE TABLE shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status shift_assignment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  assigned_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date, shift_id)
);
CREATE INDEX idx_shift_assignments_employee ON shift_assignments(employee_id);
CREATE INDEX idx_shift_assignments_date ON shift_assignments(date);
CREATE TABLE availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (
    day_of_week BETWEEN 0 AND 6
  ),
  -- 0=Sun
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_availabilities_employee ON availabilities(employee_id);
CREATE TABLE swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES employees(id),
  target_id UUID NOT NULL REFERENCES employees(id),
  assignment_id UUID NOT NULL REFERENCES shift_assignments(id),
  target_assignment_id UUID REFERENCES shift_assignments(id),
  status swap_request_status NOT NULL DEFAULT 'pending',
  reason TEXT,
  approved_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE schedule_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  assignment_id UUID REFERENCES shift_assignments(id),
  conflict_type TEXT NOT NULL,
  -- 'overtime', 'double_booking', 'budget_overrun', 'availability'
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  -- 'info', 'warning', 'error'
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ═══════════════════════════════════════════════════════════════════════
-- TIME ENTRIES (Sling-style time tracking)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  break_minutes INTEGER NOT NULL DEFAULT 0,
  total_hours NUMERIC(6, 2),
  description TEXT,
  project TEXT,
  status time_entry_status NOT NULL DEFAULT 'draft',
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_time_entries_status ON time_entries(status);
-- ═══════════════════════════════════════════════════════════════════════
-- PTO (Paid Time Off)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE pto_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_allocated NUMERIC(5, 1) NOT NULL DEFAULT 0,
  used_sick NUMERIC(5, 1) NOT NULL DEFAULT 0,
  used_vacation NUMERIC(5, 1) NOT NULL DEFAULT 0,
  used_personal NUMERIC(5, 1) NOT NULL DEFAULT 0,
  used_other NUMERIC(5, 1) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, year)
);
CREATE INDEX idx_pto_balances_employee ON pto_balances(employee_id);
CREATE TABLE pto_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type pto_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count NUMERIC(4, 1) NOT NULL,
  reason TEXT,
  status pto_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pto_requests_employee ON pto_requests(employee_id);
CREATE INDEX idx_pto_requests_status ON pto_requests(status);
-- ═══════════════════════════════════════════════════════════════════════
-- PAYROLL
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE payroll_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status payroll_period_status NOT NULL DEFAULT 'draft',
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payroll_periods_status ON payroll_periods(status);
CREATE INDEX idx_payroll_periods_company ON payroll_periods(company_id);
CREATE TABLE payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  regular_hours NUMERIC(8, 2) NOT NULL DEFAULT 0,
  overtime_hours NUMERIC(8, 2) NOT NULL DEFAULT 0,
  total_hours NUMERIC(8, 2) NOT NULL DEFAULT 0,
  gross_pay NUMERIC(12, 2) NOT NULL DEFAULT 0,
  -- US-style deductions
  federal_tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
  state_tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
  social_security NUMERIC(10, 2) NOT NULL DEFAULT 0,
  medicare NUMERIC(10, 2) NOT NULL DEFAULT 0,
  health_insurance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  retirement_401k NUMERIC(10, 2) NOT NULL DEFAULT 0,
  -- JA statutory deductions
  nis_employee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  nis_employer NUMERIC(10, 2) NOT NULL DEFAULT 0,
  nht_employee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  nht_employer NUMERIC(10, 2) NOT NULL DEFAULT 0,
  education_tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
  paye NUMERIC(10, 2) NOT NULL DEFAULT 0,
  --
  other_deductions NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(12, 2) NOT NULL DEFAULT 0,
  net_pay NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status payroll_record_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payroll_records_period ON payroll_records(payroll_period_id);
CREATE INDEX idx_payroll_records_employee ON payroll_records(employee_id);
CREATE INDEX idx_payroll_records_status ON payroll_records(status);
-- ═══════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  pto_request_id UUID REFERENCES pto_requests(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
-- ═══════════════════════════════════════════════════════════════════════
-- ANNOUNCEMENTS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category announcement_category NOT NULL DEFAULT 'general',
  priority announcement_priority NOT NULL DEFAULT 'normal',
  author_id UUID NOT NULL REFERENCES employees(id),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_announcements_company ON announcements(company_id);
CREATE INDEX idx_announcements_published ON announcements(is_published);
CREATE TABLE announcement_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, employee_id, emoji)
);
-- ═══════════════════════════════════════════════════════════════════════
-- AI CHAT
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  -- 'user', 'assistant'
  content TEXT NOT NULL,
  agent_type TEXT,
  -- 'hr_assistant', 'pto_fairy', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
-- ═══════════════════════════════════════════════════════════════════════
-- PERFORMANCE REVIEWS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES employees(id),
  cycle_name TEXT NOT NULL,
  status review_status NOT NULL DEFAULT 'pending',
  rating NUMERIC(2, 1) CHECK (
    rating >= 1.0
    AND rating <= 5.0
  ),
  strengths TEXT,
  improvements TEXT,
  goals TEXT,
  overall_comment TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX idx_reviews_reviewer ON performance_reviews(reviewer_id);
CREATE INDEX idx_reviews_status ON performance_reviews(status);
-- ═══════════════════════════════════════════════════════════════════════
-- JOB LISTINGS (Recruitment)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  type job_listing_type NOT NULL DEFAULT 'full_time',
  status job_listing_status NOT NULL DEFAULT 'open',
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  salary_min NUMERIC(12, 2),
  salary_max NUMERIC(12, 2),
  applicant_count INTEGER NOT NULL DEFAULT 0,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_jobs_status ON job_listings(status);
CREATE INDEX idx_jobs_company ON job_listings(company_id);
CREATE TABLE job_applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  stage TEXT NOT NULL DEFAULT 'applied',
  -- applied, screening, interview, offer, hired, rejected
  rating INTEGER CHECK (
    rating >= 1
    AND rating <= 5
  ),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_applicants_job ON job_applicants(job_id);
-- ═══════════════════════════════════════════════════════════════════════
-- DEPARTMENT ROLES (JA University Hierarchy)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE department_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  grade_level INTEGER NOT NULL DEFAULT 1,
  reports_to UUID REFERENCES department_roles(id),
  is_management BOOLEAN NOT NULL DEFAULT false,
  can_approve_payroll BOOLEAN NOT NULL DEFAULT false,
  can_assign_roles BOOLEAN NOT NULL DEFAULT false,
  can_view_all_employees BOOLEAN NOT NULL DEFAULT false,
  can_edit_employees BOOLEAN NOT NULL DEFAULT false,
  can_manage_it BOOLEAN NOT NULL DEFAULT false,
  can_view_payroll BOOLEAN NOT NULL DEFAULT false,
  can_edit_payroll BOOLEAN NOT NULL DEFAULT false,
  can_manage_schedule BOOLEAN NOT NULL DEFAULT false,
  department_id UUID REFERENCES departments(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dept_roles_department ON department_roles(department_id);
CREATE INDEX idx_dept_roles_sort ON department_roles(sort_order);
-- ═══════════════════════════════════════════════════════════════════════
-- COMPANY SETTINGS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT 'MSBM',
  company_address TEXT NOT NULL DEFAULT '',
  company_phone TEXT NOT NULL DEFAULT '',
  company_email TEXT NOT NULL DEFAULT '',
  company_website TEXT NOT NULL DEFAULT '',
  attendance_grace_period INTEGER NOT NULL DEFAULT 5,
  auto_clock_out_hours INTEGER NOT NULL DEFAULT 10,
  require_geofence BOOLEAN NOT NULL DEFAULT true,
  overtime_threshold INTEGER NOT NULL DEFAULT 8,
  payroll_frequency TEXT NOT NULL DEFAULT 'biweekly',
  pay_period_start_day INTEGER NOT NULL DEFAULT 1,
  tax_filing_default TEXT NOT NULL DEFAULT 'single',
  overtime_multiplier NUMERIC(3, 1) NOT NULL DEFAULT 1.5,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  payroll_alerts BOOLEAN NOT NULL DEFAULT true,
  pto_alerts BOOLEAN NOT NULL DEFAULT true,
  compliance_alerts BOOLEAN NOT NULL DEFAULT true,
  two_factor_auth BOOLEAN NOT NULL DEFAULT false,
  session_timeout INTEGER NOT NULL DEFAULT 30,
  password_min_length INTEGER NOT NULL DEFAULT 8,
  -- JA-specific settings
  ja_compliance_enabled BOOLEAN NOT NULL DEFAULT true,
  default_paye_code paye_code NOT NULL DEFAULT 'A',
  currency TEXT NOT NULL DEFAULT 'JMD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ═══════════════════════════════════════════════════════════════════════
-- JA STATUTORY RATES (configurable, date-ranged)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE statutory_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_key TEXT NOT NULL,
  -- 'nis_employee', 'nis_employer', 'nht_employee', etc.
  rate_value NUMERIC(14, 4) NOT NULL,
  -- e.g. 0.03 for 3% or 1500000 for thresholds
  ceiling_value NUMERIC(14, 2),
  -- e.g. 32400 for weekly NIS ceiling
  ceiling_period TEXT,
  -- 'weekly', 'monthly', 'annual'
  description TEXT,
  effective_from DATE NOT NULL,
  expires_on DATE,
  -- NULL = current/no expiry
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rate_key, effective_from)
);
CREATE INDEX idx_statutory_rates_key ON statutory_rates(rate_key);
CREATE INDEX idx_statutory_rates_dates ON statutory_rates(effective_from, expires_on);
-- ═══════════════════════════════════════════════════════════════════════
-- AUDIT LOG (immutable)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  before_data JSONB,
  after_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_module ON audit_logs(module);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
-- ═══════════════════════════════════════════════════════════════════════
-- TEAM HUB — Messaging (Supabase Realtime)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'department',
  -- 'department', 'private', 'group', 'announcement'
  department_id UUID REFERENCES departments(id),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES employees(id),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_channels_company ON channels(company_id);
CREATE INDEX idx_channels_department ON channels(department_id);
CREATE TABLE channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  -- 'admin', 'member'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(channel_id, employee_id)
);
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES employees(id),
  content TEXT NOT NULL,
  type message_type NOT NULL DEFAULT 'text',
  reply_to UUID REFERENCES messages(id),
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);
-- ═══════════════════════════════════════════════════════════════════════
-- EXPENSES
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE expense_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'JMD',
  category TEXT NOT NULL,
  -- 'travel', 'meals', 'supplies', 'equipment', 'training', 'other'
  receipt_url TEXT,
  date_incurred DATE NOT NULL,
  status expense_status NOT NULL DEFAULT 'draft',
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_expenses_employee ON expense_claims(employee_id);
CREATE INDEX idx_expenses_status ON expense_claims(status);
-- ═══════════════════════════════════════════════════════════════════════
-- BENEFITS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  -- 'health', 'dental', 'vision', 'life', 'retirement', 'wellness'
  provider TEXT,
  monthly_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE benefit_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES benefits(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  coverage_type TEXT NOT NULL DEFAULT 'individual',
  -- 'individual', 'family', 'individual_plus_one'
  status TEXT NOT NULL DEFAULT 'active',
  -- 'active', 'pending', 'cancelled'
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, benefit_id)
);
-- ═══════════════════════════════════════════════════════════════════════
-- TRAINING & COURSES
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  -- 'compliance', 'technical', 'leadership', 'safety', 'onboarding'
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  -- 'beginner', 'intermediate', 'advanced'
  duration_hours NUMERIC(5, 1) NOT NULL DEFAULT 1,
  instructor TEXT,
  max_capacity INTEGER,
  status course_status NOT NULL DEFAULT 'published',
  thumbnail_url TEXT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'enrolled',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (
    progress >= 0
    AND progress <= 100
  ),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  score INTEGER CHECK (
    score >= 0
    AND score <= 100
  ),
  UNIQUE(employee_id, course_id)
);
-- ═══════════════════════════════════════════════════════════════════════
-- DOCUMENTS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  -- 'pdf', 'doc', 'xlsx', etc.
  file_size BIGINT,
  category TEXT NOT NULL DEFAULT 'general',
  -- 'policy', 'contract', 'certification', 'personal', 'general'
  status document_status NOT NULL DEFAULT 'active',
  owner_id UUID NOT NULL REFERENCES employees(id),
  department_id UUID REFERENCES departments(id),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  expires_at DATE,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_documents_owner ON documents(owner_id);
CREATE INDEX idx_documents_category ON documents(category);
-- ═══════════════════════════════════════════════════════════════════════
-- GOALS & OKRs
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  status goal_status NOT NULL DEFAULT 'not_started',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (
    progress >= 0
    AND progress <= 100
  ),
  due_date DATE,
  parent_goal UUID REFERENCES goals(id),
  is_team_goal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_goals_owner ON goals(owner_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE TABLE key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_value NUMERIC(12, 2) NOT NULL DEFAULT 100,
  current_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '%',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE goal_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES employees(id),
  note TEXT NOT NULL,
  progress INTEGER CHECK (
    progress >= 0
    AND progress <= 100
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ═══════════════════════════════════════════════════════════════════════
-- KUDOS (Employee Recognition)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE kudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES employees(id),
  receiver_id UUID NOT NULL REFERENCES employees(id),
  message TEXT NOT NULL,
  category kudos_category NOT NULL DEFAULT 'teamwork',
  is_public BOOLEAN NOT NULL DEFAULT true,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_kudos_receiver ON kudos(receiver_id);
CREATE INDEX idx_kudos_sender ON kudos(sender_id);
-- ═══════════════════════════════════════════════════════════════════════
-- MEETING ROOMS & BOOKINGS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE meeting_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  floor TEXT,
  amenities TEXT [],
  -- ['projector', 'whiteboard', 'video_conf']
  is_active BOOLEAN NOT NULL DEFAULT true,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE room_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES meeting_rooms(id) ON DELETE CASCADE,
  booked_by UUID NOT NULL REFERENCES employees(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  attendees UUID [],
  status booking_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_room ON room_bookings(room_id);
CREATE INDEX idx_bookings_time ON room_bookings(start_time, end_time);
-- ═══════════════════════════════════════════════════════════════════════
-- SURVEYS & FEEDBACK
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status survey_status NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES employees(id),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  due_date DATE,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  questions JSONB NOT NULL DEFAULT '[]',
  -- Array of question objects
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE feedback_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  from_id UUID NOT NULL REFERENCES employees(id),
  to_id UUID REFERENCES employees(id),
  type TEXT NOT NULL DEFAULT 'survey',
  -- 'survey', 'peer', 'manager', 'self'
  rating INTEGER CHECK (
    rating >= 1
    AND rating <= 5
  ),
  content TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  responses JSONB,
  -- Survey question responses
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_feedback_from ON feedback_entries(from_id);
CREATE INDEX idx_feedback_to ON feedback_entries(to_id);
-- ═══════════════════════════════════════════════════════════════════════
-- WELLNESS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE wellness_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  -- 'mood', 'activity', 'check_in'
  mood_score INTEGER CHECK (
    mood_score >= 1
    AND mood_score <= 5
  ),
  activity_type TEXT,
  -- 'steps', 'exercise', 'meditation', 'break'
  value NUMERIC(10, 2),
  -- e.g. step count, minutes
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_wellness_employee ON wellness_entries(employee_id);
CREATE INDEX idx_wellness_date ON wellness_entries(date);
-- ═══════════════════════════════════════════════════════════════════════
-- FEATURE FLAGS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ═══════════════════════════════════════════════════════════════════════
-- ONBOARDING TASKS
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  role_tier role_tier,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES employees(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_onboarding_employee ON onboarding_tasks(employee_id);
-- ═══════════════════════════════════════════════════════════════════════
-- UPDATED_AT TRIGGER FUNCTION (auto-update timestamps)
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Apply to all tables with updated_at
DO $$
DECLARE tbl TEXT;
BEGIN FOR tbl IN
SELECT table_name
FROM information_schema.columns
WHERE column_name = 'updated_at'
  AND table_schema = 'public'
  AND table_name != 'audit_logs' LOOP EXECUTE format(
    'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
    tbl,
    tbl
  );
END LOOP;
END;
$$;