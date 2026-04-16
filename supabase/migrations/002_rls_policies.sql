-- ═══════════════════════════════════════════════════════════════════════
-- MSBM-HR Suite — RLS Policies
-- Migration 002: Row-Level Security for department-scoped access
-- ═══════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE kudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE statutory_rates ENABLE ROW LEVEL SECURITY;

-- ─── Helper function: get current employee from auth.users ──────────
CREATE OR REPLACE FUNCTION get_current_employee_id()
RETURNS UUID AS $$
  SELECT id FROM employees WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_current_employee_role()
RETURNS TEXT AS $$
  SELECT role FROM employees WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_current_employee_department()
RETURNS UUID AS $$
  SELECT department_id FROM employees WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin_or_hr()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'hr') FROM employees WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'hr', 'manager') FROM employees WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ═══════════════════════════════════════════════════════════════════════
-- EMPLOYEES — Admin/HR: full access; Manager: dept-scoped; Employee: self
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "employees_select" ON employees FOR SELECT USING (
  is_admin_or_hr()
  OR department_id = get_current_employee_department()
  OR id = get_current_employee_id()
);

CREATE POLICY "employees_insert" ON employees FOR INSERT WITH CHECK (
  is_admin_or_hr()
);

CREATE POLICY "employees_update" ON employees FOR UPDATE USING (
  is_admin_or_hr()
  OR id = get_current_employee_id()  -- Self-service profile update
);

CREATE POLICY "employees_delete" ON employees FOR DELETE USING (
  is_admin_or_hr()
);

-- ═══════════════════════════════════════════════════════════════════════
-- ATTENDANCE — Admin/HR/Manager: dept-scoped; Employee: own records
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "attendance_select" ON attendance FOR SELECT USING (
  is_admin_or_hr()
  OR employee_id = get_current_employee_id()
  OR employee_id IN (
    SELECT id FROM employees WHERE department_id = get_current_employee_department()
    AND is_manager_or_above()
  )
);

CREATE POLICY "attendance_insert" ON attendance FOR INSERT WITH CHECK (
  employee_id = get_current_employee_id()
  OR is_admin_or_hr()
);

CREATE POLICY "attendance_update" ON attendance FOR UPDATE USING (
  is_manager_or_above() OR is_admin_or_hr()
);

-- ═══════════════════════════════════════════════════════════════════════
-- PAYROLL — Admin/HR only; Employee: own records read-only
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "payroll_records_select" ON payroll_records FOR SELECT USING (
  is_admin_or_hr()
  OR employee_id = get_current_employee_id()
);

CREATE POLICY "payroll_records_mutate" ON payroll_records FOR ALL USING (
  is_admin_or_hr()
);

CREATE POLICY "payroll_periods_select" ON payroll_periods FOR SELECT USING (true);
CREATE POLICY "payroll_periods_mutate" ON payroll_periods FOR ALL USING (is_admin_or_hr());

-- ═══════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS — User sees own only
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (
  user_id = get_current_employee_id() OR is_admin_or_hr()
);

CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (
  user_id = get_current_employee_id()
);

-- ═══════════════════════════════════════════════════════════════════════
-- SHIFTS & SCHEDULING — Manager: dept-scoped; Employee: own assignments
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "shifts_select" ON shifts FOR SELECT USING (true);
CREATE POLICY "shifts_mutate" ON shifts FOR ALL USING (is_manager_or_above());

CREATE POLICY "shift_assignments_select" ON shift_assignments FOR SELECT USING (
  is_manager_or_above()
  OR employee_id = get_current_employee_id()
);

CREATE POLICY "shift_assignments_mutate" ON shift_assignments FOR ALL USING (is_manager_or_above());

CREATE POLICY "availabilities_select" ON availabilities FOR SELECT USING (
  is_manager_or_above()
  OR employee_id = get_current_employee_id()
);

CREATE POLICY "availabilities_mutate" ON availabilities FOR ALL USING (
  employee_id = get_current_employee_id()
  OR is_manager_or_above()
);

-- ═══════════════════════════════════════════════════════════════════════
-- TIME ENTRIES — Employee: own; Manager: dept; Admin/HR: all
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "time_entries_select" ON time_entries FOR SELECT USING (
  is_admin_or_hr()
  OR employee_id = get_current_employee_id()
);

CREATE POLICY "time_entries_insert" ON time_entries FOR INSERT WITH CHECK (
  employee_id = get_current_employee_id()
  OR is_admin_or_hr()
);

CREATE POLICY "time_entries_update" ON time_entries FOR UPDATE USING (
  employee_id = get_current_employee_id()
  OR is_manager_or_above()
);

-- ═══════════════════════════════════════════════════════════════════════
-- READ-ONLY TABLES — Public read, admin write
-- ═══════════════════════════════════════════════════════════════════════

-- Companies, Departments, Geofences, Benefits, Courses, Meeting Rooms, Surveys, Feature Flags, Statutory Rates
CREATE POLICY "companies_select" ON companies FOR SELECT USING (true);
CREATE POLICY "companies_mutate" ON companies FOR ALL USING (is_admin_or_hr());

CREATE POLICY "departments_select" ON departments FOR SELECT USING (true);
CREATE POLICY "departments_mutate" ON departments FOR ALL USING (is_admin_or_hr());

CREATE POLICY "geofences_select" ON geofences FOR SELECT USING (true);
CREATE POLICY "geofences_mutate" ON geofences FOR ALL USING (is_admin_or_hr());

CREATE POLICY "benefits_select" ON benefits FOR SELECT USING (true);
CREATE POLICY "benefits_mutate" ON benefits FOR ALL USING (is_admin_or_hr());

CREATE POLICY "courses_select" ON courses FOR SELECT USING (true);
CREATE POLICY "courses_mutate" ON courses FOR ALL USING (is_admin_or_hr());

CREATE POLICY "meeting_rooms_select" ON meeting_rooms FOR SELECT USING (true);
CREATE POLICY "meeting_rooms_mutate" ON meeting_rooms FOR ALL USING (is_admin_or_hr());

CREATE POLICY "feature_flags_select" ON feature_flags FOR SELECT USING (true);
CREATE POLICY "feature_flags_mutate" ON feature_flags FOR ALL USING (is_admin_or_hr());

CREATE POLICY "statutory_rates_select" ON statutory_rates FOR SELECT USING (true);
CREATE POLICY "statutory_rates_mutate" ON statutory_rates FOR ALL USING (is_admin_or_hr());

CREATE POLICY "company_settings_select" ON company_settings FOR SELECT USING (true);
CREATE POLICY "company_settings_mutate" ON company_settings FOR ALL USING (is_admin_or_hr());

CREATE POLICY "department_roles_select" ON department_roles FOR SELECT USING (true);
CREATE POLICY "department_roles_mutate" ON department_roles FOR ALL USING (is_admin_or_hr());

-- ═══════════════════════════════════════════════════════════════════════
-- USER-SCOPED TABLES (own records + admin override)
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "pto_select" ON pto_requests FOR SELECT USING (
  employee_id = get_current_employee_id() OR is_manager_or_above()
);
CREATE POLICY "pto_insert" ON pto_requests FOR INSERT WITH CHECK (
  employee_id = get_current_employee_id() OR is_admin_or_hr()
);
CREATE POLICY "pto_update" ON pto_requests FOR UPDATE USING (
  employee_id = get_current_employee_id() OR is_manager_or_above()
);

CREATE POLICY "pto_balances_select" ON pto_balances FOR SELECT USING (
  employee_id = get_current_employee_id() OR is_admin_or_hr()
);
CREATE POLICY "pto_balances_mutate" ON pto_balances FOR ALL USING (is_admin_or_hr());

CREATE POLICY "expenses_select" ON expense_claims FOR SELECT USING (
  employee_id = get_current_employee_id() OR is_manager_or_above()
);
CREATE POLICY "expenses_insert" ON expense_claims FOR INSERT WITH CHECK (
  employee_id = get_current_employee_id()
);
CREATE POLICY "expenses_update" ON expense_claims FOR UPDATE USING (
  employee_id = get_current_employee_id() OR is_manager_or_above()
);

CREATE POLICY "wellness_select" ON wellness_entries FOR SELECT USING (
  employee_id = get_current_employee_id() OR is_admin_or_hr()
);
CREATE POLICY "wellness_insert" ON wellness_entries FOR INSERT WITH CHECK (
  employee_id = get_current_employee_id()
);

CREATE POLICY "benefit_enrollments_select" ON benefit_enrollments FOR SELECT USING (
  employee_id = get_current_employee_id() OR is_admin_or_hr()
);
CREATE POLICY "benefit_enrollments_mutate" ON benefit_enrollments FOR ALL USING (
  employee_id = get_current_employee_id() OR is_admin_or_hr()
);

CREATE POLICY "course_enrollments_select" ON course_enrollments FOR SELECT USING (
  employee_id = get_current_employee_id() OR is_admin_or_hr()
);
CREATE POLICY "course_enrollments_insert" ON course_enrollments FOR INSERT WITH CHECK (
  employee_id = get_current_employee_id() OR is_admin_or_hr()
);
CREATE POLICY "course_enrollments_update" ON course_enrollments FOR UPDATE USING (
  employee_id = get_current_employee_id() OR is_admin_or_hr()
);

-- ═══════════════════════════════════════════════════════════════════════
-- ANNOUNCEMENTS, CHAT, REVIEWS — broad read, role-gated write
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "announcements_select" ON announcements FOR SELECT USING (true);
CREATE POLICY "announcements_mutate" ON announcements FOR ALL USING (is_manager_or_above());

CREATE POLICY "chat_select" ON chat_messages FOR SELECT USING (
  user_id = get_current_employee_id()
);
CREATE POLICY "chat_insert" ON chat_messages FOR INSERT WITH CHECK (
  user_id = get_current_employee_id()
);

CREATE POLICY "reviews_select" ON performance_reviews FOR SELECT USING (
  employee_id = get_current_employee_id()
  OR reviewer_id = get_current_employee_id()
  OR is_admin_or_hr()
);
CREATE POLICY "reviews_mutate" ON performance_reviews FOR ALL USING (is_manager_or_above());

-- ═══════════════════════════════════════════════════════════════════════
-- MESSAGING, DOCUMENTS, GOALS, KUDOS, BOOKINGS, FEEDBACK
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "channels_select" ON channels FOR SELECT USING (true);
CREATE POLICY "channels_mutate" ON channels FOR ALL USING (is_manager_or_above());

CREATE POLICY "messages_select" ON messages FOR SELECT USING (true);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  sender_id = get_current_employee_id()
);

CREATE POLICY "documents_select" ON documents FOR SELECT USING (
  is_public = true
  OR owner_id = get_current_employee_id()
  OR is_admin_or_hr()
);
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (
  owner_id = get_current_employee_id() OR is_admin_or_hr()
);
CREATE POLICY "documents_update" ON documents FOR UPDATE USING (
  owner_id = get_current_employee_id() OR is_admin_or_hr()
);

CREATE POLICY "goals_select" ON goals FOR SELECT USING (
  owner_id = get_current_employee_id()
  OR is_team_goal = true
  OR is_manager_or_above()
);
CREATE POLICY "goals_mutate" ON goals FOR ALL USING (
  owner_id = get_current_employee_id() OR is_manager_or_above()
);

CREATE POLICY "kudos_select" ON kudos FOR SELECT USING (true);
CREATE POLICY "kudos_insert" ON kudos FOR INSERT WITH CHECK (
  sender_id = get_current_employee_id()
);

CREATE POLICY "bookings_select" ON room_bookings FOR SELECT USING (true);
CREATE POLICY "bookings_insert" ON room_bookings FOR INSERT WITH CHECK (
  booked_by = get_current_employee_id()
);
CREATE POLICY "bookings_update" ON room_bookings FOR UPDATE USING (
  booked_by = get_current_employee_id() OR is_admin_or_hr()
);

CREATE POLICY "surveys_select" ON surveys FOR SELECT USING (true);
CREATE POLICY "surveys_mutate" ON surveys FOR ALL USING (is_admin_or_hr());

CREATE POLICY "feedback_select" ON feedback_entries FOR SELECT USING (
  from_id = get_current_employee_id()
  OR to_id = get_current_employee_id()
  OR is_admin_or_hr()
);
CREATE POLICY "feedback_insert" ON feedback_entries FOR INSERT WITH CHECK (
  from_id = get_current_employee_id()
);

-- ═══════════════════════════════════════════════════════════════════════
-- AUDIT LOGS — Append-only: admin read, no update/delete
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT USING (is_admin_or_hr());
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (true);
-- No UPDATE or DELETE policies = immutable audit trail

-- ═══════════════════════════════════════════════════════════════════════
-- JOB LISTINGS — Public read, admin/hr write
-- ═══════════════════════════════════════════════════════════════════════

CREATE POLICY "job_listings_select" ON job_listings FOR SELECT USING (true);
CREATE POLICY "job_listings_mutate" ON job_listings FOR ALL USING (is_admin_or_hr());
