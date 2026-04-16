/**
 * MSBM-HR Suite — Permission Check Utilities
 * 
 * Resolves RBAC permissions based on the employee's department_role record.
 * Used by both API routes (server-side) and React components (client-side).
 * 
 * Scoping rules (per MSBM org structure):
 *   • HR dept staff: full system access (manage employees, assign roles, payroll, compliance)
 *   • Accounting: view ALL employee data, confirm/edit payroll ONLY, cannot manage employees/roles
 *   • CEI/IT (ISM, SysAdmin): manage IT infrastructure, view employees
 *   • Admin/Directors: view all employees, manage their own departments
 *   • PSU Consulting Analyst: limited view for project assignments
 *   • All others: standard self-service employee access
 */

// ─── Department Codes ───────────────────────────────────────────────
export const DEPT_CODES = {
  MAINTENANCE: "MAINT",
  CEI: "CEI",
  ACCOUNTING: "ACCT",
  ADMIN_DIRECTORS: "ADMIN",
  MARKETING: "MKT",
  PSU: "PSU",
  GRADUATE: "GRAD",
  EXEC_OFFICE: "EXEC",
  HR: "HR",
  DOC_CENTRE: "DOC",
} as const;

// ─── Role tier labels for UI display ────────────────────────────────
export const ROLE_TIER_LABELS: Record<string, string> = {
  ancillary: "Ancillary Staff",
  maintenance: "Maintenance & Support",
  admin: "Administrative",
  ict_tech: "ICT Technical",
  ict_sysadmin: "ICT Systems Administrator",
  ict_mgmt: "ICT Management",
  faculty: "Faculty / Academic",
  executive: "Executive Leadership",
  hr: "Human Resources",
};

// ─── Permission shape returned by resolvePermissions ────────────────
export interface EmployeePermissions {
  canViewAllEmployees: boolean;
  canEditEmployees: boolean;
  canViewPayroll: boolean;
  canEditPayroll: boolean;
  canApprovePayroll: boolean;
  canAssignRoles: boolean;
  canManageIT: boolean;
  canManageSchedule: boolean;
  isManagement: boolean;
  isHR: boolean;
  isAccounting: boolean;
  isIT: boolean;
  isExecutive: boolean;
  departmentCode: string;
  roleTier: string;
  gradeLevel: number;
}

/**
 * Resolve permissions from an employee + their department_role record.
 * 
 * @param employee - The employee record (must include department.code and role fields)
 * @param departmentRole - The department_role record (from department_roles table)
 */
export function resolvePermissions(
  employee: {
    role?: string;
    role_tier?: string;
    department?: { code?: string; name?: string } | null;
  },
  departmentRole?: {
    can_view_all_employees?: boolean;
    can_edit_employees?: boolean;
    can_view_payroll?: boolean;
    can_edit_payroll?: boolean;
    can_approve_payroll?: boolean;
    can_assign_roles?: boolean;
    can_manage_it?: boolean;
    can_manage_schedule?: boolean;
    is_management?: boolean;
    grade_level?: number;
    department_id?: string;
  } | null
): EmployeePermissions {
  const deptCode = employee.department?.code || "";
  const roleTier = employee.role_tier || employee.role || "employee";
  const isHR = deptCode === DEPT_CODES.HR || roleTier === "hr";
  const isAccounting = deptCode === DEPT_CODES.ACCOUNTING;
  const isIT = deptCode === DEPT_CODES.CEI;
  const isExecutive = deptCode === DEPT_CODES.EXEC_OFFICE || deptCode === DEPT_CODES.ADMIN_DIRECTORS || roleTier === "executive";

  // HR admin override — HR dept gets full access
  if (isHR || employee.role === "admin") {
    return {
      canViewAllEmployees: true,
      canEditEmployees: true,
      canViewPayroll: true,
      canEditPayroll: true,
      canApprovePayroll: true,
      canAssignRoles: true,
      canManageIT: false,
      canManageSchedule: true,
      isManagement: true,
      isHR: true,
      isAccounting: false,
      isIT: false,
      isExecutive: false,
      departmentCode: deptCode,
      roleTier,
      gradeLevel: departmentRole?.grade_level || 10,
    };
  }

  // Use department_role permissions if available, otherwise derive from dept code
  if (departmentRole) {
    return {
      canViewAllEmployees: departmentRole.can_view_all_employees || false,
      canEditEmployees: departmentRole.can_edit_employees || false,
      canViewPayroll: departmentRole.can_view_payroll || false,
      canEditPayroll: departmentRole.can_edit_payroll || false,
      canApprovePayroll: departmentRole.can_approve_payroll || false,
      canAssignRoles: departmentRole.can_assign_roles || false,
      canManageIT: departmentRole.can_manage_it || false,
      canManageSchedule: departmentRole.can_manage_schedule || false,
      isManagement: departmentRole.is_management || false,
      isHR,
      isAccounting,
      isIT,
      isExecutive,
      departmentCode: deptCode,
      roleTier,
      gradeLevel: departmentRole.grade_level || 1,
    };
  }

  // Fallback: derive permissions from department code alone
  return {
    canViewAllEmployees: isAccounting || isExecutive,
    canEditEmployees: false,
    canViewPayroll: isAccounting,
    canEditPayroll: isAccounting,
    canApprovePayroll: false,
    canAssignRoles: false,
    canManageIT: isIT && (roleTier === "ict_sysadmin" || roleTier === "ict_mgmt"),
    canManageSchedule: false,
    isManagement: false,
    isHR: false,
    isAccounting,
    isIT,
    isExecutive,
    departmentCode: deptCode,
    roleTier,
    gradeLevel: 1,
  };
}

/**
 * Check if a user has permission to access a specific feature.
 * Convenience wrapper around resolvePermissions for guards.
 */
export function hasPermission(
  permissions: EmployeePermissions,
  action: keyof Omit<EmployeePermissions, "departmentCode" | "roleTier" | "gradeLevel" | "isHR" | "isAccounting" | "isIT" | "isExecutive" | "isManagement">
): boolean {
  return permissions[action] === true;
}

/**
 * MSBM Department structure with all real job titles.
 * Used for dropdowns, validation, and the HR admin panel.
 */
export const MSBM_DEPARTMENTS = [
  {
    code: "MAINT",
    name: "Maintenance/Support & Service",
    roles: [
      "Senior Office Attendant", "Departmental Attendant", "Senior Departmental Attendant",
      "Office Attendant", "Handyman", "Watchman",
    ],
  },
  {
    code: "CEI",
    name: "Centre of Excellence & Innovation",
    roles: [
      "Information Systems Manager", "Computer Technologist", "Systems Administrator",
      "Senior Consultant", "Technical Support Representative",
    ],
  },
  {
    code: "ACCT",
    name: "Accounting",
    roles: ["Accounting Clerk", "Assistant Accountant"],
  },
  {
    code: "ADMIN",
    name: "Administrative Staff/Department Directors",
    roles: [
      "Executive Director of MSBM", "Deputy Executive Director", "Director of Finance",
      "Academic Director", "Dir. of Centre of Excellence & Innovation",
      "Dir. of Professional Services Unit", "HR and Administration Manager",
      "Director of Marketing", "MSBM Company Secretary", "Unit Head", "Senior Lecturer",
    ],
  },
  {
    code: "MKT",
    name: "Marketing",
    roles: [
      "Vincent HoSang Entrepreneurship Programme Coordinator", "Administrative Assistant",
      "Student & Alumni Services Officer", "Marketing Coordinator",
    ],
  },
  {
    code: "PSU",
    name: "Professional Services Unit",
    roles: [
      "Chief Consultant", "Head of Management Consulting", "Head of Education & Training",
      "Consultant", "Consulting Analyst", "Project Officer", "Receptionist",
    ],
  },
  {
    code: "GRAD",
    name: "Graduate Programmes",
    roles: ["Programme Coordinator", "Admissions Coordinator", "Programme Officer", "Student Services"],
  },
  {
    code: "EXEC",
    name: "Office of the Executive Director",
    roles: ["Executive-in-Residence", "Executive Assistant"],
  },
  {
    code: "HR",
    name: "Human Resources",
    roles: [
      "Facilities & Support Services Manager", "Office Manager",
      "Administrative Assistant", "Secretary", "Receptionist",
    ],
  },
  {
    code: "DOC",
    name: "Documentation Centre",
    roles: ["Supervisor", "Library Assistant", "Student Assistant"],
  },
] as const;
