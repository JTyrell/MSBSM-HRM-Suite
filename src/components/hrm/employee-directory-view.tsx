"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAppStore, type Employee, type Department } from "@/store/app";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Users,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  Shield,
  MapPin,
  LayoutGrid,
  LayoutList,
  ArrowUpDown,
  Download,
  Activity,
  CheckCircle2,
  UserCheck,
  X,
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

type SortOption =
  | "name_asc"
  | "name_desc"
  | "department"
  | "hire_date_newest"
  | "hire_date_oldest"
  | "pay_rate_high"
  | "pay_rate_low";

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
      return "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright border-msbm-red/20 dark:border-msbm-red/20";
  }
}

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "active":
      return "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright border-msbm-red/20 dark:border-msbm-red/20";
    case "inactive":
    case "terminated":
      return "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    case "on_leave":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  }
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case "on_leave": return "On Leave";
    case "active": return "Active";
    case "inactive": return "Inactive";
    case "terminated": return "Terminated";
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function formatRoleLabel(role: string): string {
  switch (role) {
    case "admin": return "Admin";
    case "hr": return "HR Manager";
    case "manager": return "Manager";
    case "employee": return "Employee";
    default: return role.charAt(0).toUpperCase() + role.slice(1);
  }
}

function getStatusDotColor(status: string): string {
  switch (status) {
    case "active": return "bg-msbm-red/50";
    case "on_leave": return "bg-amber-500";
    case "inactive":
    case "terminated":
    default: return "bg-gray-400";
  }
}

const AVATAR_GRADIENTS = [
  "from-emerald-400 to-inner-blue",
  "from-teal-400 to-cyan-500",
  "from-cyan-400 to-sky-500",
  "from-msbm-red to-green-600",
  "from-teal-500 to-emerald-600",
  "from-cyan-500 to-teal-600",
  "from-green-400 to-emerald-500",
];

function getAvatarGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

// ============ STAT CARD ============

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright",
    teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
  };

  return (
    <div className="rounded-lg bg-muted/50 p-3 text-center">
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      <p className={`text-[10px] font-medium mt-0.5 ${colorMap[color] || colorMap.gray}`}>{label}</p>
    </div>
  );
}

// ============ INFO ITEM ============

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-msbm-red/10 dark:bg-msbm-red/20 text-msbm-red dark:text-msbm-red-bright flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}

// ============ ACTIVITY TIMELINE (Mock) ============

function ActivityTimeline({ employee }: { employee: Employee }) {
  const hireDateStr = employee.hireDate
    ? format(new Date(employee.hireDate), "MMMM d, yyyy")
    : "Date unknown";

  const activities = [
    { icon: <MapPin className="h-3.5 w-3.5" />, title: "Clock in at Geofence HQ", time: "2 hours ago", color: "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright" },
    { icon: <CheckCircle2 className="h-3.5 w-3.5" />, title: "PTO request approved", time: "Yesterday", color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" },
    { icon: <DollarSign className="h-3.5 w-3.5" />, title: "Payroll processed", time: "5 days ago", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
    { icon: <UserCheck className="h-3.5 w-3.5" />, title: "Profile updated", time: "2 weeks ago", color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" },
    { icon: <Users className="h-3.5 w-3.5" />, title: "Joined the company", time: hireDateStr, color: "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright" },
  ];

  return (
    <div className="relative space-y-0">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
      {activities.map((activity) => (
        <div key={activity.title} className="relative flex gap-4 py-3">
          <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${activity.color}`}>
            {activity.icon}
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ EMPLOYEE DIRECTORY CARD ============

function DirectoryCard({
  emp,
  onClick,
}: {
  emp: Employee;
  onClick: () => void;
}) {
  const gradient = getAvatarGradient(emp.id);

  return (
    <div
      className="group relative flex flex-col rounded-xl border border-border/60 bg-white dark:bg-gray-950 overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-msbm-red/20 dark:hover:border-msbm-red/20"
      onClick={onClick}
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-inner-blue flex-shrink-0" />
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Avatar + Name */}
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <Avatar className="h-12 w-12">
              <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white text-sm font-bold`}>
                {getInitials(emp.firstName, emp.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-950 ${getStatusDotColor(emp.status)}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
              {emp.firstName} {emp.lastName}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="outline" className={`text-[10px] ${getRoleBadgeClasses(emp.role)}`}>
                {formatRoleLabel(emp.role)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {emp.department?.name || "Unassigned"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">{emp.email}</span>
          </div>
          {emp.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{emp.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">
              {emp.hireDate ? format(new Date(emp.hireDate), "MMM d, yyyy") : "N/A"}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-3">
          <Badge
            variant="outline"
            className={`text-[10px] ${getStatusBadgeClasses(emp.status)}`}
          >
            {formatStatusLabel(emp.status)}
          </Badge>
        </div>
      </CardContent>
    </div>
  );
}

// ============ LIST ITEM ============

function DirectoryListItem({
  emp,
  onClick,
}: {
  emp: Employee;
  onClick: () => void;
}) {
  const gradient = getAvatarGradient(emp.id);

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-white dark:bg-gray-950 cursor-pointer transition-all hover:shadow-md hover:border-msbm-red/20 dark:hover:border-msbm-red/20"
      onClick={onClick}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white text-xs font-bold`}>
            {getInitials(emp.firstName, emp.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-950 ${getStatusDotColor(emp.status)}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {emp.firstName} {emp.lastName}
          </h3>
          <Badge variant="outline" className={`text-[10px] ${getRoleBadgeClasses(emp.role)}`}>
            {formatRoleLabel(emp.role)}
          </Badge>
          <Badge variant="outline" className={`text-[10px] ${getStatusBadgeClasses(emp.status)}`}>
            {formatStatusLabel(emp.status)}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {emp.department?.name || "Unassigned"}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {emp.email}
          </span>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
        {emp.phone && (
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {emp.phone}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {emp.hireDate ? format(new Date(emp.hireDate), "MMM d, yyyy") : "N/A"}
        </span>
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export function EmployeeDirectoryView() {
  const { employees, departments } = useAppStore();

  // State
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name_asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);

  // Profile dialog
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [ptoBalance, setPtoBalance] = useState<PTOBalanceData | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // ============ DATA FETCHING ============

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/employees");
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      setAllEmployees(data.employees || []);
    } catch {
      toast.error("Failed to load employee directory");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ============ FILTERING ============

  const filteredEmployees = useMemo(() => {
    let result = [...allEmployees];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (emp) =>
          `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          formatRoleLabel(emp.role).toLowerCase().includes(q) ||
          (emp.department?.name || "").toLowerCase().includes(q)
      );
    }

    // Department filter
    if (filterDepartment !== "all") {
      result = result.filter((emp) => emp.departmentId === filterDepartment);
    }

    // Role filter
    if (filterRole !== "all") {
      result = result.filter((emp) => emp.role === filterRole);
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((emp) => emp.status === filterStatus);
    }

    return result;
  }, [allEmployees, searchQuery, filterDepartment, filterRole, filterStatus]);

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
      case "name_desc":
        sorted.sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameB.localeCompare(nameA);
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
      case "hire_date_oldest":
        sorted.sort((a, b) => {
          const dateA = a.hireDate ? new Date(a.hireDate).getTime() : 0;
          const dateB = b.hireDate ? new Date(b.hireDate).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case "pay_rate_high":
        sorted.sort((a, b) => {
          const rateA = a.payType === "salary" ? (a.payRate || 0) / 2080 : (a.payRate || 0);
          const rateB = b.payType === "salary" ? (b.payRate || 0) / 2080 : (b.payRate || 0);
          return rateB - rateA;
        });
        break;
      case "pay_rate_low":
        sorted.sort((a, b) => {
          const rateA = a.payType === "salary" ? (a.payRate || 0) / 2080 : (a.payRate || 0);
          const rateB = b.payType === "salary" ? (b.payRate || 0) / 2080 : (b.payRate || 0);
          return rateA - rateB;
        });
        break;
    }
    return sorted;
  }, [filteredEmployees, sortBy]);

  // ============ PROFILE DIALOG ============

  const openProfile = useCallback(async (employee: Employee) => {
    setSelectedEmployee(employee);
    setProfileOpen(true);
    setProfileLoading(true);
    setPtoBalance(null);
    setAttendanceSummary(null);

    try {
      const currentYear = new Date().getFullYear();
      const [ptoRes, attRes] = await Promise.all([
        fetch(`/api/pto-balances?userId=${employee.id}&year=${currentYear}`),
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
          (sum: number, r: Record<string, unknown>) => sum + (Number(r.totalHours) || 0),
          0
        );
        const overtimeHours = records.reduce(
          (sum: number, r: Record<string, unknown>) => sum + (Number(r.overtimeHours) || 0),
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
  }, []);

  // ============ CSV EXPORT ============

  const exportCSV = useCallback(() => {
    const headers = ["Name", "Email", "Phone", "Role", "Department", "Status", "Hire Date", "Pay Type", "Pay Rate"];
    const rows = sortedEmployees.map((emp) => [
      `${emp.firstName} ${emp.lastName}`,
      emp.email,
      emp.phone || "",
      formatRoleLabel(emp.role),
      emp.department?.name || "Unassigned",
      formatStatusLabel(emp.status),
      emp.hireDate ? format(new Date(emp.hireDate), "yyyy-MM-dd") : "",
      emp.payType === "salary" ? "Salary" : "Hourly",
      emp.payType === "salary"
        ? `$${(emp.payRate || 0).toLocaleString()}/yr`
        : `$${(emp.payRate || 0).toFixed(2)}/hr`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `employee-directory-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${sortedEmployees.length} employees to CSV`);
  }, [sortedEmployees]);

  // ============ CLEAR FILTERS ============

  const hasActiveFilters = searchQuery !== "" || filterDepartment !== "all" || filterRole !== "all" || filterStatus !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterDepartment("all");
    setFilterRole("all");
    setFilterStatus("all");
  };

  // ============ COMPUTED ============

  const activeFilterCount = [
    filterDepartment !== "all",
    filterRole !== "all",
    filterStatus !== "all",
  ].filter(Boolean).length;

  const ytdEstimate = useMemo(() => {
    if (!selectedEmployee) return 0;
    const rate = selectedEmployee.payRate || 0;
    if (selectedEmployee.payType === "salary") return rate;
    return Math.round(rate * 2080);
  }, [selectedEmployee]);

  // ============ RENDER ============

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Employee Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse, search, and filter the entire organization.
          </p>
        </div>
        <Button
          onClick={exportCSV}
          variant="outline"
          disabled={sortedEmployees.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export Directory
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-emerald-100 dark:border-emerald-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-msbm-red/10 dark:bg-msbm-red/20">
              <Users className="h-5 w-5 text-msbm-red dark:text-msbm-red-bright" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sortedEmployees.length}</p>
              <p className="text-xs text-muted-foreground">Showing</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-teal-100 dark:border-teal-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <UserCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sortedEmployees.filter((e) => e.status === "active").length}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
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
                {sortedEmployees.filter((e) => e.status === "on_leave").length}
              </p>
              <p className="text-xs text-muted-foreground">On Leave</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-100 dark:border-purple-900/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{departments.length}</p>
              <p className="text-xs text-muted-foreground">Departments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, role, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-msbm-red hover:bg-msbm-red/80 text-white" : ""}
                aria-label="Grid view"
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-msbm-red hover:bg-msbm-red/80 text-white" : ""}
                aria-label="List view"
                title="List view"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-[160px]">
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
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Name A → Z</SelectItem>
                <SelectItem value="name_desc">Name Z → A</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="hire_date_newest">Hire Date (Newest)</SelectItem>
                <SelectItem value="hire_date_oldest">Hire Date (Oldest)</SelectItem>
                <SelectItem value="pay_rate_high">Pay Rate (High → Low)</SelectItem>
                <SelectItem value="pay_rate_low">Pay Rate (Low → High)</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs whitespace-nowrap">
                <X className="h-3 w-3" />
                Clear Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] ml-1 px-1.5">{activeFilterCount}</Badge>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : sortedEmployees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No employees found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {hasActiveFilters
                ? "Try adjusting your search or filters."
                : "No employees match your criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedEmployees.map((emp) => (
                <DirectoryCard
                  key={emp.id}
                  emp={emp}
                  onClick={() => openProfile(emp)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedEmployees.map((emp) => (
                <DirectoryListItem
                  key={emp.id}
                  emp={emp}
                  onClick={() => openProfile(emp)}
                />
              ))}
            </div>
          )}

          {/* Results Count */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Showing {sortedEmployees.length} of {allEmployees.length} employees
            </p>
          </div>
        </>
      )}

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
                        className={`bg-gradient-to-br ${getAvatarGradient(selectedEmployee.id)} text-white text-lg font-bold`}
                      >
                        {getInitials(selectedEmployee.firstName, selectedEmployee.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white dark:border-gray-950 ${getStatusDotColor(selectedEmployee.status)}`} />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </DialogTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {selectedEmployee.employeeId}
                      </span>
                      <Badge variant="outline" className={`text-[11px] ${getRoleBadgeClasses(selectedEmployee.role)}`}>
                        {formatRoleLabel(selectedEmployee.role)}
                      </Badge>
                      <Badge variant="outline" className={`text-[11px] ${getStatusBadgeClasses(selectedEmployee.status)}`}>
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="compensation">Compensation</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      value={selectedEmployee.hireDate
                        ? format(new Date(selectedEmployee.hireDate), "MMMM d, yyyy")
                        : "Not set"}
                    />
                    <InfoItem
                      icon={<MapPin className="h-4 w-4" />}
                      label="Work Location"
                      value={selectedEmployee.workLocation?.name || "Not assigned"}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                  <div className="p-4 rounded-lg border bg-gray-50/50 dark:bg-gray-900/30">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-msbm-red" />
                      Recent Activity
                    </h4>
                    <ActivityTimeline employee={selectedEmployee} />
                  </div>
                </TabsContent>

                <TabsContent value="compensation" className="mt-4 space-y-4">
                  <div className="rounded-lg border p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-msbm-red/20 dark:border-msbm-red/20">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-msbm-red" />
                      Pay Breakdown
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-md bg-white/80 dark:bg-gray-900/50 p-3">
                        <p className="text-xs text-muted-foreground">Pay Type</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                          {selectedEmployee.payType === "salary" ? "Salary" : "Hourly"}
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
                        <p className="text-sm font-semibold text-msbm-red dark:text-msbm-red-bright mt-0.5">
                          ${ytdEstimate.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem
                      icon={<Shield className="h-4 w-4" />}
                      label="Tax Filing"
                      value={selectedEmployee.taxFilingStatus
                        ? selectedEmployee.taxFilingStatus.charAt(0).toUpperCase() + selectedEmployee.taxFilingStatus.slice(1)
                        : "Not set"}
                    />
                    <InfoItem
                      icon={<Clock className="h-4 w-4" />}
                      label="Overtime Rate"
                      value={`${selectedEmployee.overtimeRate || 1.5}x`}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="attendance" className="mt-4 space-y-4">
                  {profileLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
                    </div>
                  ) : attendanceSummary ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <StatCard label="Total Days" value={attendanceSummary.totalDays.toString()} color="emerald" />
                      <StatCard label="Total Hours" value={attendanceSummary.totalHours.toFixed(1)} color="teal" />
                      <StatCard label="Avg Hours/Day" value={attendanceSummary.avgHoursPerDay.toFixed(1)} color="cyan" />
                      <StatCard label="Overtime Hours" value={attendanceSummary.overtimeHours.toFixed(1)} color="amber" />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No attendance records found
                    </p>
                  )}
                  {profileLoading ? null : ptoBalance ? (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-teal-600" />
                        PTO Balance ({new Date().getFullYear()})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <StatCard label="Total Allocated" value={ptoBalance.totalAllocated.toFixed(1)} color="emerald" />
                        <StatCard label="Used Sick" value={ptoBalance.usedSick.toFixed(1)} color="red" />
                        <StatCard label="Used Vacation" value={ptoBalance.usedVacation.toFixed(1)} color="amber" />
                        <StatCard label="Used Personal" value={ptoBalance.usedPersonal.toFixed(1)} color="purple" />
                        <StatCard label="Used Other" value={ptoBalance.usedOther.toFixed(1)} color="gray" />
                        <StatCard
                          label="Remaining"
                          value={(ptoBalance.totalAllocated - ptoBalance.usedSick - ptoBalance.usedVacation - ptoBalance.usedPersonal - ptoBalance.usedOther).toFixed(1)}
                          color="teal"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No PTO balance found for {new Date().getFullYear()}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
