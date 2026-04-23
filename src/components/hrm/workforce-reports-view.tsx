"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  DollarSign,
  ShieldCheck,
  Clock,
  FileDown,
  Search,
  Filter,
  Download,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  Table2,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const DEPARTMENT_HEADCOUNT = [
  { name: "Engineering", count: 12, bgClass: "bg-msbm-red" },
  { name: "Marketing", count: 8, bgClass: "bg-inner-blue" },
  { name: "Sales", count: 10, bgClass: "bg-light-blue" },
  { name: "Human Resources", count: 5, bgClass: "bg-msbm-red-bright" },
  { name: "Finance", count: 6, bgClass: "bg-slate-900" },
  { name: "Operations", count: 9, bgClass: "bg-msbm-red" },
];

const ROLE_TIERS = [
  { tier: "Executive", count: 4, strokeClass: "stroke-msbm-red", bgClass: "bg-msbm-red", pct: 7 },
  { tier: "Senior Management", count: 8, strokeClass: "stroke-inner-blue", bgClass: "bg-inner-blue", pct: 14 },
  { tier: "Management", count: 12, strokeClass: "stroke-msbm-red-bright", bgClass: "bg-msbm-red-bright", pct: 21 },
  { tier: "Professional", count: 22, strokeClass: "stroke-light-blue", bgClass: "bg-light-blue", pct: 38 },
  { tier: "Associate", count: 11, strokeClass: "stroke-slate-900", bgClass: "bg-slate-900", pct: 19 },
];

const MONTHLY_TREND = [
  { month: "Jan", count: 42 },
  { month: "Feb", count: 45 },
  { month: "Mar", count: 48 },
  { month: "Apr", count: 47 },
  { month: "May", count: 52 },
  { month: "Jun", count: 57 },
];

const STATUTORY_DATA = [
  { month: "Jan 2025", nis: 48600, nht: 32400, paye: 225000, eduTax: 56250, total: 362250, status: "filed" },
  { month: "Feb 2025", nis: 48600, nht: 32400, paye: 228000, eduTax: 57000, total: 366000, status: "filed" },
  { month: "Mar 2025", nis: 50220, nht: 33500, paye: 231500, eduTax: 57875, total: 373095, status: "filed" },
  { month: "Apr 2025", nis: 50220, nht: 33500, paye: 231500, eduTax: 57875, total: 373095, status: "pending" },
  { month: "May 2025", nis: 51840, nht: 34560, paye: 235200, eduTax: 58800, total: 380400, status: "pending" },
  { month: "Jun 2025", nis: 51840, nht: 34560, paye: 238000, eduTax: 59500, total: 383900, status: "overdue" },
];

const OVERTIME_HISTOGRAM = [
  { range: "0-2 hrs", count: 18, bgClass: "bg-msbm-red" },
  { range: "2-4 hrs", count: 12, bgClass: "bg-inner-blue" },
  { range: "4-6 hrs", count: 8, bgClass: "bg-msbm-red-bright" },
  { range: "6-8 hrs", count: 5, bgClass: "bg-amber-500" },
  { range: "8-10 hrs", count: 3, bgClass: "bg-orange-500" },
  { range: "10+ hrs", count: 2, bgClass: "bg-red-500" },
];

const SHIFT_COVERAGE: Record<string, Record<string, number>> = {
  Mon: { AM: 8, PM: 6, Eve: 3 },
  Tue: { AM: 9, PM: 7, Eve: 4 },
  Wed: { AM: 7, PM: 5, Eve: 2 },
  Thu: { AM: 8, PM: 6, Eve: 3 },
  Fri: { AM: 10, PM: 8, Eve: 5 },
  Sat: { AM: 4, PM: 3, Eve: 1 },
  Sun: { AM: 2, PM: 1, Eve: 0 },
};

const AVG_HOURS_DEPT = [
  { dept: "Engineering", avg: 42.5, budget: 40, variance: 6.3 },
  { dept: "Marketing", avg: 38.2, budget: 40, variance: -4.5 },
  { dept: "Sales", avg: 41.8, budget: 40, variance: 4.5 },
  { dept: "Human Resources", avg: 37.5, budget: 40, variance: -6.3 },
  { dept: "Finance", avg: 39.0, budget: 40, variance: -2.5 },
  { dept: "Operations", avg: 44.2, budget: 40, variance: 10.5 },
];

const LABOR_COST_BUDGET = [
  { dept: "Engineering", actual: 480000, budget: 500000 },
  { dept: "Marketing", actual: 320000, budget: 300000 },
  { dept: "Sales", actual: 390000, budget: 400000 },
  { dept: "Human Resources", actual: 200000, budget: 210000 },
  { dept: "Finance", actual: 250000, budget: 240000 },
  { dept: "Operations", actual: 410000, budget: 380000 },
];

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
}

const AUDIT_ENTRIES: AuditEntry[] = [
  { id: "1", timestamp: "2025-06-15 09:23:41", user: "Marsha Bennett", action: "Processed payroll", module: "payroll", details: "Payroll period Jun 2025 processed for 57 employees" },
  { id: "2", timestamp: "2025-06-15 09:15:12", user: "Marsha Bennett", action: "Approved timesheets", module: "attendance", details: "Batch approved 12 timesheets for week 24" },
  { id: "3", timestamp: "2025-06-14 16:45:30", user: "Andre Thompson", action: "Updated employee record", module: "employee", details: "Updated salary for Devon Clarke (EMP-004)" },
  { id: "4", timestamp: "2025-06-14 14:22:08", user: "Marsha Bennett", action: "Created PTO request", module: "pto", details: "Vacation request for Jul 7-11 (5 days)" },
  { id: "5", timestamp: "2025-06-14 11:00:00", user: "System", action: "Auto clock-out", module: "attendance", details: "3 employees auto-clocked out after 10hr threshold" },
  { id: "6", timestamp: "2025-06-13 15:30:22", user: "Keisha Martin", action: "Added new employee", module: "employee", details: "Onboarded Jada Williams (EMP-016) to Engineering" },
  { id: "7", timestamp: "2025-06-13 10:12:45", user: "Andre Thompson", action: "Generated reports", module: "reports", details: "Exported monthly attendance report for May 2025" },
  { id: "8", timestamp: "2025-06-12 14:08:33", user: "Marsha Bennett", action: "Updated shift schedule", module: "attendance", details: "Modified AM shift coverage for Operations dept" },
  { id: "9", timestamp: "2025-06-12 09:45:00", user: "System", action: "Compliance check", module: "payroll", details: "NIS contribution ceiling verified for all employees" },
  { id: "10", timestamp: "2025-06-11 16:20:15", user: "Keisha Martin", action: "Created announcement", module: "general", details: "Published 'Q3 Town Hall Meeting' announcement" },
  { id: "11", timestamp: "2025-06-11 11:35:00", user: "Andre Thompson", action: "Performance review", module: "employee", details: "Completed review cycle Q2 for 15 employees" },
  { id: "12", timestamp: "2025-06-10 13:10:42", user: "Marsha Bennett", action: "Statutory filing", module: "payroll", details: "Filed NIS/NHT/PAYE contributions for May 2025" },
  { id: "13", timestamp: "2025-06-10 08:55:30", user: "System", action: "Geofence alert", module: "attendance", details: "2 flagged clock-ins outside Finance geofence" },
  { id: "14", timestamp: "2025-06-09 15:42:18", user: "Keisha Martin", action: "Updated benefits", module: "general", details: "Added dental plan option to Benefits Hub" },
  { id: "15", timestamp: "2025-06-09 10:00:00", user: "Andre Thompson", action: "Role assignment", module: "employee", details: "Promoted Chris Walker to Senior Manager in Sales" },
];

const EXPORT_CARDS = [
  { title: "Employee Registry", desc: "Complete employee directory with personal info, departments, roles, and employment status.", formats: ["CSV", "MyHR+"] },
  { title: "Timesheet Export", desc: "Detailed timesheet data including clock-in/out times, hours worked, and overtime for selected periods.", formats: ["CSV", "Sling"] },
  { title: "Payroll Summary", desc: "Comprehensive payroll breakdown with gross pay, deductions, net pay, and tax contributions.", formats: ["CSV", "MyHR+", "HRplus"] },
  { title: "Statutory Remittance", desc: "NIS, NHT, PAYE, and Education Tax contribution reports formatted for government submission.", formats: ["CSV", "HRplus"] },
  { title: "Attendance Report", desc: "Attendance tracking data with absence records, tardiness stats, and geofence compliance.", formats: ["CSV", "Sling"] },
  { title: "Shift Schedule", desc: "Shift assignments and coverage reports by department with gap analysis.", formats: ["CSV", "MyHR+", "Sling"] },
  { title: "Department Roster", desc: "Department-level headcount and role distribution reports with org hierarchy.", formats: ["CSV", "HRplus"] },
  { title: "Compliance Certificate", desc: "Statutory compliance certificates and audit trail documentation.", formats: ["CSV", "MyHR+", "HRplus"] },
];

// ─── Module Color Map ────────────────────────────────────────────────────────

const MODULE_COLORS: Record<string, string> = {
  payroll: "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright border-msbm-red/20 dark:border-msbm-red/40",
  employee: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  attendance: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  pto: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  reports: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
  general: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800",
};

const FORMAT_COLORS: Record<string, string> = {
  CSV: "bg-inner-blue/10 text-inner-blue dark:bg-inner-blue/20 dark:text-light-blue",
  "MyHR+": "bg-msbm-red/10 text-msbm-red dark:bg-msbm-red/20 dark:text-msbm-red-bright",
  HRplus: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  Sling: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
  filed: { label: "Filed", cls: "bg-inner-blue/10 text-inner-blue dark:bg-inner-blue/20 dark:text-light-blue" },
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  overdue: { label: "Overdue", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatJMD(n: number) {
  return `JMD ${n.toLocaleString()}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function WorkforceReportsView() {
  const [activeTab, setActiveTab] = useState("headcount");

  // Audit trail filters
  const [auditSearch, setAuditSearch] = useState("");
  const [auditModule, setAuditModule] = useState("all");
  const [auditDateFrom, setAuditDateFrom] = useState("");
  const [auditDateTo, setAuditDateTo] = useState("");

  const filteredAudit = useMemo(() => {
    return AUDIT_ENTRIES.filter((e) => {
      if (auditSearch && !e.action.toLowerCase().includes(auditSearch.toLowerCase()) && !e.user.toLowerCase().includes(auditSearch.toLowerCase()) && !e.details.toLowerCase().includes(auditSearch.toLowerCase())) return false;
      if (auditModule !== "all" && e.module !== auditModule) return false;
      if (auditDateFrom && e.timestamp < auditDateFrom) return false;
      if (auditDateTo && e.timestamp > auditDateTo + "T23:59:59") return false;
      return true;
    });
  }, [auditSearch, auditModule, auditDateFrom, auditDateTo]);

  const maxDeptCount = Math.max(...DEPARTMENT_HEADCOUNT.map((d) => d.count));
  const maxOTCount = Math.max(...OVERTIME_HISTOGRAM.map((o) => o.count));
  const maxTrendCount = Math.max(...MONTHLY_TREND.map((m) => m.count));
  const totalStatutory = STATUTORY_DATA.reduce((s, d) => s + d.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workforce Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive workforce analytics, statutory compliance, and export center
          </p>
        </div>
        <Badge className="w-fit bg-gradient-to-r from-msbm-red to-inner-blue text-white border-0 px-3 py-1">
          <BarChart3 className="w-3.5 h-3.5 mr-1.5" />Live Dashboard
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 h-auto flex flex-wrap gap-1">
          <TabsTrigger value="headcount" className="text-xs sm:text-sm gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-msbm-red data-[state=active]:to-inner-blue data-[state=active]:text-white">
            <Users className="w-4 h-4" />Headcount
          </TabsTrigger>
          <TabsTrigger value="statutory" className="text-xs sm:text-sm gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-msbm-red data-[state=active]:to-inner-blue data-[state=active]:text-white">
            <DollarSign className="w-4 h-4" />Statutory
          </TabsTrigger>
          <TabsTrigger value="labor" className="text-xs sm:text-sm gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-msbm-red data-[state=active]:to-inner-blue data-[state=active]:text-white">
            <Activity className="w-4 h-4" />Labor
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs sm:text-sm gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-msbm-red data-[state=active]:to-inner-blue data-[state=active]:text-white">
            <ShieldCheck className="w-4 h-4" />Audit Trail
          </TabsTrigger>
          <TabsTrigger value="export" className="text-xs sm:text-sm gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-msbm-red data-[state=active]:to-inner-blue data-[state=active]:text-white">
            <FileDown className="w-4 h-4" />Export Center
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Headcount & Role Analysis ─────────────────────────── */}
        <TabsContent value="headcount" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Staff", value: 57, icon: Users, color: "from-msbm-red to-inner-blue", delta: "+5 this month" },
              { label: "Active", value: 52, icon: UserCheck, color: "from-inner-blue to-light-blue", delta: "91% of total" },
              { label: "On Leave", value: 3, icon: UserX, color: "from-amber-500 to-orange-500", delta: "-2 vs last month" },
              { label: "New Hires", value: 5, icon: UserPlus, color: "from-violet-500 to-purple-500", delta: "This quarter" },
            ].map((stat) => (
              <Card key={stat.label} className="card-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-msbm-red" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  <p className="text-[10px] text-msbm-red dark:text-msbm-red-bright mt-1">{stat.delta}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Headcount by Department — Horizontal Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Headcount by Department</CardTitle>
                <CardDescription>Distribution across 6 departments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {DEPARTMENT_HEADCOUNT.map((dept) => (
                  <div key={dept.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{dept.name}</span>
                      <span className="text-muted-foreground">{dept.count}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${dept.bgClass} w-[${Math.round((dept.count / maxDeptCount) * 100)}%]`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Role Tier Distribution — SVG Ring */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Role Tier Distribution</CardTitle>
                <CardDescription>Workforce composition by seniority</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="relative w-36 h-36 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {ROLE_TIERS.reduce(
                      (acc, tier, i) => {
                        const offset = acc.offset;
                        acc.elements.push(
                          <circle
                            key={tier.tier}
                            cx="18" cy="18" r="14"
                            fill="none"
                            strokeWidth="4"
                            strokeDasharray={`${tier.pct} ${100 - tier.pct}`}
                            strokeDashoffset={-offset}
                            className={`transition-all duration-700 ${tier.strokeClass}`}
                          />
                        );
                        acc.offset += tier.pct;
                        return acc;
                      },
                      { offset: 0, elements: [] as React.ReactNode[] }
                    ).elements}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">93%</span>
                    <span className="text-[10px] text-muted-foreground">Compliance</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  {ROLE_TIERS.map((tier) => (
                    <div key={tier.tier} className="flex items-center gap-2 text-sm">
                      <div className={`w-3 h-3 rounded-sm shrink-0 ${tier.bgClass}`} />
                      <span className="flex-1 truncate">{tier.tier}</span>
                      <span className="font-medium">{tier.count}</span>
                      <span className="text-xs text-muted-foreground">({tier.pct}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Count Trend — Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Employee Count Trend</CardTitle>
              <CardDescription>6-month headcount progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-40">
                {MONTHLY_TREND.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium">{m.count}</span>
                    <div
                      className={`w-full bg-gradient-to-t from-msbm-red to-inner-blue rounded-t-lg transition-all duration-700 min-h-[8px] h-[${Math.round((m.count / maxTrendCount) * 100)}%]`}
                    />
                    <span className="text-xs text-muted-foreground">{m.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Statutory Remittance ──────────────────────────────── */}
        <TabsContent value="statutory" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total NIS", value: formatJMD(STATUTORY_DATA.reduce((s, d) => s + d.nis, 0)), icon: ShieldCheck },
              { label: "Total NHT", value: formatJMD(STATUTORY_DATA.reduce((s, d) => s + d.nht, 0)), icon: ShieldCheck },
              { label: "Total PAYE", value: formatJMD(STATUTORY_DATA.reduce((s, d) => s + d.paye, 0)), icon: DollarSign },
              { label: "Grand Total", value: formatJMD(totalStatutory), icon: TrendingUp },
            ].map((s) => (
              <Card key={s.label} className="card-lift">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="w-4 h-4 text-msbm-red" />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                  <p className="text-lg font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monthly Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Statutory Remittance</CardTitle>
              <CardDescription>NIS, NHT, PAYE, and Education Tax breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Month</th>
                      <th className="text-right py-2 px-3 font-semibold text-muted-foreground">NIS</th>
                      <th className="text-right py-2 px-3 font-semibold text-muted-foreground">NHT</th>
                      <th className="text-right py-2 px-3 font-semibold text-muted-foreground">PAYE</th>
                      <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Edu Tax</th>
                      <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Total</th>
                      <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STATUTORY_DATA.map((row) => {
                      const badge = STATUS_BADGES[row.status] || STATUS_BADGES.pending;
                      return (
                        <tr key={row.month} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                          <td className="py-2.5 px-3 font-medium">{row.month}</td>
                          <td className="py-2.5 px-3 text-right">{formatJMD(row.nis)}</td>
                          <td className="py-2.5 px-3 text-right">{formatJMD(row.nht)}</td>
                          <td className="py-2.5 px-3 text-right">{formatJMD(row.paye)}</td>
                          <td className="py-2.5 px-3 text-right">{formatJMD(row.eduTax)}</td>
                          <td className="py-2.5 px-3 text-right font-semibold">{formatJMD(row.total)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <Badge className={`${badge.cls} text-[10px] px-2 py-0.5 border`}>
                              {row.status === "filed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {row.status === "overdue" && <AlertCircle className="w-3 h-3 mr-1" />}
                              {badge.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-muted/30">
                      <td className="py-2.5 px-3">Total</td>
                      <td className="py-2.5 px-3 text-right">{formatJMD(STATUTORY_DATA.reduce((s, d) => s + d.nis, 0))}</td>
                      <td className="py-2.5 px-3 text-right">{formatJMD(STATUTORY_DATA.reduce((s, d) => s + d.nht, 0))}</td>
                      <td className="py-2.5 px-3 text-right">{formatJMD(STATUTORY_DATA.reduce((s, d) => s + d.paye, 0))}</td>
                      <td className="py-2.5 px-3 text-right">{formatJMD(STATUTORY_DATA.reduce((s, d) => s + d.eduTax, 0))}</td>
                      <td className="py-2.5 px-3 text-right">{formatJMD(totalStatutory)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Labor Analytics ──────────────────────────────────── */}
        <TabsContent value="labor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overtime Distribution Histogram */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Overtime Distribution</CardTitle>
                <CardDescription>Employee overtime hours histogram</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {OVERTIME_HISTOGRAM.map((bin) => (
                  <div key={bin.range} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16 shrink-0 text-right">{bin.range}</span>
                    <div className="flex-1 h-7 bg-muted rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-700 flex items-center pl-2 ${bin.bgClass} w-[${Math.round((bin.count / maxOTCount) * 100)}%]`}
                      >
                        <span className="text-[10px] font-bold text-white drop-shadow">{bin.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shift Coverage Heatmap */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Shift Coverage Heatmap</CardTitle>
                <CardDescription>Mon-Sun coverage across AM/PM/Evening shifts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-1 px-2 text-xs text-muted-foreground font-semibold">Day</th>
                        {["AM", "PM", "Eve"].map((s) => (
                          <th key={s} className="text-center py-1 px-2 text-xs text-muted-foreground font-semibold">{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(SHIFT_COVERAGE).map(([day, shifts]) => (
                        <tr key={day}>
                          <td className="py-1.5 px-2 font-medium text-xs">{day}</td>
                          {["AM", "PM", "Eve"].map((s) => {
                            const val = shifts[s];
                            const intensity = val / 10;
                            const bg = val === 0
                              ? "bg-muted/50"
                              : intensity > 0.7
                                ? "bg-msbm-red text-white"
                                : intensity > 0.4
                                  ? "bg-msbm-red/60 dark:bg-msbm-red/70 text-white"
                                  : "bg-msbm-red/10 dark:bg-msbm-red/20 text-msbm-red dark:text-msbm-red-bright";
                            return (
                              <td key={s} className="py-1.5 px-2">
                                <div className={`text-center text-xs font-bold rounded py-1 ${bg}`}>
                                  {val}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Average Hours per Department */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Average Hours per Department</CardTitle>
                <CardDescription>Actual vs budgeted hours with variance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-semibold text-muted-foreground text-xs">Department</th>
                        <th className="text-right py-2 px-3 font-semibold text-muted-foreground text-xs">Avg Hours</th>
                        <th className="text-right py-2 px-3 font-semibold text-muted-foreground text-xs">Budget</th>
                        <th className="text-right py-2 px-3 font-semibold text-muted-foreground text-xs">Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {AVG_HOURS_DEPT.map((row) => (
                        <tr key={row.dept} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                          <td className="py-2 px-3 font-medium">{row.dept}</td>
                          <td className="py-2 px-3 text-right">{row.avg}h</td>
                          <td className="py-2 px-3 text-right">{row.budget}h</td>
                          <td className="py-2 px-3 text-right">
                            <span className={`font-medium ${row.variance > 0 ? "text-amber-600 dark:text-amber-400" : "text-msbm-red dark:text-msbm-red-bright"}`}>
                              {row.variance > 0 ? "+" : ""}{row.variance}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Labor Cost vs Budget */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Labor Cost vs Budget</CardTitle>
                <CardDescription>Department-level actual spend vs allocated budget</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {LABOR_COST_BUDGET.map((item) => {
                  const pct = (item.actual / item.budget) * 100;
                  const overBudget = item.actual > item.budget;
                  return (
                    <div key={item.dept} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{item.dept}</span>
                        <span className={overBudget ? "text-amber-600 dark:text-amber-400 font-medium" : "text-msbm-red dark:text-msbm-red-bright"}>
                          {overBudget ? "Over" : "Under"} budget
                        </span>
                      </div>
                      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${overBudget ? "bg-amber-400" : "bg-msbm-red"} w-[${Math.round(Math.min(pct, 100))}%]`}
                        />
                        <div className="absolute inset-y-0 right-0 w-[2px] bg-foreground/30 left-[100%]" />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{formatJMD(item.actual)}</span>
                        <span>Budget: {formatJMD(item.budget)}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 4: Audit Trail ──────────────────────────────────────── */}
        <TabsContent value="audit" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search actions, users, details..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={auditModule}
                    onChange={(e) => setAuditModule(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    aria-label="Filter by module"
                    title="Filter by module"
                  >
                    <option value="all">All Modules</option>
                    <option value="payroll">Payroll</option>
                    <option value="employee">Employee</option>
                    <option value="attendance">Attendance</option>
                    <option value="pto">PTO</option>
                    <option value="reports">Reports</option>
                    <option value="general">General</option>
                  </select>
                  <Input
                    type="date"
                    value={auditDateFrom}
                    onChange={(e) => setAuditDateFrom(e.target.value)}
                    className="h-9 w-auto"
                    placeholder="From"
                    aria-label="Filter from date"
                    title="Filter from date"
                  />
                  <Input
                    type="date"
                    value={auditDateTo}
                    onChange={(e) => setAuditDateTo(e.target.value)}
                    className="h-9 w-auto"
                    placeholder="To"
                    aria-label="Filter to date"
                    title="Filter to date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Entries */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted-foreground">{filteredAudit.length} entries found</p>
            </div>
            <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1">
              {filteredAudit.map((entry) => (
                <Card key={entry.id} className="transition-colors hover:bg-accent/20">
                  <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                      <div className="flex items-center gap-2 sm:w-44 shrink-0">
                        <Badge className={`text-[10px] px-2 py-0.5 border ${MODULE_COLORS[entry.module] || MODULE_COLORS.general}`}>
                          {entry.module}
                        </Badge>
                        <Clock className="w-3 h-3 text-muted-foreground hidden sm:block" />
                        <span className="text-[10px] text-muted-foreground hidden sm:block">{entry.timestamp}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold">{entry.action}</span>
                          <span className="text-xs text-muted-foreground">by {entry.user}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{entry.details}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredAudit.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="w-8 h-8 mb-2" />
                  <p className="text-sm">No audit entries match your filters</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 5: Export Center ────────────────────────────────────── */}
        <TabsContent value="export" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileDown className="w-5 h-5 text-msbm-red" />
            <p className="text-sm text-muted-foreground">
              {EXPORT_CARDS.length} export templates available in multiple formats
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {EXPORT_CARDS.map((card) => (
              <Card key={card.title} className="card-lift">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-msbm-red to-inner-blue flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold">{card.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{card.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {card.formats.map((fmt) => (
                      <Badge key={fmt} className={`text-[10px] px-2 py-0 ${FORMAT_COLORS[fmt] || "bg-muted"}`}>
                        {fmt}
                      </Badge>
                    ))}
                  </div>
                  <Button size="sm" className="w-full bg-gradient-to-r from-msbm-red to-inner-blue hover:from-msbm-red-bright hover:to-inner-blue text-white mt-auto">
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
