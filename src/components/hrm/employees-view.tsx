"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAppStore, type Employee, type Department } from "@/store/app";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  UserPlus,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  Briefcase,
  Shield,
  UserCheck,
  ChevronRight,
  ChevronDown,
  Filter,
  LayoutGrid,
  LayoutList,
  TrendingUp,
  ArrowUpDown,
  Activity,
  CheckCircle2,
} from "lucide-react";

// ============ TYPES ============

interface PTOBalanceData {
  id: string;
  employeeId: string;
  year: number;
  totalAllocated: number;
  usedSick: number;
  usedVacation: number;
  usedPersonal: number;
  usedOther: number;
}

interface AttendanceSummary {
  totalDays: number;
  totalHours: number;
  avgHoursPerDay: number;
  overtimeHours: number;
}

interface DepartmentWithCount extends Department {
  _count?: { employees: number; geofences: number };
}

interface NewEmployeeForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  departmentId: string;
  payType: string;
  payRate: string;
  hireDate: string;
}

type SortOption = "name_asc" | "department" | "hire_date_newest" | "pay_rate_high";

// ============ HELPERS ============

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName?.[0] || "").toUpperCase()}${(lastName?.[0] || "").toUpperCase()}`;
}

function getRoleBadgeClasses(role: string): string {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    case "hr":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
    case "manager":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    case "employee":
    default:
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
  }
}

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "active":
      return "badge-gradient-emerald";
    case "inactive":
    case "terminated":
      return "badge-gradient-rose";
    case "on_leave":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  }
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case "on_leave":
      return "On Leave";
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "terminated":
      return "Terminated";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function formatRoleLabel(role: string): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "hr":
      return "HR Manager";
    case "manager":
      return "Manager";
    case "employee":
      return "Employee";
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
}

function formatPayType(payType: string | undefined | null): string {
  if (!payType) return "Hourly";
  switch (payType) {
    case "hourly":
      return "Hourly";
    case "salary":
      return "Salary";
    default:
      return payType.charAt(0).toUpperCase() + payType.slice(1);
  }
}

// ============ DEPARTMENT COLORS ============

const DEPT_COLORS = [
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", border: "border-emerald-300 dark:border-emerald-700", text: "text-emerald-700 dark:text-emerald-400", accent: "bg-emerald-500", gradient: "from-emerald-400 to-teal-500" },
  { bg: "bg-violet-100 dark:bg-violet-900/30", border: "border-violet-300 dark:border-violet-700", text: "text-violet-700 dark:text-violet-400", accent: "bg-violet-500", gradient: "from-violet-400 to-purple-500" },
  { bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-300 dark:border-amber-700", text: "text-amber-700 dark:text-amber-400", accent: "bg-amber-500", gradient: "from-amber-400 to-orange-500" },
  { bg: "bg-rose-100 dark:bg-rose-900/30", border: "border-rose-300 dark:border-rose-700", text: "text-rose-700 dark:text-rose-400", accent: "bg-rose-500", gradient: "from-rose-400 to-pink-500" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/30", border: "border-cyan-300 dark:border-cyan-700", text: "text-cyan-700 dark:text-cyan-400", accent: "bg-cyan-500", gradient: "from-cyan-400 to-sky-500" },
  { bg: "bg-lime-100 dark:bg-lime-900/30", border: "border-lime-300 dark:border-lime-700", text: "text-lime-700 dark:text-lime-400", accent: "bg-lime-500", gradient: "from-lime-400 to-green-500" },
  { bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-300 dark:border-orange-700", text: "text-orange-700 dark:text-orange-400", accent: "bg-orange-500", gradient: "from-orange-400 to-red-500" },
  { bg: "bg-teal-100 dark:bg-teal-900/30", border: "border-teal-300 dark:border-teal-700", text: "text-teal-700 dark:text-teal-400", accent: "bg-teal-500", gradient: "from-teal-400 to-emerald-500" },
];

function getDeptColor(deptId: string) {
  let hash = 0;
  for (let i = 0; i < deptId.length; i++) {
    hash = deptId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEPT_COLORS[Math.abs(hash) % DEPT_COLORS.length];
}

// ============ AVATAR COLORS ============

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-green-600",
  "bg-emerald-600",
  "bg-teal-600",
  "bg-cyan-600",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ============ STATUS DOT COLOR ============

function getStatusDotColor(status: string): string {
  switch (status) {
    case "active":
      return "status-dot-active";
    case "on_leave":
      return "status-dot-pending";
    case "inactive":
    case "terminated":
    default:
      return "status-dot-inactive";
  }
}

// ============ ORG CHART VIEW ============

function OrgChartView({
  employees,
  departments,
  onEmployeeClick,
}: {
  employees: Employee[];
  departments: Department[];
  onEmployeeClick: (emp: Employee) => void;
}) {
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  const toggleDept = (deptId: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(deptId)) {
        next.delete(deptId);
      } else {
        next.add(deptId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedDepts(new Set(departments.map((d) => d.id)));
  };

  const collapseAll = () => {
    setExpandedDepts(new Set());
  };

  const deptMap = useMemo(() => {
    const map = new Map<string, Employee[]>();
    for (const emp of employees) {
      const deptId = emp.departmentId || "unassigned";
      if (!map.has(deptId)) map.set(deptId, []);
      map.get(deptId)!.push(emp);
    }
    return map;
  }, [employees]);

  const unassignedEmps = deptMap.get("unassigned") || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            <ChevronRight className="mr-1.5 h-3.5 w-3.5" />
            Collapse All
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {departments.length} departments · {employees.length} employees
        </p>
      </div>

      {/* Company root node */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold">MSBM Corporation</h3>
          <p className="text-sm text-white/80">{employees.length} employees across {departments.length} departments</p>
        </div>
      </div>

      {/* Tree connector */}
      <div className="flex flex-col gap-0">
        <div className="flex justify-center">
          <div className="w-px h-6 bg-border" />
        </div>
        <div className="flex justify-center">
          <div className="w-px h-3 bg-border" />
        </div>
      </div>

      {/* Departments */}
      <div className="space-y-2">
        {departments.map((dept, idx) => {
          const color = getDeptColor(dept.id);
          const deptEmps = deptMap.get(dept.id) || [];
          const isExpanded = expandedDepts.has(dept.id);
          const isLast = idx === departments.length - 1;

          return (
            <div key={dept.id} className="relative">
              {/* Department card */}
              <div
                className={`relative flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${color.border} ${isExpanded ? color.bg : "bg-white dark:bg-gray-950"}`}
                onClick={() => toggleDept(dept.id)}
              >
                {/* Gradient top border */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg bg-gradient-to-r ${color.gradient}`} />

                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color.accent} text-white flex-shrink-0`}>
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {dept.name}
                    </h4>
                    <Badge variant="outline" className={`text-[10px] ${color.bg} ${color.text} border-transparent`}>
                      {dept.code}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {deptEmps.length} employee{deptEmps.length !== 1 ? "s" : ""}
                    {deptEmps.length > 0 && (
                      <span> · Head: {deptEmps.find((e) => e.role === "manager") ? `${deptEmps.find((e) => e.role === "manager")!.firstName} ${deptEmps.find((e) => e.role === "manager")!.lastName}` : "Not assigned"}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="avatar-stack">
                    {deptEmps.slice(0, 4).map((emp) => (
                      <Avatar key={emp.id} className="avatar-stack-item h-6 w-6 border-2 border-white dark:border-gray-950">
                        <AvatarFallback className={`${getAvatarColor(emp.id)} text-white text-[8px]`}>
                          {getInitials(emp.firstName, emp.lastName)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {deptEmps.length > 4 && (
                      <div className="avatar-stack-item flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-[9px] font-medium text-gray-600 dark:text-gray-300">
                        +{deptEmps.length - 4}
                      </div>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded employee list */}
              {isExpanded && deptEmps.length > 0 && (
                <div className="ml-8 mt-1 border-l-2 border-dashed border-border pl-4 space-y-2">
                  {deptEmps.map((emp) => (
                    <div
                      key={emp.id}
                      className="relative flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border border-border/50 cursor-pointer transition-all hover:shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800"
                      onClick={() => onEmployeeClick(emp)}
                    >
                      {/* Tree connector dot */}
                      <div className="absolute -left-[22px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-background" />

                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className={`${getAvatarColor(emp.id)} text-white text-xs font-semibold`}>
                            {getInitials(emp.firstName, emp.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${getStatusDotColor(emp.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <Badge variant="outline" className={`text-[10px] ${getRoleBadgeClasses(emp.role)}`}>
                            {formatRoleLabel(emp.role)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{emp.employeeId}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">
                            {emp.payType === "salary" ? `$${(emp.payRate || 0).toLocaleString()}/yr` : `$${(emp.payRate || 0).toFixed(2)}/hr`}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {isExpanded && deptEmps.length === 0 && (
                <div className="ml-8 mt-1 border-l-2 border-dashed border-border pl-4 py-4 text-center">
                  <p className="text-sm text-muted-foreground">No employees in this department</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Unassigned employees */}
        {unassignedEmps.length > 0 && (
          <div className="relative">
            <div
              className="relative flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
              onClick={() => toggleDept("unassigned")}
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-lg bg-gradient-to-r from-gray-400 to-gray-500" />
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-400 text-white flex-shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Unassigned</h4>
                <p className="text-xs text-muted-foreground">{unassignedEmps.length} employee{unassignedEmps.length !== 1 ? "s" : ""} without department</p>
              </div>
              {expandedDepts.has("unassigned") ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {expandedDepts.has("unassigned") && (
              <div className="ml-8 mt-1 border-l-2 border-dashed border-border pl-4 space-y-2">
                {unassignedEmps.map((emp) => (
                  <div
                    key={emp.id}
                    className="relative flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border border-border/50 cursor-pointer transition-all hover:shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800"
                    onClick={() => onEmployeeClick(emp)}
                  >
                    <div className="absolute -left-[22px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-background" />
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className={`${getAvatarColor(emp.id)} text-white text-xs font-semibold`}>
                          {getInitials(emp.firstName, emp.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${getStatusDotColor(emp.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">
                        {emp.firstName} {emp.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">{emp.employeeId}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ EMPLOYEE CARD COMPONENT ============

function EmployeeCard({
  emp,
  onClick,
}: {
  emp: Employee;
  onClick: () => void;
}) {
  const color = getDeptColor(emp.departmentId);

  const joinedAgo = emp.hireDate
    ? formatDistanceToNow(new Date(emp.hireDate), { addSuffix: true })
    : null;

  return (
    <div
      className="group relative flex flex-col rounded-xl border border-border/60 bg-white dark:bg-gray-950 overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-200 dark:hover:border-emerald-800"
      onClick={onClick}
    >
      {/* Gradient top border based on department */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${color.gradient} flex-shrink-0`} />

      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Header: Avatar + Name + Status */}
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <Avatar className="h-11 w-11">
              <AvatarFallback className={`${getAvatarColor(emp.id)} text-white text-sm font-semibold`}>
                {getInitials(emp.firstName, emp.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-950 ${getStatusDotColor(emp.status)}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
              {emp.firstName} {emp.lastName}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {emp.employeeId}
            </p>
          </div>
        </div>

        {/* Role & Department */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
              {formatRoleLabel(emp.role)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {emp.department?.name || "Unassigned"}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <Badge variant="outline" className={`text-[10px] ${getRoleBadgeClasses(emp.role)}`}>
            {formatRoleLabel(emp.role)}
          </Badge>
          <Badge
            variant="outline"
            className={`text-[10px] ${emp.payType === "salary" ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800" : "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800"}`}
          >
            {emp.payType === "salary" ? "Full-time" : "Part-time"}
          </Badge>
          <Badge
            variant="outline"
            className={`text-[10px] ${getStatusBadgeClasses(emp.status)}`}
          >
            {formatStatusLabel(emp.status)}
          </Badge>
        </div>

        {/* Footer: joined date + pay */}
        <Separator className="mt-3 mb-2" />
        <div className="flex items-center justify-between">
          {joinedAgo && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Joined {joinedAgo}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
            <DollarSign className="h-3 w-3" />
            <span>
              {emp.payType === "salary"
                ? `$${(emp.payRate || 0).toLocaleString()}/yr`
                : `$${(emp.payRate || 0).toFixed(2)}/hr`}
            </span>
          </div>
        </div>
      </CardContent>
    </div>
  );
}

// ============ ACTIVITY TIMELINE ============

function ActivityTimeline({ employee }: { employee: Employee }) {
  const activities = useMemo(() => {
    const hireDateStr = employee.hireDate
      ? format(new Date(employee.hireDate), "MMMM d, yyyy")
      : "Date unknown";

    return [
      {
        id: "1",
        icon: <MapPin className="h-3.5 w-3.5" />,
        title: "Clock in at Geofence HQ",
        time: "2 hours ago",
        color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      },
      {
        id: "2",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        title: "PTO request approved",
        time: "Yesterday",
        color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
      },
      {
        id: "3",
        icon: <DollarSign className="h-3.5 w-3.5" />,
        title: "Payroll processed",
        time: "5 days ago",
        color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      },
      {
        id: "4",
        icon: <UserCheck className="h-3.5 w-3.5" />,
        title: "Profile updated",
        time: "2 weeks ago",
        color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
      },
      {
        id: "5",
        icon: <Users className="h-3.5 w-3.5" />,
        title: "Joined the company",
        time: hireDateStr,
        color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      },
    ];
  }, [employee]);

  return (
    <div className="relative space-y-0">
      {/* Timeline line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

      {activities.map((activity, idx) => (
        <div key={activity.id} className="relative flex gap-4 py-3">
          {/* Timeline dot */}
          <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${activity.color}`}>
            {activity.icon}
          </div>
          {/* Content */}
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {activity.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ PAY PERIOD BREAKDOWN ============

function PayPeriodBreakdown({ employee }: { employee: Employee }) {
  const grossPay = employee.payType === "salary"
    ? (employee.payRate || 0) / 26
    : (employee.payRate || 0) * 80;

  const deductions = grossPay * 0.25;
  const netPay = grossPay * 0.75;

  return (
    <div className="rounded-lg border p-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-teal-600" />
        Last Pay Period
      </h4>
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Gross Pay"
          value={`$${grossPay.toFixed(2)}`}
          color="emerald"
        />
        <StatCard
          label="Deductions"
          value={`$${deductions.toFixed(2)}`}
          color="amber"
        />
        <StatCard
          label="Net Pay"
          value={`$${netPay.toFixed(2)}`}
          color="teal"
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        Estimated based on current pay rate · Bi-weekly period
      </p>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export function EmployeesView() {
  const { employees, setEmployees, departments, setDepartments } =
    useAppStore();

  // Local state
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name_asc");
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [isLoading, setIsLoading] = useState(true);
  const [mainTab, setMainTab] = useState("directory");

  // Profile dialog
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const [ptoBalance, setPtoBalance] = useState<PTOBalanceData | null>(null);
  const [attendanceSummary, setAttendanceSummary] =
    useState<AttendanceSummary | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Add employee dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewEmployeeForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "employee",
    departmentId: "",
    payType: "hourly",
    payRate: "",
    hireDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [formErrors, setFormErrors] = useState<Partial<NewEmployeeForm>>({});

  // Department data with counts
  const [deptWithCounts, setDeptWithCounts] = useState<DepartmentWithCount[]>(
    []
  );

  // ============ DATA FETCHING ============

  const fetchAllEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/employees");
      if (!res.ok) throw new Error("Failed to fetch all employees");
      const data = await res.json();
      const emps = data.employees || [];
      setAllEmployees(emps);
    } catch {
      // silently fail for background fetch
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (filterDepartment !== "all")
        params.set("departmentId", filterDepartment);
      if (filterRole !== "all") params.set("role", filterRole);
      if (filterStatus !== "all") params.set("status", filterStatus);

      const res = await fetch(`/api/employees?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      const emps = data.employees || [];
      setFilteredEmployees(emps);
      setEmployees(emps);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterDepartment, filterRole, filterStatus, setEmployees]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch("/api/departments");
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      const depts = data.departments || [];
      setDepartments(depts);
      setDeptWithCounts(depts);
    } catch {
      toast.error("Failed to load departments");
    }
  }, [setDepartments]);

  useEffect(() => {
    fetchEmployees();
    fetchAllEmployees();
  }, [fetchEmployees, fetchAllEmployees]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // ============ SORTING ============

  const sortedEmployees = useMemo(() => {
    const sorted = [...filteredEmployees];
    switch (sortBy) {
      case "name_asc":
        sorted.sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case "department":
        sorted.sort((a, b) => {
          const deptA = a.department?.name || "zzz";
          const deptB = b.department?.name || "zzz";
          return deptA.localeCompare(deptB);
        });
        break;
      case "hire_date_newest":
        sorted.sort((a, b) => {
          const dateA = a.hireDate ? new Date(a.hireDate).getTime() : 0;
          const dateB = b.hireDate ? new Date(b.hireDate).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "pay_rate_high":
        sorted.sort((a, b) => {
          const rateA = a.payType === "salary" ? (a.payRate || 0) / 2080 : (a.payRate || 0);
          const rateB = b.payType === "salary" ? (b.payRate || 0) / 2080 : (b.payRate || 0);
          return rateB - rateA;
        });
        break;
    }
    return sorted;
  }, [filteredEmployees, sortBy]);

  // ============ EMPLOYEE PROFILE DATA ============

  const fetchEmployeeProfile = useCallback(
    async (employee: Employee) => {
      setSelectedEmployee(employee);
      setProfileOpen(true);
      setProfileLoading(true);
      setPtoBalance(null);
      setAttendanceSummary(null);

      try {
        const currentYear = new Date().getFullYear();

        const [ptoRes, attRes] = await Promise.all([
          fetch(
            `/api/pto-balances?userId=${employee.id}&year=${currentYear}`
          ),
          fetch(`/api/attendance/records?userId=${employee.id}&limit=100`),
        ]);

        if (ptoRes.ok) {
          const ptoData = await ptoRes.json();
          setPtoBalance(ptoData.balance || null);
        }

        if (attRes.ok) {
          const attData = await attRes.json();
          const records = attData.records || [];
          const totalHours = records.reduce(
            (sum: number, r: Record<string, unknown>) =>
              sum + (Number(r.totalHours) || 0),
            0
          );
          const overtimeHours = records.reduce(
            (sum: number, r: Record<string, unknown>) =>
              sum + (Number(r.overtimeHours) || 0),
            0
          );

          setAttendanceSummary({
            totalDays: records.length,
            totalHours: Math.round(totalHours * 100) / 100,
            avgHoursPerDay:
              records.length > 0
                ? Math.round((totalHours / records.length) * 100) / 100
                : 0,
            overtimeHours: Math.round(overtimeHours * 100) / 100,
          });
        }
      } catch {
        toast.error("Failed to load employee profile data");
      } finally {
        setProfileLoading(false);
      }
    },
    []
  );

  // ============ ADD EMPLOYEE ============

  const validateForm = useCallback((): boolean => {
    const errors: Partial<NewEmployeeForm> = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.departmentId) errors.departmentId = "Department is required";
    if (!formData.hireDate) errors.hireDate = "Hire date is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          payRate: parseFloat(formData.payRate) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create employee");
      }

      toast.success("Employee added successfully");
      setAddDialogOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "employee",
        departmentId: "",
        payType: "hourly",
        payRate: "",
        hireDate: format(new Date(), "yyyy-MM-dd"),
      });
      setFormErrors({});
      fetchEmployees();
      fetchDepartments();
      fetchAllEmployees();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add employee");
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm, fetchEmployees, fetchDepartments, fetchAllEmployees]);

  // ============ COMPUTED VALUES ============

  const activeCount = employees.filter((e) => e.status === "active").length;
  const onLeaveCount = employees.filter((e) => e.status === "on_leave").length;
  const totalCount = employees.length;

  // ============ YTD compensation estimate ============

  const ytdEstimate = useMemo(() => {
    if (!selectedEmployee) return 0;
    const rate = selectedEmployee.payRate || 0;
    if (selectedEmployee.payType === "salary") return rate;
    // hourly: assume 2080 hours/year
    return Math.round(rate * 2080);
  }, [selectedEmployee]);

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Employees
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your organization&apos;s workforce, view profiles, and track
            department assignments.
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-100 dark:border-emerald-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeCount}
              </p>
              <p className="text-xs text-muted-foreground">Active Employees</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-100 dark:border-amber-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {onLeaveCount}
              </p>
              <p className="text-xs text-muted-foreground">On Leave</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-teal-100 dark:border-teal-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalCount}
              </p>
              <p className="text-xs text-muted-foreground">Total Employees</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Summary Cards */}
      {deptWithCounts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            Departments
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {deptWithCounts.map((dept) => {
              const color = getDeptColor(dept.id);
              return (
                <Card
                  key={dept.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${color.border} ${filterDepartment === dept.id ? color.bg : ""}`}
                  onClick={() => {
                    setFilterDepartment(
                      filterDepartment === dept.id ? "all" : dept.id
                    );
                    setMainTab("directory");
                  }}
                >
                  <div className={`h-1 w-full rounded-t-lg bg-gradient-to-r ${color.gradient}`} />
                  <CardContent className="p-3 text-center">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      {dept.code}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {dept.name}
                    </div>
                    <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {(dept as DepartmentWithCount & { _count?: { employees: number } })._count
                        ?.employees || 0}{" "}
                      employees
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Tabs: Directory | Org Chart */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="directory" className="gap-1.5">
            <Users className="h-4 w-4" />
            Directory
          </TabsTrigger>
          <TabsTrigger value="orgchart" className="gap-1.5">
            <Building2 className="h-4 w-4" />
            Org Chart
          </TabsTrigger>
        </TabsList>

        {/* ===== DIRECTORY TAB ===== */}
        <TabsContent value="directory" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Employee Directory
                </CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground mr-1">
                    Showing {sortedEmployees.length} of {totalCount} employees
                  </p>
                  <Button
                    variant={viewMode === "card" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("card")}
                    className={viewMode === "card" ? "bg-emerald-600 hover:bg-emerald-700 text-white h-8 w-8 p-0" : "h-8 w-8 p-0"}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className={viewMode === "table" ? "bg-emerald-600 hover:bg-emerald-700 text-white h-8 w-8 p-0" : "h-8 w-8 p-0"}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col gap-3 mt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Filter className="h-3.5 w-3.5" />
                    Filters:
                  </div>
                  <Select
                    value={filterDepartment}
                    onValueChange={setFilterDepartment}
                  >
                    <SelectTrigger className="w-full sm:w-[170px] h-9 text-sm">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-full sm:w-[140px] h-9 text-sm">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="hr">HR Manager</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[140px] h-9 text-sm">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>

                  <Separator orientation="vertical" className="hidden sm:block h-6 mx-1" />

                  {/* Sort */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Sort:
                  </div>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-full sm:w-[170px] h-9 text-sm">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="hire_date_newest">Hire Date (Newest)</SelectItem>
                      <SelectItem value="pay_rate_high">Pay Rate (High-Low)</SelectItem>
                    </SelectContent>
                  </Select>

                  {(filterDepartment !== "all" ||
                    filterRole !== "all" ||
                    filterStatus !== "all" ||
                    searchQuery ||
                    sortBy !== "name_asc") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-9 text-xs"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterDepartment("all");
                        setFilterRole("all");
                        setFilterStatus("all");
                        setSortBy("name_asc");
                      }}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
              ) : sortedEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No employees found
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : viewMode === "table" ? (
                /* ===== TABLE VIEW ===== */
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="data-table-header border-border/50 hover:bg-transparent">
                        <TableHead className="min-w-[220px]">Employee</TableHead>
                        <TableHead className="min-w-[180px] hidden md:table-cell">
                          Email
                        </TableHead>
                        <TableHead className="min-w-[130px] hidden sm:table-cell">
                          Department
                        </TableHead>
                        <TableHead className="min-w-[100px] hidden lg:table-cell">
                          Role
                        </TableHead>
                        <TableHead className="min-w-[90px] hidden lg:table-cell">
                          Pay Type
                        </TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[110px] hidden sm:table-cell">
                          Hire Date
                        </TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedEmployees.map((emp) => (
                        <TableRow
                          key={emp.id}
                          className="data-table-row cursor-pointer"
                          onClick={() => fetchEmployeeProfile(emp)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback
                                    className={`${getAvatarColor(emp.id)} text-white text-xs font-semibold`}
                                  >
                                    {getInitials(emp.firstName, emp.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-950 ${emp.status === "active" ? "status-dot-active" : emp.status === "on_leave" ? "status-dot-pending" : "status-dot-inactive"}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                  {emp.firstName} {emp.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {emp.employeeId}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{emp.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {emp.department?.name || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge
                              variant="outline"
                              className={`text-[11px] ${getRoleBadgeClasses(emp.role)}`}
                            >
                              {formatRoleLabel(emp.role)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {formatPayType(emp.payType)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[11px] ${getStatusBadgeClasses(emp.status)}`}
                            >
                              <span
                                className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${emp.status === "active" ? "status-dot-active" : emp.status === "on_leave" ? "status-dot-pending" : "status-dot-inactive"}`}
                              />
                              {formatStatusLabel(emp.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm text-muted-foreground">
                                {emp.hireDate
                                  ? format(new Date(emp.hireDate), "MMM d, yyyy")
                                  : "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                /* ===== CARD VIEW ===== */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  {sortedEmployees.map((emp) => (
                    <EmployeeCard
                      key={emp.id}
                      emp={emp}
                      onClick={() => fetchEmployeeProfile(emp)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ORG CHART TAB ===== */}
        <TabsContent value="orgchart" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Organization Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[700px] pr-2">
                <OrgChartView
                  employees={allEmployees.length > 0 ? allEmployees : employees}
                  departments={departments}
                  onEmployeeClick={fetchEmployeeProfile}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============ EMPLOYEE PROFILE DIALOG ============ */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[660px] max-h-[85vh] overflow-y-auto">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback
                        className={`${getAvatarColor(selectedEmployee.id)} text-white text-lg font-bold`}
                      >
                        {getInitials(
                          selectedEmployee.firstName,
                          selectedEmployee.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white dark:border-gray-950 ${getStatusDotColor(selectedEmployee.status)}`} />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {selectedEmployee.firstName}{" "}
                      {selectedEmployee.lastName}
                    </DialogTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {selectedEmployee.employeeId}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${getRoleBadgeClasses(selectedEmployee.role)}`}
                      >
                        {formatRoleLabel(selectedEmployee.role)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${getStatusBadgeClasses(selectedEmployee.status)}`}
                      >
                        {formatStatusLabel(selectedEmployee.status)}
                      </Badge>
                      {selectedEmployee.department?.name && (
                        <Badge variant="outline" className="text-[11px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                          {selectedEmployee.department.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-2">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="compensation">Compensation</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="pto">PTO</TabsTrigger>
                </TabsList>

                {/* ===== Overview Tab ===== */}
                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem
                      icon={<Mail className="h-4 w-4" />}
                      label="Email"
                      value={selectedEmployee.email}
                    />
                    <InfoItem
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone"
                      value={selectedEmployee.phone || "Not set"}
                    />
                    <InfoItem
                      icon={<Building2 className="h-4 w-4" />}
                      label="Department"
                      value={selectedEmployee.department?.name || "Not assigned"}
                    />
                    <InfoItem
                      icon={<Briefcase className="h-4 w-4" />}
                      label="Role"
                      value={formatRoleLabel(selectedEmployee.role)}
                    />
                    <InfoItem
                      icon={<Calendar className="h-4 w-4" />}
                      label="Hire Date"
                      value={
                        selectedEmployee.hireDate
                          ? format(
                              new Date(selectedEmployee.hireDate),
                              "MMMM d, yyyy"
                            )
                          : "Not set"
                      }
                    />
                    <InfoItem
                      icon={<MapPin className="h-4 w-4" />}
                      label="Work Location"
                      value={
                        selectedEmployee.workLocation?.name || "Not assigned"
                      }
                    />
                  </div>

                  {(selectedEmployee.address ||
                    selectedEmployee.emergencyContact) && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Additional Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedEmployee.address && (
                          <InfoItem
                            icon={<MapPin className="h-4 w-4" />}
                            label="Address"
                            value={selectedEmployee.address}
                          />
                        )}
                        {selectedEmployee.emergencyContact && (
                          <InfoItem
                            icon={<AlertCircle className="h-4 w-4" />}
                            label="Emergency Contact"
                            value={`${selectedEmployee.emergencyContact}${selectedEmployee.emergencyPhone ? ` — ${selectedEmployee.emergencyPhone}` : ""}`}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* ===== Activity Tab ===== */}
                <TabsContent value="activity" className="mt-4">
                  <div className="p-4 rounded-lg border bg-gray-50/50 dark:bg-gray-900/30">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-600" />
                      Recent Activity
                    </h4>
                    <ActivityTimeline employee={selectedEmployee} />
                  </div>
                </TabsContent>

                {/* ===== Compensation Tab ===== */}
                <TabsContent value="compensation" className="mt-4 space-y-4">
                  {/* Pay breakdown card */}
                  <div className="rounded-lg border p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      Pay Breakdown
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-md bg-white/80 dark:bg-gray-900/50 p-3">
                        <p className="text-xs text-muted-foreground">Pay Type</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                          {formatPayType(selectedEmployee.payType)}
                        </p>
                      </div>
                      <div className="rounded-md bg-white/80 dark:bg-gray-900/50 p-3">
                        <p className="text-xs text-muted-foreground">Pay Rate</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                          {selectedEmployee.payType === "salary"
                            ? `$${(selectedEmployee.payRate || 0).toLocaleString()}/yr`
                            : `$${(selectedEmployee.payRate || 0).toFixed(2)}/hr`}
                        </p>
                      </div>
                      <div className="rounded-md bg-white/80 dark:bg-gray-900/50 p-3">
                        <p className="text-xs text-muted-foreground">Overtime Rate</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                          {selectedEmployee.overtimeRate || 1.5}x
                        </p>
                      </div>
                      <div className="rounded-md bg-white/80 dark:bg-gray-900/50 p-3">
                        <p className="text-xs text-muted-foreground">YTD Estimate</p>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          ${ytdEstimate.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Last pay period (mock) */}
                  <PayPeriodBreakdown employee={selectedEmployee} />

                  {/* Tax info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem
                      icon={<Shield className="h-4 w-4" />}
                      label="Tax Filing Status"
                      value={
                        selectedEmployee.taxFilingStatus
                          ? selectedEmployee.taxFilingStatus.charAt(0).toUpperCase() +
                            selectedEmployee.taxFilingStatus.slice(1)
                          : "Not set"
                      }
                    />
                    <InfoItem
                      icon={<Clock className="h-4 w-4" />}
                      label="Overtime Rate"
                      value={`${selectedEmployee.overtimeRate || 1.5}x`}
                    />
                  </div>
                </TabsContent>

                {/* ===== Attendance Tab ===== */}
                <TabsContent value="attendance" className="mt-4 space-y-4">
                  {profileLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
                    </div>
                  ) : attendanceSummary ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <StatCard
                        label="Total Days"
                        value={attendanceSummary.totalDays.toString()}
                        color="emerald"
                      />
                      <StatCard
                        label="Total Hours"
                        value={attendanceSummary.totalHours.toFixed(1)}
                        color="teal"
                      />
                      <StatCard
                        label="Avg Hours/Day"
                        value={attendanceSummary.avgHoursPerDay.toFixed(1)}
                        color="cyan"
                      />
                      <StatCard
                        label="Overtime Hours"
                        value={attendanceSummary.overtimeHours.toFixed(1)}
                        color="amber"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No attendance records found
                    </p>
                  )}
                </TabsContent>

                {/* ===== PTO Balance Tab ===== */}
                <TabsContent value="pto" className="mt-4 space-y-4">
                  {profileLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
                    </div>
                  ) : ptoBalance ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <StatCard
                          label="Total Allocated"
                          value={ptoBalance.totalAllocated.toFixed(1)}
                          color="emerald"
                        />
                        <StatCard
                          label="Used Sick"
                          value={ptoBalance.usedSick.toFixed(1)}
                          color="red"
                        />
                        <StatCard
                          label="Used Vacation"
                          value={ptoBalance.usedVacation.toFixed(1)}
                          color="amber"
                        />
                        <StatCard
                          label="Used Personal"
                          value={ptoBalance.usedPersonal.toFixed(1)}
                          color="purple"
                        />
                        <StatCard
                          label="Used Other"
                          value={ptoBalance.usedOther.toFixed(1)}
                          color="gray"
                        />
                        <StatCard
                          label="Remaining"
                          value={(
                            ptoBalance.totalAllocated -
                            ptoBalance.usedSick -
                            ptoBalance.usedVacation -
                            ptoBalance.usedPersonal -
                            ptoBalance.usedOther
                          ).toFixed(1)}
                          color="teal"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        PTO balance for{" "}
                        {new Date().getFullYear()}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No PTO balance found for{" "}
                      {new Date().getFullYear()}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ============ ADD EMPLOYEE DIALOG ============ */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Add New Employee
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className={formErrors.firstName ? "border-red-500" : ""}
                />
                {formErrors.firstName && (
                  <p className="text-xs text-red-500">{formErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className={formErrors.lastName ? "border-red-500" : ""}
                />
                {formErrors.lastName && (
                  <p className="text-xs text-red-500">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            {/* Department & Role Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, departmentId: val })
                  }
                >
                  <SelectTrigger
                    className={formErrors.departmentId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.departmentId && (
                  <p className="text-xs text-red-500">
                    {formErrors.departmentId}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) =>
                    setFormData({ ...formData, role: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pay Type, Pay Rate, Hire Date */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payType">Pay Type</Label>
                <Select
                  value={formData.payType}
                  onValueChange={(val) =>
                    setFormData({ ...formData, payType: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pay type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payRate">Pay Rate</Label>
                <Input
                  id="payRate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.payRate}
                  onChange={(e) =>
                    setFormData({ ...formData, payRate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">
                  Hire Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) =>
                    setFormData({ ...formData, hireDate: e.target.value })
                  }
                  className={formErrors.hireDate ? "border-red-500" : ""}
                />
                {formErrors.hireDate && (
                  <p className="text-xs text-red-500">{formErrors.hireDate}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Employee
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ SUB-COMPONENTS ============

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm text-gray-900 dark:text-white mt-0.5 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
    teal: "bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800",
    cyan: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800",
    amber: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
    red: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    purple: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800",
    gray: "bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:border-gray-700",
  };

  const textColorMap: Record<string, string> = {
    emerald: "text-emerald-700 dark:text-emerald-400",
    teal: "text-teal-700 dark:text-teal-400",
    cyan: "text-cyan-700 dark:text-cyan-400",
    amber: "text-amber-700 dark:text-amber-400",
    red: "text-red-700 dark:text-red-400",
    purple: "text-purple-700 dark:text-purple-400",
    gray: "text-gray-700 dark:text-gray-400",
  };

  return (
    <div
      className={`rounded-lg border p-3 text-center ${colorMap[color] || colorMap.gray}`}
    >
      <p className={`text-2xl font-bold ${textColorMap[color] || textColorMap.gray}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
