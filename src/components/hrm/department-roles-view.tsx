"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  Pencil,
  Shield,
  Users,
  Briefcase,
  ChevronRight,
  Building2,
  Settings,
  Monitor,
  UserCog,
  Lock,
} from "lucide-react";

// ─── Interfaces ──────────────────────────────────────────────────

interface DepartmentRole {
  id: string;
  title: string;
  code: string;
  description: string;
  gradeLevel: string;
  reportsTo: string | null;
  isManagement: boolean;
  canApprovePayroll: boolean;
  canAssignRoles: boolean;
  canViewAllEmployees: boolean;
  canEditEmployees: boolean;
  canManageIT: boolean;
  canViewPayroll: boolean;
  canEditPayroll: boolean;
  canManageSchedule: boolean;
  isActive: boolean;
  sortOrder: number;
  department?: {
    id: string;
    name: string;
    code: string;
    color?: string | null;
  };
  _count?: { employees: number };
}

interface PermissionFlag {
  key:
    | "canApprovePayroll"
    | "canAssignRoles"
    | "canViewAllEmployees"
    | "canEditEmployees"
    | "canManageIT"
    | "canViewPayroll"
    | "canEditPayroll"
    | "canManageSchedule";
  label: string;
  description: string;
}

// ─── Constants ──────────────────────────────────────────────────

const PERMISSION_FLAGS: PermissionFlag[] = [
  { key: "canApprovePayroll", label: "Approve Payroll", description: "Can approve and finalize payroll runs" },
  { key: "canAssignRoles", label: "Assign Roles", description: "Can assign and revoke roles for employees" },
  { key: "canViewAllEmployees", label: "View All Employees", description: "Can view employees across all departments" },
  { key: "canEditEmployees", label: "Edit Employees", description: "Can edit employee records and profiles" },
  { key: "canManageIT", label: "Manage IT", description: "Can manage IT systems, access, and integrations" },
  { key: "canViewPayroll", label: "View Payroll", description: "Can view payroll reports and salary data" },
  { key: "canEditPayroll", label: "Edit Payroll", description: "Can create and modify payroll entries" },
  { key: "canManageSchedule", label: "Manage Schedule", description: "Can create and modify work schedules" },
];

const DEPARTMENTS = [
  { id: "all", name: "All Departments", code: "ALL" },
  { id: "dept-1", name: "Maintenance/Support", code: "MNT", color: "#059669" },
  { id: "dept-2", name: "Centre of Excellence", code: "COE", color: "#0d9488" },
  { id: "dept-3", name: "Accounting", code: "ACC", color: "#0891b2" },
  { id: "dept-4", name: "Administrative Staff/Directors", code: "ASD", color: "#7c3aed" },
  { id: "dept-5", name: "Marketing", code: "MKT", color: "#db2777" },
  { id: "dept-6", name: "PSU", code: "PSU", color: "#ea580c" },
  { id: "dept-7", name: "Graduate Programmes", code: "GRP", color: "#ca8a04" },
  { id: "dept-8", name: "Office of Executive Director", code: "OED", color: "#dc2626" },
  { id: "dept-9", name: "Human Resources", code: "HR", color: "#16a34a" },
  { id: "dept-10", name: "Documentation Centre", code: "DOC", color: "#2563eb" },
];

const GRADE_LEVELS = ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "Executive"];

// ─── Default Form State ────────────────────────────────────────

function getDefaultFormState(): Omit<DepartmentRole, "id" | "department" | "_count"> & { departmentId: string } {
  return {
    title: "",
    code: "",
    description: "",
    gradeLevel: "G3",
    reportsTo: null,
    isManagement: false,
    canApprovePayroll: false,
    canAssignRoles: false,
    canViewAllEmployees: false,
    canEditEmployees: false,
    canManageIT: false,
    canViewPayroll: false,
    canEditPayroll: false,
    canManageSchedule: false,
    isActive: true,
    sortOrder: 999,
    departmentId: "dept-1",
  };
}

// ─── Main Component ─────────────────────────────────────────────

export function DepartmentRolesView() {
  const [roles, setRoles] = useState<DepartmentRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<DepartmentRole | null>(null);
  const [formData, setFormData] = useState(getDefaultFormState());

  // Fetch roles on mount
  useEffect(() => {
    async function fetchRoles() {
      try {
        const deptId = departmentFilter === "all" ? "" : departmentFilter;
        const res = await fetch(`/api/department-roles?departmentId=${deptId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setRoles(data);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // API not available — show empty state
      }
      setRoles([]);
      setIsLoading(false);
    }
    fetchRoles();
  }, [departmentFilter]);

  // Filtered roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        !searchQuery ||
        role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.department?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept =
        departmentFilter === "all" ||
        role.department?.id === departmentFilter;
      return matchesSearch && matchesDept && role.isActive;
    });
  }, [roles, searchQuery, departmentFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: roles.filter((r) => r.isActive).length,
      management: roles.filter((r) => r.isActive && r.isManagement).length,
      hrRoles: roles.filter((r) => r.isActive && r.canAssignRoles).length,
      itAdmin: roles.filter((r) => r.isActive && r.canManageIT).length,
    };
  }, [roles]);

  // Reports-to chain resolver
  const getReportsChain = useCallback(
    (roleId: string): string[] => {
      const chain: string[] = [];
      let current: DepartmentRole | undefined = roles.find((r) => r.id === roleId);
      while (current && current.reportsTo) {
        const parent = roles.find((r) => r.id === current!.reportsTo);
        if (parent) {
          chain.push(parent.title);
          current = parent;
        } else {
          break;
        }
      }
      return chain;
    },
    [roles]
  );

  // Open create dialog
  const openCreateDialog = () => {
    setFormData(getDefaultFormState());
    setCreateDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (role: DepartmentRole) => {
    setEditingRole(role);
    setFormData({
      title: role.title,
      code: role.code,
      description: role.description,
      gradeLevel: role.gradeLevel,
      reportsTo: role.reportsTo,
      isManagement: role.isManagement,
      canApprovePayroll: role.canApprovePayroll,
      canAssignRoles: role.canAssignRoles,
      canViewAllEmployees: role.canViewAllEmployees,
      canEditEmployees: role.canEditEmployees,
      canManageIT: role.canManageIT,
      canViewPayroll: role.canViewPayroll,
      canEditPayroll: role.canEditPayroll,
      canManageSchedule: role.canManageSchedule,
      isActive: role.isActive,
      sortOrder: role.sortOrder,
      departmentId: role.department?.id || "dept-1",
    });
    setEditDialogOpen(true);
  };

  // Toggle permission
  const togglePermission = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-emerald-600 dark:text-emerald-400">Department</span> Roles & Permissions
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage role definitions, grade levels, and permission assignments across departments
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-200/60 dark:border-emerald-800/40">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Roles</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-teal-200/60 dark:border-teal-800/40">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/40">
                <Shield className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Management Roles</p>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                  {stats.management}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200/60 dark:border-amber-800/40">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40">
                <UserCog className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">HR Roles</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.hrRoles}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-violet-200/60 dark:border-violet-800/40">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/40">
                <Monitor className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IT Admin Roles</p>
                <p className="text-xl font-bold text-violet-600 dark:text-violet-400">
                  {stats.itAdmin}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles by title, code, or department..."
            className="pl-9 border-emerald-300 focus-visible:ring-emerald-400"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[260px] border-emerald-300">
            <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Role Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => {
              const reportsChain = getReportsChain(role.id);
              return (
                <Card
                  key={role.id}
                  className="border-border/50 hover:shadow-md transition-shadow group"
                >
                  <CardContent className="pt-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold truncate">{role.title}</h3>
                          {role.isManagement && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-[10px]">
                              <Shield className="h-2.5 w-2.5 mr-0.5" />
                              Mgmt
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">
                          {role.code}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                        onClick={() => openEditDialog(role)}
                      >
                        <Pencil className="h-3.5 w-3.5 text-emerald-600" />
                      </Button>
                    </div>

                    {/* Department & Grade */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{
                          borderColor: role.department?.color || "#059669",
                          color: role.department?.color || "#059669",
                        }}
                      >
                        <Building2 className="h-2.5 w-2.5 mr-0.5" />
                        {role.department?.name || "Unassigned"}
                      </Badge>
                      <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 text-[10px]">
                        {role.gradeLevel}
                      </Badge>
                      {role._count && (
                        <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px]">
                          <Users className="h-2.5 w-2.5 mr-0.5" />
                          {role._count.employees} {role._count.employees === 1 ? "member" : "members"}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>

                    {/* Reports-to Chain */}
                    {reportsChain.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground flex-wrap">
                        <span>Reports to:</span>
                        {reportsChain.map((name, idx) => (
                          <span key={idx} className="flex items-center gap-0.5">
                            {idx > 0 && (
                              <ChevronRight className="h-2.5 w-2.5 text-emerald-400" />
                            )}
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              {name}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Permission Mini-badges */}
                    <div className="flex flex-wrap gap-1">
                      {PERMISSION_FLAGS.filter((f) => role[f.key]).map((f) => (
                        <Badge
                          key={f.key}
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0"
                        >
                          {f.label}
                        </Badge>
                      ))}
                      {PERMISSION_FLAGS.filter((f) => role[f.key]).length === 0 && (
                        <span className="text-[10px] text-muted-foreground italic">
                          No special permissions
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Permission Matrix */}
          {filteredRoles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Permission Matrix
                </CardTitle>
                <CardDescription>
                  Overview of all permission flags across {filteredRoles.length} active roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow className="bg-emerald-50 dark:bg-emerald-950/30">
                        <TableHead className="font-semibold min-w-[180px]">Role</TableHead>
                        <TableHead className="font-semibold min-w-[80px]">Grade</TableHead>
                        {PERMISSION_FLAGS.map((flag) => (
                          <TableHead
                            key={flag.key}
                            className="font-semibold text-center min-w-[110px]"
                            title={flag.description}
                          >
                            <span className="text-[10px]">{flag.label}</span>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.map((role) => (
                        <TableRow key={role.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{role.title}</span>
                              {role.isManagement && (
                                <Shield className="h-3 w-3 text-emerald-500" />
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {role.code}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className="text-[10px] bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                              {role.gradeLevel}
                            </Badge>
                          </TableCell>
                          {PERMISSION_FLAGS.map((flag) => (
                            <TableCell key={flag.key} className="text-center">
                              <div className="flex items-center justify-center">
                                <Switch
                                  checked={role[flag.key]}
                                  disabled
                                  className="data-[state=checked]:bg-emerald-600 scale-75"
                                />
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* CREATE / EDIT ROLE DIALOG                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            setEditingRole(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              {editDialogOpen ? (
                <>
                  <Pencil className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Edit Role: {editingRole?.title}
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Create New Role
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editDialogOpen
                ? "Modify role details, grade level, and permission flags"
                : "Define a new role with title, grade level, department, and permissions"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Role Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g., Senior HR Officer"
                    className="border-emerald-300 focus-visible:ring-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Role Code</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                    }
                    placeholder="e.g., SHRO-001"
                    className="border-emerald-300 focus-visible:ring-emerald-400 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Description</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Describe the responsibilities and scope of this role..."
                  rows={2}
                  className="flex w-full rounded-md border border-emerald-300 bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Department</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, departmentId: v }))
                    }
                  >
                    <SelectTrigger className="border-emerald-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.filter((d) => d.id !== "all").map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Grade Level</Label>
                  <Select
                    value={formData.gradeLevel}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, gradeLevel: v }))
                    }
                  >
                    <SelectTrigger className="border-emerald-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVELS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Reports To</Label>
                  <Select
                    value={formData.reportsTo || "none"}
                    onValueChange={(v) =>
                      setFormData((p) => ({
                        ...p,
                        reportsTo: v === "none" ? null : v,
                      }))
                    }
                  >
                    <SelectTrigger className="border-emerald-300">
                      <SelectValue placeholder="Select reporting role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {roles
                        .filter((r) => r.id !== editingRole?.id)
                        .map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.title} ({r.code})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end pb-1">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.isManagement}
                      onCheckedChange={(v) =>
                        setFormData((p) => ({ ...p, isManagement: v }))
                      }
                      className="data-[state=checked]:bg-emerald-600"
                    />
                    <Label className="text-xs font-medium">Management Role</Label>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Permission Flags */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Permission Flags
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PERMISSION_FLAGS.map((flag) => (
                  <div
                    key={flag.key}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <Switch
                      checked={formData[flag.key] as boolean}
                      onCheckedChange={() => togglePermission(flag.key)}
                      className="data-[state=checked]:bg-emerald-600 mt-0.5"
                    />
                    <div>
                      <Label className="text-xs font-medium">{flag.label}</Label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {flag.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setEditDialogOpen(false);
                setEditingRole(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // In production, this would POST/PUT to the API
                if (editDialogOpen && editingRole) {
                  setRoles((prev) =>
                    prev.map((r) =>
                      r.id === editingRole.id
                        ? {
                            ...r,
                            title: formData.title,
                            code: formData.code,
                            description: formData.description,
                            gradeLevel: formData.gradeLevel,
                            reportsTo: formData.reportsTo,
                            isManagement: formData.isManagement,
                            canApprovePayroll: formData.canApprovePayroll,
                            canAssignRoles: formData.canAssignRoles,
                            canViewAllEmployees: formData.canViewAllEmployees,
                            canEditEmployees: formData.canEditEmployees,
                            canManageIT: formData.canManageIT,
                            canViewPayroll: formData.canViewPayroll,
                            canEditPayroll: formData.canEditPayroll,
                            canManageSchedule: formData.canManageSchedule,
                            department: DEPARTMENTS.find((d) => d.id === formData.departmentId),
                          }
                        : r
                    )
                  );
                } else {
                  const newRole: DepartmentRole = {
                    id: `role-${Date.now()}`,
                    title: formData.title,
                    code: formData.code,
                    description: formData.description,
                    gradeLevel: formData.gradeLevel,
                    reportsTo: formData.reportsTo,
                    isManagement: formData.isManagement,
                    canApprovePayroll: formData.canApprovePayroll,
                    canAssignRoles: formData.canAssignRoles,
                    canViewAllEmployees: formData.canViewAllEmployees,
                    canEditEmployees: formData.canEditEmployees,
                    canManageIT: formData.canManageIT,
                    canViewPayroll: formData.canViewPayroll,
                    canEditPayroll: formData.canEditPayroll,
                    canManageSchedule: formData.canManageSchedule,
                    isActive: true,
                    sortOrder: roles.length + 1,
                    department: DEPARTMENTS.find((d) => d.id === formData.departmentId),
                    _count: { employees: 0 },
                  };
                  setRoles((prev) => [...prev, newRole]);
                }
                setCreateDialogOpen(false);
                setEditDialogOpen(false);
                setEditingRole(null);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!formData.title.trim() || !formData.code.trim()}
            >
              {editDialogOpen ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
