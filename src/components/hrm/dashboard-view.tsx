"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  PlayCircle,
  BarChart3,
  UserPlus,
  MapPin,
  Activity,
  Timer,
  Sun,
  Moon,
  PlaneTakeoff,
  Award,
  Briefcase,
  Megaphone,
  Shield,
  CalendarHeart,
  PartyPopper,
  Building2,
  RefreshCw,
  FileText,
  Star,
  Bot,
  Settings,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/app";
import { formatCurrency } from "@/lib/payroll";
import { formatDistanceToNow } from "date-fns";
import type {
  AttendanceRecord,
  PTORequest,
  Employee,
  Department,
  PayrollPeriod,
} from "@/store/app";

// ─── Color Palette (warm emerald/teal) ───────────────────────────
const CHART_COLORS = [
  "#059669", // emerald-600
  "#0d9488", // teal-600
  "#d97706", // amber-600
  "#dc2626", // red-600
  "#7c3aed", // violet-600
  "#0891b2", // cyan-600
  "#ca8a04", // yellow-600
  "#e11d48", // rose-600
];

const PIE_COLORS = [
  "#059669",
  "#0d9488",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ca8a04",
  "#e11d48",
];

// ─── Stat Card Data Shape ─────────────────────────────────────────
interface StatCardData {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: string; direction: "up" | "down"; label: string };
  colorClass: string;
  bgColorClass: string;
  borderColorClass: string;
}

// ─── Helper: get initials ─────────────────────────────────────────
function getInitials(firstName: string, lastName: string): string {
  return `${(firstName?.[0] || "").toUpperCase()}${(lastName?.[0] || "").toUpperCase()}`;
}

// ─── Helper: format relative time ─────────────────────────────────
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Helper: format time ──────────────────────────────────────────
function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Activity Feed Types ──────────────────────────────────────────
interface ActivityItem {
  id: string;
  type: "attendance" | "pto" | "announcement" | "system";
  title: string;
  description: string;
  timestamp: string;
  department: string;
  icon: "clock" | "calendar" | "megaphone" | "shield";
}

interface WhosOutItem {
  id: string;
  firstName: string;
  lastName: string;
  type: string;
  department: string;
}

// ─── Upcoming Events Mock Data ────────────────────────────────────
const UPCOMING_EVENTS = [
  {
    id: "evt-1",
    title: "Company Picnic",
    date: "Jul 15",
    type: "social" as const,
    icon: PartyPopper,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgColorClass: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    id: "evt-2",
    title: "Q3 All Hands",
    date: "Jul 20",
    type: "meeting" as const,
    icon: Building2,
    colorClass: "text-teal-600 dark:text-teal-400",
    bgColorClass: "bg-teal-50 dark:bg-teal-950/40",
  },
  {
    id: "evt-3",
    title: "Summer Shutdown",
    date: "Aug 1–5",
    type: "holiday" as const,
    icon: CalendarHeart,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgColorClass: "bg-amber-50 dark:bg-amber-950/40",
  },
];

// ─── World Clock Types ────────────────────────────────────────────
interface TimezoneClock {
  city: string;
  timezone: string;
  label: string;
}

const TIMEZONE_CLOCKS: TimezoneClock[] = [
  { city: "New York", timezone: "America/New_York", label: "Company HQ" },
  { city: "London", timezone: "Europe/London", label: "EMEA Office" },
  { city: "Tokyo", timezone: "Asia/Tokyo", label: "APAC Office" },
  { city: "Sydney", timezone: "Australia/Sydney", label: "ANZ Office" },
];

// ─── World Clock Component ──────────────────────────────────────────
function WorldClockWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="transition-all duration-300 hover:shadow-md card-lift">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              World Clock
            </CardTitle>
            <CardDescription className="mt-1">Global office timezones</CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TIMEZONE_CLOCKS.map((tz) => {
            const timeStr = now.toLocaleTimeString("en-US", {
              timeZone: tz.timezone,
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            });
            const dateStr = now.toLocaleDateString("en-US", {
              timeZone: tz.timezone,
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            const hour = parseInt(
              now.toLocaleTimeString("en-US", {
                timeZone: tz.timezone,
                hour: "numeric",
                hour12: false,
              }),
              10
            );
            const isDay = hour >= 6 && hour < 20;

            return (
              <div
                key={tz.city}
                className={`relative rounded-xl p-3 border transition-all duration-300 ${
                  isDay
                    ? "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200/60 dark:border-amber-800/40"
                    : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/40 dark:to-slate-900/40 border-slate-300/60 dark:border-slate-700/40"
                }`}
              >
                {/* Day/Night indicator */}
                <div className="absolute top-2.5 right-2.5">
                  {isDay ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-slate-500" />
                  )}
                </div>
                <p className="text-xs font-medium text-muted-foreground truncate pr-6">
                  {tz.city}
                </p>
                <p className="text-lg font-bold tracking-tight tabular-nums mt-0.5">
                  {timeStr}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{dateStr}</p>
                <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-black/20 font-medium text-muted-foreground">
                  {tz.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export function DashboardView() {
  const {
    employees,
    setEmployees,
    attendance,
    setAttendance,
    ptoRequests,
    setPtoRequests,
    departments,
    setDepartments,
    payrollPeriods,
    setPayrollPeriods,
    setCurrentView,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState<
    { name: string; value: number }[]
  >([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [whosOutToday, setWhosOutToday] = useState<WhosOutItem[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(true);

  // ─── Fetch all dashboard data on mount ──────────────────────────
  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const [attRes, ptoRes, empRes, deptRes, payrollRes] = await Promise.all([
          fetch("/api/attendance/records?limit=50").catch(() => null),
          fetch("/api/pto?status=pending").catch(() => null),
          fetch("/api/employees").catch(() => null),
          fetch("/api/departments").catch(() => null),
          fetch("/api/payroll").catch(() => null),
        ]);

        if (attRes?.ok) {
          const data = await attRes.json();
          setAttendance(data.records || []);
        }
        if (ptoRes?.ok) {
          const data = await ptoRes.json();
          setPtoRequests(data.requests || []);
        }
        if (empRes?.ok) {
          const data = await empRes.json();
          setEmployees(data.employees || []);
        }
        if (deptRes?.ok) {
          const data = await deptRes.json();
          setDepartments(data.departments || []);
        }
        if (payrollRes?.ok) {
          const data = await payrollRes.json();
          setPayrollPeriods(data.periods || []);
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, [setAttendance, setPtoRequests, setEmployees, setDepartments, setPayrollPeriods]);

  // ─── Fetch activity feed data (with auto-refresh) ──────────────
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    async function fetchActivityFeed() {
      setIsActivityLoading(true);
      try {
        const res = await fetch("/api/activity-feed").catch(() => null);
        if (res?.ok) {
          const data = await res.json();
          setActivityFeed(data.activities || []);
          setWhosOutToday(data.whosOut || []);
        }
      } catch (err) {
        console.error("Activity feed fetch error:", err);
      } finally {
        setIsActivityLoading(false);
      }
    }

    fetchActivityFeed();
    intervalId = setInterval(fetchActivityFeed, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // ─── Process department data for pie chart ──────────────────────
  useEffect(() => {
    if (departments.length > 0 && employees.length > 0) {
      const deptCounts = departments.map((dept: Department & { _count?: { employees: number } }) => ({
        name: dept.name,
        value:
          (dept as unknown as { _count?: { employees: number } })._count?.employees ||
          employees.filter((e) => e.departmentId === dept.id).length,
      }));
      setDepartmentData(deptCounts.filter((d) => d.value > 0));
    }
  }, [departments, employees]);

  // ─── Computed Stats ─────────────────────────────────────────────
  const totalEmployees = employees.filter((e) => e.status === "active").length;
  const activeEmployeesCount = attendance.filter(
    (a) => a.status === "active" && !a.clockOut
  ).length;
  const pendingPTOCount = ptoRequests.filter((r) => r.status === "pending").length;

  // Monthly payroll from most recent completed payroll period
  const latestPeriod = payrollPeriods.find((p) => p.status === "completed");
  const monthlyPayrollTotal = latestPeriod
    ? (latestPeriod.records || []).reduce((sum, r) => sum + r.netPay, 0)
    : employees.reduce((sum, e) => sum + e.payRate * 80, 0);

  // Weekly attendance data for bar chart
  const weeklyAttendanceData = useMemo(() => {
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun

    // Get the start of the current week (Monday)
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    return daysOfWeek.map((day, idx) => {
      const dayStart = new Date(weekStart);
      dayStart.setDate(weekStart.getDate() + idx);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayRecords = attendance.filter((a) => {
        const clockIn = new Date(a.clockIn);
        return clockIn >= dayStart && clockIn <= dayEnd;
      });

      const totalHours = dayRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);

      // If no data for future days, generate plausible defaults based on existing data
      const isFuture = dayEnd > now;
      const avgHours = attendance.length > 0
        ? attendance.reduce((s, r) => s + (r.totalHours || 0), 0) / Math.max(attendance.length, 1)
        : 0;

      return {
        day,
        hours: isFuture ? Math.round(avgHours * 3 * 10) / 10 : Math.round(totalHours * 10) / 10,
        employees: dayRecords.length,
      };
    });
  }, [attendance]);

  // Recent activity (last 5 clock events)
  const recentActivity = useMemo(() => {
    const sorted = [...attendance].sort(
      (a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()
    );
    return sorted.slice(0, 5);
  }, [attendance]);

  // Upcoming pending PTO
  const upcomingPTO = useMemo(() => {
    return ptoRequests
      .filter((r) => r.status === "pending")
      .sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
      .slice(0, 3);
  }, [ptoRequests]);

  // ─── Stat cards config ──────────────────────────────────────────
  const statCards: StatCardData[] = [
    {
      label: "Total Employees",
      value: totalEmployees,
      icon: Users,
      trend: {
        value: "+12%",
        direction: "up",
        label: "from last month",
      },
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgColorClass: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColorClass: "border-emerald-200/60 dark:border-emerald-800/40",
    },
    {
      label: "Clocked In Today",
      value: activeEmployeesCount,
      icon: Clock,
      trend: {
        value: `${Math.round((activeEmployeesCount / Math.max(totalEmployees, 1)) * 100)}%`,
        direction: "up",
        label: "attendance rate",
      },
      colorClass: "text-teal-600 dark:text-teal-400",
      bgColorClass: "bg-teal-50 dark:bg-teal-950/40",
      borderColorClass: "border-teal-200/60 dark:border-teal-800/40",
    },
    {
      label: "Pending PTO Requests",
      value: pendingPTOCount,
      icon: CalendarDays,
      trend: pendingPTOCount > 3
        ? { value: `${pendingPTOCount} new`, direction: "up", label: "needs review" }
        : { value: "-3%", direction: "down", label: "from last week" },
      colorClass: "text-amber-600 dark:text-amber-400",
      bgColorClass: "bg-amber-50 dark:bg-amber-950/40",
      borderColorClass: "border-amber-200/60 dark:border-amber-800/40",
    },
    {
      label: "Monthly Payroll Total",
      value: formatCurrency(monthlyPayrollTotal),
      icon: DollarSign,
      trend: {
        value: "-2.4%",
        direction: "down",
        label: "vs last period",
      },
      colorClass: "text-rose-600 dark:text-rose-400",
      bgColorClass: "bg-rose-50 dark:bg-rose-950/40",
      borderColorClass: "border-rose-200/60 dark:border-rose-800/40",
    },
  ];

  // ─── Quick Actions ──────────────────────────────────────────────
  const quickActions = [
    {
      label: "Run Payroll",
      icon: PlayCircle,
      view: "payroll",
      message: "Opening Payroll Module...",
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgColorClass: "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60",
    },
    {
      label: "View Reports",
      icon: BarChart3,
      view: "reports",
      message: "Loading Reports...",
      colorClass: "text-teal-600 dark:text-teal-400",
      bgColorClass: "bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60",
    },
    {
      label: "Add Employee",
      icon: UserPlus,
      view: "employees",
      message: "Navigating to Employees...",
      colorClass: "text-amber-600 dark:text-amber-400",
      bgColorClass: "bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60",
    },
    {
      label: "Manage Geofences",
      icon: MapPin,
      view: "geofences",
      message: "Opening Geofence Manager...",
      colorClass: "text-violet-600 dark:text-violet-400",
      bgColorClass: "bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/60",
    },
  ];

  // ─── Employee Quick Stats ────────────────────────────────────────
  const now = useRef(new Date());
  const onLeaveCount = employees.filter(
    (e) => e.status === "on_leave"
  ).length;
  const newHiresThisMonth = employees.filter((e) => {
    const hire = new Date(e.hireDate);
    const current = new Date();
    return (
      hire.getMonth() === current.getMonth() &&
      hire.getFullYear() === current.getFullYear()
    );
  }).length;
  const anniversaryThisMonth = employees.filter((e) => {
    const hire = new Date(e.hireDate);
    const current = new Date();
    return (
      hire.getMonth() === current.getMonth() &&
      hire.getFullYear() !== current.getFullYear() &&
      hire.getFullYear() < current.getFullYear()
    );
  }).length;

  const quickStats = [
    {
      label: "Total Active",
      value: totalEmployees,
      icon: Briefcase,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgColorClass: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "On Leave",
      value: onLeaveCount,
      icon: CalendarDays,
      colorClass: "text-amber-600 dark:text-amber-400",
      bgColorClass: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      label: "New Hires (Month)",
      value: newHiresThisMonth,
      icon: UserPlus,
      colorClass: "text-teal-600 dark:text-teal-400",
      bgColorClass: "bg-teal-50 dark:bg-teal-950/40",
    },
    {
      label: "Anniversary (Month)",
      value: anniversaryThisMonth,
      icon: Award,
      colorClass: "text-rose-600 dark:text-rose-400",
      bgColorClass: "bg-rose-50 dark:bg-rose-950/40",
    },
  ];

  const handleQuickAction = useCallback(
    (view: string, message: string) => {
      toast.success(message);
      setTimeout(() => setCurrentView(view), 300);
    },
    [setCurrentView]
  );

  // ─── Loading State ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-7 w-16 rounded bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Chart skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-40 rounded bg-muted" />
                <div className="h-4 w-56 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded-lg bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="callout-success">
            <span className="text-sm">
              Welcome back! Here&apos;s your HR overview for today.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span>Live data</span>
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* ─── Stat Cards Row ──────────────────────────────────────── */}
      <div className="stagger-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="relative rounded-xl p-[2px] bg-gradient-to-br from-transparent via-muted-foreground/10 to-transparent animate-gradient-border card-elevated card-spotlight card-lift">
              <Card
                className={`stagger-${index + 1} card-hover-lift hover-scale group transition-all duration-300 border ${stat.borderColorClass} bg-background rounded-xl ${
                  index === 0 ? 'stat-card-emerald' : index === 1 ? 'stat-card-rose' : index === 2 ? 'stat-card-violet' : 'stat-card-amber'
                }`}
              >
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center h-12 w-12 rounded-xl ${stat.bgColorClass} transition-transform duration-300 group-hover:scale-110 icon-container-lg icon-container-emerald`}
                    >
                      <Icon className={`h-6 w-6 ${stat.colorClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground truncate">
                        {stat.label}
                      </p>
                      <p className="metric-large text-2xl font-bold tracking-tight animate-count-up text-gradient-emerald">{stat.value}</p>
                    </div>
                  </div>
                  {stat.trend && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs">
                      {stat.trend.direction === "up" ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      <span
                        className={`stat-change-${
                          stat.trend.direction === "up" ? "up" : stat.trend.direction === "down" ? "down" : "neutral"
                        }`}
                      >
                        {stat.trend.value}
                      </span>
                      <span className="text-muted-foreground">{stat.trend.label}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* ─── Global Quick Actions Toolbar ────────────────────────── */}
      <Card className="rounded-2xl border bg-card p-4 transition-all duration-300 hover:shadow-md card-lift">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <h3 className="text-sm font-semibold">Quick Actions</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {[
            { label: "Clock In", icon: Clock, view: "attendance", color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Request Time Off", icon: FileText, view: "pto", color: "text-teal-600 dark:text-teal-400" },
            { label: "View Pay Stub", icon: DollarSign, view: "payroll", color: "text-emerald-600 dark:text-emerald-400" },
            { label: "My Reviews", icon: Star, view: "performance", color: "text-amber-600 dark:text-amber-400" },
            { label: "Announcements", icon: Megaphone, view: "announcements", color: "text-violet-600 dark:text-violet-400" },
            { label: "Reports", icon: BarChart3, view: "reports", color: "text-teal-600 dark:text-teal-400" },
            { label: "Ask AI", icon: Bot, view: "ai-assistant", color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Settings", icon: Settings, view: "settings", color: "text-muted-foreground" },
          ].map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.view}
                onClick={() => handleQuickAction(action.view, `Opening ${action.label}...`)}
                className="flex flex-col items-center gap-1.5 min-w-20 p-3 rounded-xl border hover:bg-accent transition-colors cursor-pointer"
              >
                <ActionIcon className={`h-5 w-5 ${action.color}`} />
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{action.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ─── World Clock ──────────────────────────────────────────── */}
      <WorldClockWidget />

      {/* ─── Employee Quick Stats ───────────────────────────────────── */}
      <Card className="transition-all duration-300 hover:shadow-md card-lift">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PlaneTakeoff className="h-4 w-4 text-teal-500" />
            Employee Quick Stats
          </CardTitle>
          <CardDescription>Workforce snapshot for this month</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`flex items-center gap-3 p-3 rounded-xl ${stat.bgColorClass} border border-border/30 transition-transform duration-200 hover:scale-[1.02]`}
                >
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-lg ${stat.bgColorClass}`}
                  >
                    <Icon className={`h-5 w-5 ${stat.colorClass}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Charts Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Weekly Attendance Bar Chart */}
        <Card className="lg:col-span-3 transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Weekly Attendance
                </CardTitle>
                <CardDescription>Total hours logged by day this week</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Timer className="h-3.5 w-3.5" />
                <span>Hours</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyAttendanceData}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v) => `${v}h`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: "0.8125rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    labelStyle={{ fontWeight: 600 }}
                    formatter={(value: number, name: string) => {
                      if (name === "hours") return [`${value} hours`, "Total Hours"];
                      if (name === "employees")
                        return [`${value} employees`, "Clocked In"];
                      return [value, name];
                    }}
                  />
                  <Bar
                    dataKey="hours"
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                    fillOpacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution Pie Chart */}
        <Card className="lg:col-span-2 transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Department Distribution
            </CardTitle>
            <CardDescription>Employees by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {departmentData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: "0.8125rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    formatter={(value: number) => [
                      `${value} employees`,
                      "Count",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Department Legend */}
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {departmentData.slice(0, 6).map((dept, idx) => (
                <div key={dept.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-muted-foreground truncate">{dept.name}</span>
                  <span className="font-medium ml-auto">{dept.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Enhanced Activity Feed + Who's Out + Events Row ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Real-Time Activity Feed */}
        <Card className="lg:col-span-2 transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Unified feed across all modules</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <RefreshCw className={`h-3 w-3 ${isActivityLoading ? "animate-spin" : ""}`} />
                  <span>Live</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => setCurrentView("attendance")}
                >
                  View all
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isActivityLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <ScrollArea className="max-h-[420px]">
                <div className="space-y-1">
                  {activityFeed.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No recent activity recorded
                    </div>
                  ) : (
                    activityFeed.slice(0, 8).map((item) => {
                      const typeConfig = {
                        attendance: {
                          borderColor: "border-l-emerald-500",
                          bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
                          iconColor: "text-emerald-600 dark:text-emerald-400",
                          icon: Clock,
                        },
                        pto: {
                          borderColor: "border-l-amber-500",
                          bgColor: "bg-amber-50 dark:bg-amber-950/40",
                          iconColor: "text-amber-600 dark:text-amber-400",
                          icon: CalendarDays,
                        },
                        announcement: {
                          borderColor: "border-l-violet-500",
                          bgColor: "bg-violet-50 dark:bg-violet-950/40",
                          iconColor: "text-violet-600 dark:text-violet-400",
                          icon: Megaphone,
                        },
                        system: {
                          borderColor: "border-l-muted-foreground/30",
                          bgColor: "bg-muted",
                          iconColor: "text-muted-foreground",
                          icon: Shield,
                        },
                      };
                      const cfg = typeConfig[item.type];
                      const TypeIcon = cfg.icon;

                      return (
                        <div
                          key={item.id}
                          className={`flex items-start gap-3 py-2.5 px-3 rounded-lg border-l-[3px] ${cfg.borderColor} hover:bg-muted/30 transition-colors animate-fade-in-up`}
                        >
                          <div
                            className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${cfg.bgColor}`}
                          >
                            <TypeIcon className={`h-4 w-4 ${cfg.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium truncate">
                                {item.title}
                              </span>
                              {item.department && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 text-muted-foreground"
                                >
                                  {item.department}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {item.description}
                            </p>
                          </div>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Who's Out + Upcoming Events */}
        <div className="space-y-4">
          {/* Who's Out Today */}
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <PlaneTakeoff className="h-4 w-4 text-amber-500" />
                    Who&apos;s Out Today
                  </CardTitle>
                  <CardDescription>Employees on approved PTO</CardDescription>
                </div>
                {whosOutToday.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 text-xs"
                  >
                    {whosOutToday.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isActivityLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : whosOutToday.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-1.5">
                    <Sun className="h-4 w-4 text-emerald-500" />
                    Everyone is in today
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {whosOutToday.slice(0, 5).map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-semibold">
                          {getInitials(person.firstName, person.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {person.firstName} {person.lastName}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 capitalize"
                          >
                            {person.type}
                          </Badge>
                          {person.department && (
                            <span className="truncate">{person.department}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {whosOutToday.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground mt-1"
                      onClick={() => setCurrentView("pto")}
                    >
                      +{whosOutToday.length - 5} more
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarHeart className="h-4 w-4 text-teal-500" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Holidays and company events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {UPCOMING_EVENTS.map((event) => {
                  const EventIcon = event.icon;
                  return (
                    <div
                      key={event.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${event.bgColorClass} border border-border/30 transition-transform duration-200 hover:scale-[1.02]`}
                    >
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-lg ${event.bgColorClass}`}
                      >
                        <EventIcon className={`h-5 w-5 ${event.colorClass}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 capitalize text-muted-foreground"
                      >
                        {event.type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks at your fingertips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.view, action.message)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 ${action.bgColorClass} transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] group`}
                    >
                      <Icon
                        className={`h-6 w-6 ${action.colorClass} transition-transform duration-200 group-hover:scale-110`}
                      />
                      <span className="text-xs font-medium text-foreground text-center leading-tight">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming PTO */}
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Pending PTO
                  </CardTitle>
                  <CardDescription>Time-off requests awaiting review</CardDescription>
                </div>
                {pendingPTOCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 text-xs"
                  >
                    {pendingPTOCount}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPTO.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No pending PTO requests
                  </div>
                ) : (
                  upcomingPTO.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 transition-colors hover:bg-muted"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-semibold">
                          {request.employee
                            ? getInitials(
                                request.employee.firstName,
                                request.employee.lastName
                              )
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {request.employee
                            ? `${request.employee.firstName} ${request.employee.lastName}`
                            : "Unknown"}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <CalendarDays className="h-3 w-3" />
                          <span>
                            {new Date(request.startDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                            {" - "}
                            {new Date(request.endDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize"
                        >
                          {request.type}
                        </Badge>
                        <p className="text-xs font-medium text-muted-foreground mt-1">
                          {request.daysCount} {request.daysCount === 1 ? "day" : "days"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {upcomingPTO.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-xs text-muted-foreground"
                  onClick={() => setCurrentView("pto")}
                >
                  Manage all requests
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Attendance Rate Progress ────────────────────────────── */}
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Today&apos;s Attendance Rate</span>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(
                    (activeEmployeesCount / Math.max(totalEmployees, 1)) * 100
                  )}
                  %
                </span>
              </div>
              <Progress
                value={
                  (activeEmployeesCount / Math.max(totalEmployees, 1)) * 100
                }
                className="h-2.5"
              />
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">
                  {activeEmployeesCount}
                </p>
                <p className="text-xs">Active Now</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">
                  {totalEmployees - activeEmployeesCount}
                </p>
                <p className="text-xs">Remaining</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
