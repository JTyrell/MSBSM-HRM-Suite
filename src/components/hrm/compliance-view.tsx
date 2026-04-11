"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  Scale,
  FileWarning,
  TrendingUp,
  Bell,
  Info,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from "date-fns";

// ─── Types ──────────────────────────────────────────────────────────

interface RegulatoryAlert {
  id: string;
  title: string;
  description: string;
  effectiveDate: string;
  status: "Action Required" | "Compliant" | "Pending Review" | "Upcoming" | "In Progress" | "Under Review";
  priority: "HIGH" | "MEDIUM" | "LOW";
}

interface AuditEntry {
  id: string;
  date: string;
  user: string;
  action: string;
  module: string;
  status: "completed" | "pending" | "failed";
  details: string;
}

interface CalendarDeadline {
  id: string;
  date: Date;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

// ─── Simulated Data ────────────────────────────────────────────────

const REGULATORY_ALERTS: RegulatoryAlert[] = [
  {
    id: "reg-1",
    title: "Federal Overtime Rule Update",
    description: "New salary threshold for overtime exemption increases to $58,656 annually. Review affected employee classifications.",
    effectiveDate: "2025-07-01",
    status: "Action Required",
    priority: "HIGH",
  },
  {
    id: "reg-2",
    title: "State Minimum Wage Increase",
    description: "State minimum wage increases to $16.00/hr. All hourly employee rates need to be updated before effective date.",
    effectiveDate: "2025-01-01",
    status: "Compliant",
    priority: "LOW",
  },
  {
    id: "reg-3",
    title: "New I-9 Form Requirements",
    description: "USCIS has released an updated I-9 form. All new hires must use the revised version starting effective date.",
    effectiveDate: "2025-03-15",
    status: "Pending Review",
    priority: "MEDIUM",
  },
  {
    id: "reg-4",
    title: "COBRA Notification Update",
    description: "Updated COBRA election notice template required. Distribute to all eligible beneficiaries within 14 days.",
    effectiveDate: "2025-04-01",
    status: "Compliant",
    priority: "LOW",
  },
  {
    id: "reg-5",
    title: "EEOC Reporting Deadline",
    description: "Annual EEO-1 Component 1 report due. Gather workforce demographic data and submit through EEOC portal.",
    effectiveDate: "2025-06-30",
    status: "Upcoming",
    priority: "MEDIUM",
  },
  {
    id: "reg-6",
    title: "OSHA Safety Training",
    description: "Annual workplace safety training renewal. All employees must complete updated training modules.",
    effectiveDate: "2025-05-01",
    status: "In Progress",
    priority: "LOW",
  },
  {
    id: "reg-7",
    title: "State Tax Filing Changes",
    description: "New state tax withholding tables effective Q2. Update payroll system and notify employees of changes.",
    effectiveDate: "2025-04-15",
    status: "Under Review",
    priority: "MEDIUM",
  },
  {
    id: "reg-8",
    title: "Worker Classification Update",
    description: "New independent contractor vs employee classification test adopted. Review all contractor agreements for compliance.",
    effectiveDate: "2025-08-01",
    status: "Action Required",
    priority: "HIGH",
  },
];

const AUDIT_TRAIL: AuditEntry[] = [
  { id: "audit-1", date: "2025-04-15 14:32:00", user: "Sarah Chen", action: "Updated employee payroll rate", module: "Payroll", status: "completed", details: "Updated rate for emp-003 from $32 to $34/hr" },
  { id: "audit-2", date: "2025-04-15 13:18:00", user: "Sarah Chen", action: "Approved PTO request", module: "PTO", status: "completed", details: "Approved 3-day vacation for Marcus Rivera" },
  { id: "audit-3", date: "2025-04-15 11:45:00", user: "James Walker", action: "Exported attendance report", module: "Reports", status: "completed", details: "Exported March attendance summary (CSV)" },
  { id: "audit-4", date: "2025-04-15 10:22:00", user: "Admin System", action: "Auto-backup completed", module: "System", status: "completed", details: "Daily database backup - 48.2 MB" },
  { id: "audit-5", date: "2025-04-14 16:50:00", user: "Sarah Chen", action: "Added new employee", module: "Employees", status: "completed", details: "Created record for Emily Nakamura (Engineering)" },
  { id: "audit-6", date: "2025-04-14 15:30:00", user: "James Walker", action: "Modified geofence boundary", module: "Geofences", status: "completed", details: "Expanded HQ geofence radius from 200m to 300m" },
  { id: "audit-7", date: "2025-04-14 14:12:00", user: "Sarah Chen", action: "Ran payroll for period", module: "Payroll", status: "completed", details: "Payroll period March 16-31 processed ($47,832)" },
  { id: "audit-8", date: "2025-04-14 11:08:00", user: "Admin System", action: "Failed login attempt", module: "Security", status: "failed", details: "3 failed login attempts from IP 192.168.1.45" },
  { id: "audit-9", date: "2025-04-13 17:20:00", user: "James Walker", action: "Updated company policy", module: "Documents", status: "completed", details: "Updated Remote Work Policy v3.2" },
  { id: "audit-10", date: "2025-04-13 15:45:00", user: "Sarah Chen", action: "Created onboarding checklist", module: "Onboarding", status: "completed", details: "New checklist for Engineering department" },
  { id: "audit-11", date: "2025-04-13 09:30:00", user: "Admin System", action: "System health check", module: "System", status: "completed", details: "All services operational, response time: 42ms" },
  { id: "audit-12", date: "2025-04-12 16:15:00", user: "James Walker", action: "Reviewed compliance alert", module: "Compliance", status: "completed", details: "Reviewed Federal Overtime Rule Update" },
  { id: "audit-13", date: "2025-04-12 14:40:00", user: "Sarah Chen", action: "Updated benefits enrollment", module: "Payroll", status: "pending", details: "Pending: 3 benefits enrollment changes" },
  { id: "audit-14", date: "2025-04-12 11:55:00", user: "Admin System", action: "Password policy violation", module: "Security", status: "failed", details: "User emp-007 password does not meet complexity requirements" },
  { id: "audit-15", date: "2025-04-11 15:30:00", user: "James Walker", action: "Archived old documents", module: "Documents", status: "completed", details: "Archived 12 documents older than 2 years" },
  { id: "audit-16", date: "2025-04-11 10:20:00", user: "Sarah Chen", action: "Assigned training course", module: "Onboarding", status: "completed", details: "Assigned Safety Training to 8 new hires" },
  { id: "audit-17", date: "2025-04-10 16:45:00", user: "Admin System", action: "SSL certificate renewal", module: "System", status: "completed", details: "SSL cert renewed for api.msbm-hr.com" },
  { id: "audit-18", date: "2025-04-10 13:10:00", user: "James Walker", action: "Generated audit report", module: "Reports", status: "completed", details: "Q1 2025 compliance audit report generated" },
];

const COMPLIANCE_DEADLINES: CalendarDeadline[] = [
  { id: "cd-1", date: new Date(2025, 3, 1), title: "COBRA Notification Update", priority: "LOW" },
  { id: "cd-2", date: new Date(2025, 3, 15), title: "State Tax Filing", priority: "MEDIUM" },
  { id: "cd-3", date: new Date(2025, 4, 1), title: "OSHA Safety Training Due", priority: "LOW" },
  { id: "cd-4", date: new Date(2025, 5, 30), title: "EEOC Reporting Deadline", priority: "MEDIUM" },
  { id: "cd-5", date: new Date(2025, 6, 1), title: "Federal Overtime Rule", priority: "HIGH" },
  { id: "cd-6", date: new Date(2025, 7, 1), title: "Worker Classification", priority: "HIGH" },
  { id: "cd-7", date: new Date(2025, 3, 22), title: " quarterly Tax Review", priority: "MEDIUM" },
  { id: "cd-8", date: new Date(2025, 4, 15), title: "Mid-Year Benefits Review", priority: "LOW" },
];

// ─── Helpers ────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, { badge: string; dot: string; bg: string; text: string }> = {
  HIGH: {
    badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-600 dark:text-red-400",
  },
  MEDIUM: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-400",
  },
  LOW: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-600 dark:text-emerald-400",
  },
};

const STATUS_VARIANTS: Record<string, string> = {
  "Action Required": "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  Compliant: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  "Pending Review": "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  Upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  "In Progress": "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  "Under Review": "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
};

const AUDIT_STATUS_VARIANTS: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

// ─── Compliance Score Ring Component ────────────────────────────────

function ComplianceScoreRing({ score }: { score: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? "#059669" : score >= 70 ? "#d97706" : "#dc2626";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="160" height="160" className="-rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-muted/30"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {score}%
        </span>
        <span className="text-xs text-muted-foreground">Compliance</span>
      </div>
    </div>
  );
}

// ─── Risk Level Indicator ───────────────────────────────────────────

function RiskLevelIndicator() {
  const riskLevel = "Low";
  const riskConfig = {
    Low: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", dot: "bg-emerald-500" },
    Medium: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", dot: "bg-amber-500" },
    High: { color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40", dot: "bg-red-500" },
  }[riskLevel];

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${riskConfig.bg}`}>
      <div className={`h-3 w-3 rounded-full ${riskConfig.dot} animate-pulse`} />
      <div>
        <p className="text-xs text-muted-foreground">Risk Level</p>
        <p className={`text-lg font-bold ${riskConfig.color}`}>{riskLevel}</p>
      </div>
    </div>
  );
}

// ─── Calendar Component ─────────────────────────────────────────────

function ComplianceCalendar({
  deadlines,
}: {
  deadlines: CalendarDeadline[];
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 3, 1)); // April 2025
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0=Sun

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const deadlinesInMonth = deadlines.filter(
    (d) =>
      d.date.getMonth() === currentMonth.getMonth() &&
      d.date.getFullYear() === currentMonth.getFullYear()
  );

  const goToPrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const goToNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={goToPrevMonth}>
          &larr; Prev
        </Button>
        <h3 className="text-base font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <Button variant="outline" size="sm" onClick={goToNextMonth}>
          Next &rarr;
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-xl overflow-hidden">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 bg-muted/50">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2 border-b border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for offset */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[72px] border-b border-r last:border-r-0 bg-muted/20 p-1"
            />
          ))}

          {/* Day cells */}
          {daysInMonth.map((day) => {
            const dayDeadlines = deadlines.filter((d) => isSameDay(d.date, day));
            const isToday = isSameDay(day, new Date(2025, 3, 15)); // Highlight a sample "today"

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[72px] border-b border-r last:border-r-0 p-1.5 transition-colors hover:bg-muted/30 ${
                  isToday ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      isToday
                        ? "bg-emerald-600 text-white h-5 w-5 rounded-full flex items-center justify-center"
                        : "text-muted-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayDeadlines.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayDeadlines.map((d) => (
                        <div
                          key={d.id}
                          className={`h-2 w-2 rounded-full ${
                            PRIORITY_COLORS[d.priority].dot
                          }`}
                          title={d.title}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {dayDeadlines.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayDeadlines.slice(0, 2).map((d) => (
                      <div
                        key={d.id}
                        className={`text-[9px] leading-tight font-medium truncate ${
                          PRIORITY_COLORS[d.priority].text
                        }`}
                      >
                        {d.title.length > 16
                          ? d.title.slice(0, 16) + "..."
                          : d.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Deadline Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Low Priority</span>
        </div>
      </div>

      {/* Deadlines List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Upcoming Deadlines
          </CardTitle>
          <CardDescription className="text-xs">
            {deadlinesInMonth.length} deadlines in {format(currentMonth, "MMMM yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deadlinesInMonth.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No deadlines this month.
            </p>
          ) : (
            <div className="space-y-2">
              {deadlinesInMonth
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((d) => {
                  const pConfig = PRIORITY_COLORS[d.priority];
                  return (
                    <div
                      key={d.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${pConfig.dot} shrink-0`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{d.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(d.date, "MMMM d, yyyy")}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${pConfig.badge}`}
                      >
                        {d.priority}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function ComplianceView() {
  const [moduleFilter, setModuleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // ─── Filtered audit trail ─────────────────────────────────────
  const filteredAudit = useMemo(() => {
    return AUDIT_TRAIL.filter((entry) => {
      const matchesModule = moduleFilter === "All" || entry.module === moduleFilter;
      const matchesStatus = statusFilter === "All" || entry.status === statusFilter;
      return matchesModule && matchesStatus;
    });
  }, [moduleFilter, statusFilter]);

  // ─── Unique modules for filter ────────────────────────────────
  const uniqueModules = useMemo(() => {
    const mods = new Set(AUDIT_TRAIL.map((e) => e.module));
    return Array.from(mods).sort();
  }, []);

  // ─── Alert stats ──────────────────────────────────────────────
  const alertStats = useMemo(() => {
    return {
      high: REGULATORY_ALERTS.filter((a) => a.priority === "HIGH").length,
      medium: REGULATORY_ALERTS.filter((a) => a.priority === "MEDIUM").length,
      low: REGULATORY_ALERTS.filter((a) => a.priority === "LOW").length,
      actionRequired: REGULATORY_ALERTS.filter((a) => a.status === "Action Required").length,
    };
  }, []);

  // ─── Audit stats ──────────────────────────────────────────────
  const auditStats = useMemo(() => {
    return {
      total: AUDIT_TRAIL.length,
      completed: AUDIT_TRAIL.filter((a) => a.status === "completed").length,
      pending: AUDIT_TRAIL.filter((a) => a.status === "pending").length,
      failed: AUDIT_TRAIL.filter((a) => a.status === "failed").length,
    };
  }, []);

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance & Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Monitor regulatory compliance, alerts, and audit activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
          >
            <Shield className="h-3 w-3 mr-1" />
            94% Compliant
          </Badge>
        </div>
      </div>

      {/* ─── Tabbed Content ─────────────────────────────────────── */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="dashboard" className="gap-2 text-xs sm:text-sm">
            <Shield className="h-4 w-4 hidden sm:block" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2 text-xs sm:text-sm">
            <Bell className="h-4 w-4 hidden sm:block" />
            Regulatory Alerts
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2 text-xs sm:text-sm">
            <Clock className="h-4 w-4 hidden sm:block" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2 text-xs sm:text-sm">
            <Scale className="h-4 w-4 hidden sm:block" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 1: COMPLIANCE DASHBOARD                           */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-emerald-200/60 dark:border-emerald-800/40 hover:shadow-md transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                    <Globe className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Regulations</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200/60 dark:border-amber-800/40 hover:shadow-md transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/40">
                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-teal-200/60 dark:border-teal-800/40 hover:shadow-md transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950/40">
                    <CheckCircle2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Compliance Score</p>
                    <p className="text-2xl font-bold">94%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200/60 dark:border-red-800/40 hover:shadow-md transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-red-50 dark:bg-red-950/40">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Open Violations</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">2</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score + Risk Level Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Compliance Score */}
            <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Overall Compliance Score
                    </CardTitle>
                    <CardDescription>
                      Based on 24 active regulations and recent audit results
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <ComplianceScoreRing score={94} />
                  <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Labor Law Compliance</span>
                        <span className="font-semibold">96%</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Safety & OSHA</span>
                        <span className="font-semibold">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tax & Payroll</span>
                        <span className="font-semibold">98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Data Privacy</span>
                        <span className="font-semibold">90%</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Level & Quick Stats */}
            <div className="space-y-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RiskLevelIndicator />
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">High Priority Alerts</span>
                      <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                        {alertStats.high}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Medium Priority Alerts</span>
                      <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        {alertStats.medium}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Low Priority Alerts</span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                        {alertStats.low}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Actions Required</span>
                      <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                        {alertStats.actionRequired}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                      <FileWarning className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Next Action Due</p>
                      <p className="text-sm font-semibold">OSHA Safety Training</p>
                      <p className="text-[10px] text-muted-foreground">May 1, 2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 2: REGULATORY ALERTS                               */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="alerts" className="space-y-6">
          {/* Alert Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-red-200/60 dark:border-red-800/40">
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${PRIORITY_COLORS.HIGH.dot}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">High Priority</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">{alertStats.high}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200/60 dark:border-amber-800/40">
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${PRIORITY_COLORS.MEDIUM.dot}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Medium Priority</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{alertStats.medium}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-200/60 dark:border-emerald-800/40">
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${PRIORITY_COLORS.LOW.dot}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Low Priority</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{alertStats.low}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Regulatory Changes Timeline</CardTitle>
              <CardDescription>
                Recent and upcoming regulatory changes affecting your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {REGULATORY_ALERTS.map((alert, idx) => {
                  const pConfig = PRIORITY_COLORS[alert.priority];
                  const isFirst = idx === 0;
                  const isLast = idx === REGULATORY_ALERTS.length - 1;

                  return (
                    <div key={alert.id} className="flex gap-4">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-4 w-4 rounded-full border-2 shrink-0 ${
                            alert.priority === "HIGH"
                              ? "border-red-500 bg-red-100 dark:bg-red-900/50"
                              : alert.priority === "MEDIUM"
                              ? "border-amber-500 bg-amber-100 dark:bg-amber-900/50"
                              : "border-emerald-500 bg-emerald-100 dark:bg-emerald-900/50"
                          }`}
                        />
                        {!isLast && (
                          <div className="w-px flex-1 bg-border min-h-[48px]" />
                        )}
                      </div>

                      {/* Alert content */}
                      <div
                        className={`flex-1 pb-6 ${isLast ? "pb-0" : ""}`}
                      >
                        <div className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="text-sm font-semibold">{alert.title}</h4>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] shrink-0 ${pConfig.badge}`}
                                >
                                  {alert.priority}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] shrink-0 ${STATUS_VARIANTS[alert.status] || ""}`}
                                >
                                  {alert.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {alert.description}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {alert.status === "Compliant"
                                    ? "Effective"
                                    : alert.status === "Upcoming" || alert.status === "In Progress"
                                    ? "Due"
                                    : "Effective"}{" "}
                                  {format(new Date(alert.effectiveDate), "MMM d, yyyy")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 3: COMPLIANCE CALENDAR                             */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Compliance Calendar
                  </CardTitle>
                  <CardDescription>
                    Track important compliance deadlines and regulatory dates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ComplianceCalendar deadlines={COMPLIANCE_DEADLINES} />
                </CardContent>
              </Card>
            </div>

            {/* All Deadlines List */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-base font-semibold">All Deadlines</CardTitle>
                <CardDescription className="text-xs">
                  {COMPLIANCE_DEADLINES.length} compliance deadlines tracked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[600px] overflow-y-auto space-y-2">
                  {COMPLIANCE_DEADLINES
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map((d) => {
                      const pConfig = PRIORITY_COLORS[d.priority];
                      return (
                        <div
                          key={d.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div
                            className={`h-8 w-8 rounded-lg ${pConfig.bg} flex items-center justify-center shrink-0`}
                          >
                            <Clock className={`h-4 w-4 ${pConfig.text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{d.title}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {format(d.date, "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 ${pConfig.badge}`}
                          >
                            {d.priority}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 4: AUDIT TRAIL                                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="audit" className="space-y-4">
          {/* Audit Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-border/50">
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">Total Entries</p>
                <p className="text-xl font-bold">{auditStats.total}</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200/60 dark:border-emerald-800/40">
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {auditStats.completed}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-200/60 dark:border-amber-800/40">
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {auditStats.pending}
                </p>
              </CardContent>
            </Card>
            <Card className="border-red-200/60 dark:border-red-800/40">
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {auditStats.failed}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Modules</SelectItem>
                {uniqueModules.map((mod) => (
                  <SelectItem key={mod} value={mod}>
                    {mod}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <Badge variant="outline" className="text-xs self-center">
              <Info className="h-3 w-3 mr-1" />
              {filteredAudit.length} of {AUDIT_TRAIL.length} entries
            </Badge>
          </div>

          {/* Audit Table */}
          <Card>
            <CardContent className="pt-0">
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">User</TableHead>
                      <TableHead className="text-xs">Action</TableHead>
                      <TableHead className="text-xs">Module</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAudit.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                          No audit entries match your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAudit.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {format(new Date(entry.date), "MMM d, HH:mm")}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-medium whitespace-nowrap">
                            {entry.user}
                          </TableCell>
                          <TableCell className="text-xs">{entry.action}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {entry.module}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] capitalize ${
                                AUDIT_STATUS_VARIANTS[entry.status] || ""
                              }`}
                            >
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {entry.details}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
