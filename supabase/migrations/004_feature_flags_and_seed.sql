-- ═══════════════════════════════════════════════════════════════════════
-- MSBM-HR Suite — Feature Flags + Statutory Rates Seed + Default Admin
-- Migration 004: Initial configuration data (no demo data)
-- Updated with real MSBM department/role structure
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Feature Flags ──────────────────────────────────────────────────
INSERT INTO feature_flags (key, enabled, description) VALUES
  ('enabled_ja_compliance', true, 'Jamaican statutory compliance engine (NIS, NHT, EdTax, PAYE)'),
  ('enabled_workforce_mgmt', true, 'Sling-style workforce management (scheduling, time tracking, team hub)'),
  ('enabled_mapbox_geofencing', false, 'Mapbox GL JS-powered geofencing for time clock (requires API key)'),
  ('enabled_realtime_messaging', true, 'Supabase Realtime-powered team messaging in Team Hub'),
  ('enabled_ai_assistant', true, 'AI-powered HR assistant with LLM integration'),
  ('enabled_password_reset', true, 'Allow users to reset passwords via magic link to alternative email');

-- ─── JA Statutory Rates (current as of 2025/2026) ───────────────────
INSERT INTO statutory_rates (rate_key, rate_value, ceiling_value, ceiling_period, description, effective_from) VALUES
  ('nis_employee',    0.03,    32400,  'weekly',  'NIS Employee Contribution: 3% of gross, capped at J$32,400/week', '2024-04-01'),
  ('nis_employer',    0.0375,  32400,  'weekly',  'NIS Employer Contribution: 3.75% of gross, capped at J$32,400/week', '2024-04-01'),
  ('nht_employee',    0.02,    1500000, 'monthly', 'NHT Employee Contribution: 2% of gross, capped at J$1,500,000/month', '2024-04-01'),
  ('nht_employer',    0.03,    1500000, 'monthly', 'NHT Employer Contribution: 3% of gross, capped at J$1,500,000/month', '2024-04-01'),
  ('education_tax',   0.025,   NULL,    NULL,      'Education Tax: 2.5% of gross (no ceiling)', '2024-04-01'),
  ('paye_threshold_a', 1500096, NULL,   'annual',  'PAYE Code A Threshold: J$1,500,096/year', '2024-04-01'),
  ('paye_threshold_b', 1200000, NULL,   'annual',  'PAYE Code B Threshold: J$1,200,000/year', '2024-04-01'),
  ('paye_threshold_c',  900000, NULL,   'annual',  'PAYE Code C Threshold: J$900,000/year',   '2024-04-01'),
  ('paye_threshold_d',  600000, NULL,   'annual',  'PAYE Code D Threshold: J$600,000/year',   '2024-04-01'),
  ('paye_threshold_e',  300000, NULL,   'annual',  'PAYE Code E Threshold: J$300,000/year',   '2024-04-01'),
  ('paye_rate',         0.25,   NULL,   NULL,      'PAYE Rate: 25% of amount above threshold', '2024-04-01'),
  ('max_shift_hours',    12,    NULL,   NULL,      'Maximum shift length in hours (JA labor law)', '2024-04-01'),
  ('mandatory_break_after', 5,  NULL,   NULL,      'Mandatory break required after this many hours', '2024-04-01'),
  ('min_break_minutes',  30,    NULL,   NULL,      'Minimum break duration in minutes', '2024-04-01'),
  ('min_annual_leave',   10,    NULL,   NULL,      'Minimum annual leave days (JA statutory)', '2024-04-01');

-- ─── Default Company ────────────────────────────────────────────────
INSERT INTO companies (id, name, logo, address, timezone)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'MSBM Group',
  '/logo.svg',
  'Mona School of Business and Management, UWI, Kingston 7, Jamaica',
  'America/Jamaica'
);

-- Default company settings
INSERT INTO company_settings (company_id, company_name, company_address, company_phone, company_email, company_website, currency, ja_compliance_enabled)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'MSBM Group',
  'Mona School of Business and Management, UWI, Kingston 7, Jamaica',
  '+1 (876) 927-1234',
  'hr@msbm.edu.jm',
  'https://www.msbm.org.jm',
  'JMD',
  true
);

-- ═══════════════════════════════════════════════════════════════════════
-- REAL MSBM Departments
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO departments (id, name, code, description, company_id) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Maintenance/Support & Service',          'MAINT',  'Facilities maintenance, support services, and office operations',           '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000011', 'Centre of Excellence & Innovation',       'CEI',    'Information systems, technology infrastructure, and technical support',     '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000012', 'Accounting',                              'ACCT',   'Financial planning, payroll processing, and accounting',                   '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000013', 'Administrative Staff/Department Directors','ADMIN',  'Senior leadership, department directors, and university administration',   '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000014', 'Marketing',                               'MKT',    'Marketing, student/alumni services, and programme promotion',              '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000015', 'Professional Services Unit',              'PSU',    'Management consulting, education & training, and professional development','00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000016', 'Graduate Programmes',                     'GRAD',   'Programme coordination, admissions, and student services',                 '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000017', 'Office of the Executive Director',        'EXEC',   'Executive leadership and strategic direction',                             '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000018', 'Human Resources',                         'HR',     'People operations, recruitment, compliance, and administration',           '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000019', 'Documentation Centre',                    'DOC',    'Library services, documentation, and information management',              '00000000-0000-0000-0000-000000000001');

-- ═══════════════════════════════════════════════════════════════════════
-- Department Roles — Real MSBM Job Titles
-- Each role is linked to its department with RBAC permissions scoped:
--   • HR: full system access (manage employees, roles, payroll, compliance)
--   • Accounting: view all employee data, confirm/edit payroll only
--   • CEI/IT: manage IT systems, view employees
--   • Admin/Directors: view all employees, manage their departments
--   • Others: standard employee access
-- ═══════════════════════════════════════════════════════════════════════

-- ── Maintenance/Support & Service ───────────────────────────────────
INSERT INTO department_roles (title, code, department_id, grade_level, is_management, sort_order,
  can_view_all_employees, can_edit_employees, can_view_payroll, can_edit_payroll, can_approve_payroll, can_assign_roles, can_manage_it, can_manage_schedule)
VALUES
  ('Senior Office Attendant',       'MAINT-SOA',  '00000000-0000-0000-0000-000000000010', 3, false, 1,  false, false, false, false, false, false, false),
  ('Departmental Attendant',        'MAINT-DA',   '00000000-0000-0000-0000-000000000010', 1, false, 2,  false, false, false, false, false, false, false),
  ('Senior Departmental Attendant', 'MAINT-SDA',  '00000000-0000-0000-0000-000000000010', 3, false, 3,  false, false, false, false, false, false, false),
  ('Office Attendant',              'MAINT-OA',   '00000000-0000-0000-0000-000000000010', 1, false, 4,  false, false, false, false, false, false, false),
  ('Handyman',                      'MAINT-HM',   '00000000-0000-0000-0000-000000000010', 2, false, 5,  false, false, false, false, false, false, false),
  ('Watchman',                      'MAINT-WM',   '00000000-0000-0000-0000-000000000010', 1, false, 6,  false, false, false, false, false, false, false);

-- ── Centre of Excellence & Innovation / Technical Support ───────────
INSERT INTO department_roles (title, code, department_id, grade_level, is_management, sort_order,
  can_view_all_employees, can_edit_employees, can_view_payroll, can_edit_payroll, can_approve_payroll, can_assign_roles, can_manage_it, can_manage_schedule)
VALUES
  ('Information Systems Manager',   'CEI-ISM',    '00000000-0000-0000-0000-000000000011', 8, true,  1,  true,  false, false, false, false, true,  true,  true),
  ('Computer Technologist',         'CEI-CT',     '00000000-0000-0000-0000-000000000011', 5, false, 2,  false, false, false, false, false, false, true,  false),
  ('Systems Administrator',         'CEI-SA',     '00000000-0000-0000-0000-000000000011', 6, false, 3,  true,  false, false, false, false, true,  true,  false),
  ('Senior Consultant',             'CEI-SC',     '00000000-0000-0000-0000-000000000011', 7, false, 4,  false, false, false, false, false, false, true,  false),
  ('Technical Support Representative','CEI-TSR',  '00000000-0000-0000-0000-000000000011', 3, false, 5,  false, false, false, false, false, false, true,  false);

-- ── Accounting ──────────────────────────────────────────────────────
-- Accounting staff: can VIEW all employee data, can CONFIRM/EDIT payroll, but cannot manage employees/roles
INSERT INTO department_roles (title, code, department_id, grade_level, is_management, sort_order,
  can_view_all_employees, can_edit_employees, can_view_payroll, can_edit_payroll, can_approve_payroll, can_assign_roles, can_manage_it, can_manage_schedule)
VALUES
  ('Accounting Clerk',              'ACCT-CLK',   '00000000-0000-0000-0000-000000000012', 3, false, 1,  true,  false, true,  true,  false, false, false, false),
  ('Assistant Accountant',          'ACCT-AA',    '00000000-0000-0000-0000-000000000012', 5, false, 2,  true,  false, true,  true,  true,  false, false, false);

-- ── Administrative Staff / Department Directors ─────────────────────
INSERT INTO department_roles (title, code, department_id, grade_level, is_management, sort_order,
  can_view_all_employees, can_edit_employees, can_view_payroll, can_edit_payroll, can_approve_payroll, can_assign_roles, can_manage_it, can_manage_schedule)
VALUES
  ('Executive Director of MSBM',   'ADMIN-ED',   '00000000-0000-0000-0000-000000000013', 12, true,  1,  true,  true,  true,  true,  true,  true,  false, true),
  ('Deputy Executive Director',     'ADMIN-DED',  '00000000-0000-0000-0000-000000000013', 11, true,  2,  true,  true,  true,  true,  true,  true,  false, true),
  ('Director of Finance',           'ADMIN-DF',   '00000000-0000-0000-0000-000000000013', 10, true,  3,  true,  false, true,  true,  true,  false, false, false),
  ('Academic Director',             'ADMIN-AD',   '00000000-0000-0000-0000-000000000013', 10, true,  4,  true,  false, false, false, false, false, false, true),
  ('Dir. of Centre of Excellence & Innovation','ADMIN-DCEI','00000000-0000-0000-0000-000000000013', 10, true, 5, true, false, false, false, false, false, true, true),
  ('Dir. of Professional Services Unit','ADMIN-DPSU','00000000-0000-0000-0000-000000000013', 10, true, 6, true, false, false, false, false, false, false, true),
  ('HR and Administration Manager', 'ADMIN-HRAM', '00000000-0000-0000-0000-000000000013', 10, true,  7,  true,  true,  true,  true,  true,  true,  false, true),
  ('Director of Marketing',         'ADMIN-DM',   '00000000-0000-0000-0000-000000000013', 10, true,  8,  true,  false, false, false, false, false, false, true),
  ('MSBM Company Secretary',        'ADMIN-CS',   '00000000-0000-0000-0000-000000000013', 9,  true,  9,  true,  false, false, false, false, false, false, false),
  ('Unit Head',                      'ADMIN-UH',   '00000000-0000-0000-0000-000000000013', 8,  true,  10, true,  false, false, false, false, false, false, true),
  ('Senior Lecturer',                'ADMIN-SL',   '00000000-0000-0000-0000-000000000013', 7,  false, 11, false, false, false, false, false, false, false, false);

-- ── Marketing ───────────────────────────────────────────────────────
INSERT INTO department_roles (title, code, department_id, grade_level, is_management, sort_order,
  can_view_all_employees, can_edit_employees, can_view_payroll, can_edit_payroll, can_approve_payroll, can_assign_roles, can_manage_it, can_manage_schedule)
VALUES
  ('Vincent HoSang Entrepreneurship Programme Coordinator','MKT-VHPC','00000000-0000-0000-0000-000000000014', 5, false, 1, false, false, false, false, false, false, false, false),
  ('Administrative Assistant',      'MKT-AA',     '00000000-0000-0000-0000-000000000014', 3, false, 2,  false, false, false, false, false, false, false, false),
  ('Student & Alumni Services Officer','MKT-SASO','00000000-0000-0000-0000-000000000014', 4, false, 3,  false, false, false, false, false, false, false, false),
  ('Marketing Coordinator',         'MKT-MC',     '00000000-0000-0000-0000-000000000014', 5, false, 4,  false, false, false, false, false, false, false, false);

-- ── Professional Services Unit (PSU) ────────────────────────────────
-- Consulting Analyst from PSU can view limited employee data for project assignment purposes
INSERT INTO department_roles (title, code, department_id, grade_level, is_management, sort_order,
  can_view_all_employees, can_edit_employees, can_view_payroll, can_edit_payroll, can_approve_payroll, can_assign_roles, can_manage_it, can_manage_schedule)
VALUES
  ('Chief Consultant',              'PSU-CC',     '00000000-0000-0000-0000-000000000015', 8, true,  1,  false, false, false, false, false, false, false, true),
  ('Head of Management Consulting', 'PSU-HMC',    '00000000-0000-0000-0000-000000000015', 7, true,  2,  false, false, false, false, false, false, false, true),
  ('Head of Education & Training',  'PSU-HET',    '00000000-0000-0000-0000-000000000015', 7, true,  3,  false, false, false, false, false, false, false, true),
  ('Consultant',                    'PSU-CON',    '00000000-0000-0000-0000-000000000015', 5, false, 4,  false, false, false, false, false, false, false, false),
  ('Consulting Analyst',            'PSU-CA',     '00000000-0000-0000-0000-000000000015', 4, false, 5,  false, false, false, false, false, false, false, false),
  ('Project Officer',               'PSU-PO',     '00000000-0000-0000-0000-000000000015', 4, false, 6,  false, false, false, false, false, false, false, false),
  ('Receptionist',                  'PSU-REC',    '00000000-0000-0000-0000-000000000015', 2, false, 7,  false, false, false, false, false, false, false, false);

-- ── Graduate Programmes ─────────────────────────────────────────────
INSERT INTO department_roles (title, code, department_id, grade_level, is_management, sort_order,
  can_view_all_employees, can_edit_employees, can_view_payroll, can_edit_payroll, can_approve_payroll, can_assign_roles, can_manage_it, can_manage_schedule)
VALUES
  ('Programme Coordinator',         'GRAD-PC',    '00000000-0000-0000-0000-000000000016', 5, false, 1,  false, false, false, false, false, false, false, false),
  ('Admissions Coordinator',        'GRAD-AC',    '00000000-0000-0000-0000-000000000016', 4, false, 2,  false, false, false, false, false, false, false, false),
  ('Programme Officer',             'GRAD-POF',   '00000000-0000-0000-0000-000000000016', 4, false, 3,  false, false, false, false, false, false, false, false),
  ('Student Services',              'GRAD-SS',    '00000000-0000-0000-0000-000000000016', 3, false, 4,  false, false, false, false, false, false, false, false);

-- ── Office of the Executive Director ────────────────────────────────
INSERT INTO department_roles (title, code, department_id, grade_level, is_management, sort_order,
  can_view_all_employees, can_edit_employees, can_view_payroll, can_edit_payroll, can_approve_payroll, can_assign_roles, can_manage_it, can_manage_schedule)
VALUES
  ('Executive-in-Residence',        'EXEC-EIR',   '00000000-0000-0000-0000-000000000017', 10, true, 1,  true,  false, true,  false, false, false, false, false),
  ('Executive Assistant',           'EXEC-EA',    '00000000-0000-0000-0000-000000000017', 5,  false, 2, true,  false, false, false, false, false, false, false);

-- ── Human Resources ─────────────────────────────────────────────────
-- HR staff: FULL system access (manage employees, assign roles, manage payroll, view everything)
-- Administrative Assistants in HR inherit elevated HR permissions
INSERT INTO department_roles (title, code, department_id, grade_level, is_management, sort_order,
  can_view_all_employees, can_edit_employees, can_view_payroll, can_edit_payroll, can_approve_payroll, can_assign_roles, can_manage_it, can_manage_schedule)
VALUES
  ('Facilities & Support Services Manager','HR-FSSM','00000000-0000-0000-0000-000000000018', 7, true, 1, true, true, true, true, true, true, false, true),
  ('Office Manager',                'HR-OM',      '00000000-0000-0000-0000-000000000018', 6, true,  2,  true,  true,  true,  true,  true,  true,  false, true),
  ('Administrative Assistant',      'HR-AA',      '00000000-0000-0000-0000-000000000018', 4, false, 3,  true,  true,  true,  true,  false, true,  false, true),
  ('Secretary',                     'HR-SEC',     '00000000-0000-0000-0000-000000000018', 3, false, 4,  true,  false, true,  false, false, false, false, false),
  ('Receptionist',                  'HR-REC',     '00000000-0000-0000-0000-000000000018', 2, false, 5,  true,  false, false, false, false, false, false, false);

-- ── Documentation Centre ────────────────────────────────────────────
INSERT INTO department_roles (title, code, department_id, grade_level, is_management, sort_order,
  can_view_all_employees, can_edit_employees, can_view_payroll, can_edit_payroll, can_approve_payroll, can_assign_roles, can_manage_it, can_manage_schedule)
VALUES
  ('Supervisor',                    'DOC-SUP',    '00000000-0000-0000-0000-000000000019', 5, true,  1,  false, false, false, false, false, false, false, true),
  ('Library Assistant',             'DOC-LA',     '00000000-0000-0000-0000-000000000019', 2, false, 2,  false, false, false, false, false, false, false, false),
  ('Student Assistant',             'DOC-SA',     '00000000-0000-0000-0000-000000000019', 1, false, 3,  false, false, false, false, false, false, false, false);
