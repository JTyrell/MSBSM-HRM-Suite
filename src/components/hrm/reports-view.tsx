"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  CalendarDays,
  FileDown,
  Activity,
  Timer,
  UserCheck,
  PieChartIcon,
  CalendarClock,
  Download,
} from "lucide-react";
import { useAppStore } from "@/store/app";
import { formatCurrency } from "@/lib/payroll";
import { exportAttendanceToCSV, exportPayrollToCSV } from "@/lib/export";
import { format, subMonths, startOfMonth, differenceInMonths } from "date-fns";

// ─── Color Palette ─────────────────────────────────────────────────
const COLORS = [
  "#10b981",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

// ─── Reusable tooltip style ────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.75rem",
  fontSize: "0.8125rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

// ─── Main Component ────────────────────────────────────────────────
export function ReportsView() {
  const { employees, departments, attendance, payrollPeriods, ptoRequests, ptoBalances } =
    useAppStore();

  const [period, setPeriod] = React.useState("6months");
  const activeEmployees = employees.filter((e) => e.status === "active");

  // ─── SIMULATED DATA ────────────────────────────────────────────

  // Attendance trend data (last 6 months)
  const attendanceTrendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      months.push({
        month: format(startOfMonth(date), "MMM yyyy"),
        attendanceRate: Math.round(88 + Math.random() * 10),
        avgHours: Math.round((7.2 + Math.random() * 1.2) * 10) / 10,
        totalRecords: Math.round(200 + Math.random() * 80),
      });
    }
    return months;
  }, []);

  // Department attendance comparison
  const departmentAttendanceData = useMemo(() => {
    const deptNames = departments.length > 0
      ? departments.map((d) => d.name)
      : ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"];
    return deptNames.map((name) => ({
      department: name.length > 12 ? name.slice(0, 12) + "…" : name,
      fullName: name,
      avgHours: Math.round((6.8 + Math.random() * 1.8) * 10) / 10,
      attendanceRate: Math.round(85 + Math.random() * 14),
      employees: Math.round(3 + Math.random() * 8),
    }));
  }, [departments]);

  // Top performers (employees with most hours)
  const topPerformers = useMemo(() => {
    const enriched = attendance
      .filter((a) => a.totalHours && a.totalHours > 0)
      .reduce<Record<string, { name: string; department: string; totalHours: number; records: number }>>(
        (acc, record) => {
          const empId = record.employeeId;
          if (!acc[empId]) {
            const emp = record.employee || employees.find((e) => e.id === empId);
            acc[empId] = {
              name: emp ? `${emp.firstName} ${emp.lastName}` : "Unknown",
              department: emp?.department?.name || "Unassigned",
              totalHours: 0,
              records: 0,
            };
          }
          acc[empId].totalHours += record.totalHours || 0;
          acc[empId].records += 1;
          return acc;
        },
        {}
      );
    return Object.values(enriched)
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 8);
  }, [attendance, employees]);

  // Payroll trend data
  const payrollTrendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const gross = Math.round((45000 + Math.random() * 15000));
      const deductions = Math.round(gross * (0.22 + Math.random() * 0.06));
      months.push({
        month: format(startOfMonth(date), "MMM yyyy"),
        grossPay: gross,
        netPay: gross - deductions,
        deductions,
      });
    }
    return months;
  }, []);

  // Department payroll distribution
  const departmentPayrollData = useMemo(() => {
    const deptNames = departments.length > 0
      ? departments.map((d) => d.name)
      : ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"];
    return deptNames.map((name) => ({
      department: name.length > 14 ? name.slice(0, 14) + "…" : name,
      fullName: name,
      payroll: Math.round(8000 + Math.random() * 22000),
      employees: Math.round(3 + Math.random() * 8),
    }));
  }, [departments]);

  // Total compensation summary
  const compensationSummary = useMemo(() => {
    const latestPeriod = payrollPeriods.find((p) => p.status === "completed");
    if (latestPeriod?.records && latestPeriod.records.length > 0) {
      const totalGross = latestPeriod.records.reduce((s, r) => s + r.grossPay, 0);
      const totalDeductions = latestPeriod.records.reduce((s, r) => s + r.totalDeductions, 0);
      const totalNet = latestPeriod.records.reduce((s, r) => s + r.netPay, 0);
      return { totalGross, totalDeductions, totalNet };
    }
    // Simulated values
    const gross = 128750;
    const deductions = 31420;
    return { totalGross: gross, totalDeductions: deductions, totalNet: gross - deductions };
  }, [payrollPeriods]);

  // Payroll cost per department table
  const payrollCostByDept = useMemo(() => {
    const deptNames = departments.length > 0
      ? departments.map((d) => d.name)
      : ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"];
    return deptNames.map((name) => ({
      department: name,
      avgSalary: Math.round(45000 + Math.random() * 35000),
      benefits: Math.round(5000 + Math.random() * 8000),
      totalCost: 0,
    })).map((d) => ({ ...d, totalCost: d.avgSalary + d.benefits }));
  }, [departments]);

  // Employee headcount pie data
  const headcountPieData = useMemo(() => {
    const deptNames = departments.length > 0
      ? departments.map((d) => d.name)
      : ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"];
    return deptNames.map((name) => ({
      name,
      value: Math.round(2 + Math.random() * 10),
    }));
  }, [departments]);

  // Role distribution pie data
  const rolePieData = useMemo(() => {
    const roles = activeEmployees.length > 0
      ? activeEmployees.reduce<Record<string, number>>((acc, e) => {
          acc[e.role] = (acc[e.role] || 0) + 1;
          return acc;
        }, {})
      : {};
    const entries = Object.keys(roles).length > 0
      ? Object.entries(roles)
      : [
          ["Software Engineer", 6],
          ["Sales Rep", 4],
          ["Designer", 3],
          ["Manager", 3],
          ["HR Specialist", 2],
          ["Analyst", 2],
        ];
    return entries.map(([name, value]) => ({ name, value }));
  }, [activeEmployees]);

  // Employee growth trend
  const employeeGrowthData = useMemo(() => {
    const months = [];
    let count = activeEmployees.length > 0 ? Math.max(activeEmployees.length - 8, 5) : 12;
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      count += Math.random() > 0.3 ? 1 : 0;
      months.push({
        month: format(startOfMonth(date), "MMM yy"),
        count: Math.round(count),
      });
    }
    return months;
  }, [activeEmployees]);

  // Tenure analysis
  const tenureData = useMemo(() => {
    const enriched = activeEmployees.length > 0
      ? activeEmployees.map((e) => ({
          name: `${e.firstName} ${e.lastName}`,
          hireDate: e.hireDate,
          tenure: differenceInMonths(new Date(), new Date(e.hireDate)),
        }))
      : [
          { name: "Alice Chen", hireDate: "2021-03-15", tenure: 42 },
          { name: "Bob Martinez", hireDate: "2021-08-01", tenure: 37 },
          { name: "Carol Williams", hireDate: "2022-01-10", tenure: 32 },
          { name: "David Kim", hireDate: "2022-06-20", tenure: 27 },
          { name: "Eva Thompson", hireDate: "2023-02-14", tenure: 21 },
          { name: "Frank Lopez", hireDate: "2023-09-05", tenure: 14 },
          { name: "Grace Park", hireDate: "2024-01-22", tenure: 8 },
          { name: "Henry Wilson", hireDate: "2024-06-10", tenure: 3 },
        ];
    const buckets: Record<string, number> = {
      "0-6 months": 0,
      "6-12 months": 0,
      "1-2 years": 0,
      "2-3 years": 0,
      "3+ years": 0,
    };
    enriched.forEach((e) => {
      if (e.tenure <= 6) buckets["0-6 months"]++;
      else if (e.tenure <= 12) buckets["6-12 months"]++;
      else if (e.tenure <= 24) buckets["1-2 years"]++;
      else if (e.tenure <= 36) buckets["2-3 years"]++;
      else buckets["3+ years"]++;
    });
    return {
      distribution: Object.entries(buckets).map(([range, count]) => ({ range, count })),
      employees: enriched.sort((a, b) => a.tenure - b.tenure),
    };
  }, [activeEmployees]);

  // PTO usage by type
  const ptoUsageData = useMemo(() => {
    const types = ["Sick", "Vacation", "Personal"];
    if (ptoBalances.length > 0) {
      const totalSick = ptoBalances.reduce((s, b) => s + b.usedSick, 0);
      const totalVacation = ptoBalances.reduce((s, b) => s + b.usedVacation, 0);
      const totalPersonal = ptoBalances.reduce((s, b) => s + b.usedPersonal, 0);
      return types.map((type, idx) => ({
        type,
        days: [totalSick, totalVacation, totalPersonal][idx],
        employees: Math.round([totalSick, totalVacation, totalPersonal][idx] * 0.7),
      }));
    }
    return types.map((type) => ({
      type,
      days: Math.round(5 + Math.random() * 25),
      employees: Math.round(3 + Math.random() * 10),
    }));
  }, [ptoBalances]);

  // PTO balance summary
  const ptoBalanceSummary = useMemo(() => {
    if (activeEmployees.length > 0 && ptoBalances.length > 0) {
      return activeEmployees.slice(0, 8).map((emp) => {
        const bal = ptoBalances.find((b) => b.employeeId === emp.id);
        const total = bal
          ? bal.totalAllocated - bal.usedSick - bal.usedVacation - bal.usedPersonal
          : Math.round(5 + Math.random() * 15);
        return {
          name: `${emp.firstName} ${emp.lastName}`,
          remaining: total,
          used: bal ? bal.usedSick + bal.usedVacation + bal.usedPersonal : Math.round(3 + Math.random() * 8),
        };
      });
    }
    return [
      { name: "Alice Chen", remaining: 12, used: 5 },
      { name: "Bob Martinez", remaining: 8, used: 9 },
      { name: "Carol Williams", remaining: 15, used: 3 },
      { name: "David Kim", remaining: 6, used: 11 },
      { name: "Eva Thompson", remaining: 18, used: 2 },
      { name: "Frank Lopez", remaining: 4, used: 14 },
      { name: "Grace Park", remaining: 10, used: 7 },
      { name: "Henry Wilson", remaining: 14, used: 4 },
    ];
  }, [activeEmployees, ptoBalances]);

  // Most common PTO periods
  const commonPTOPeriods = useMemo(() => {
    const requests = ptoRequests.length > 0
      ? ptoRequests.filter((r) => r.status === "approved")
      : [];
    if (requests.length > 0) {
      const monthCounts: Record<string, number> = {};
      requests.forEach((r) => {
        const month = format(new Date(r.startDate), "MMMM");
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });
      return Object.entries(monthCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([month, count]) => ({ month, requests: count }));
    }
    return [
      { month: "December", requests: 14 },
      { month: "July", requests: 11 },
      { month: "August", requests: 9 },
      { month: "November", requests: 8 },
      { month: "March", requests: 6 },
      { month: "June", requests: 5 },
    ];
  }, [ptoRequests]);

  // Average attendance stats
  const avgAttendanceStats = useMemo(() => {
    const records = attendance.filter((a) => a.totalHours && a.totalHours > 0);
    const avgHours = records.length > 0
      ? records.reduce((s, r) => s + (r.totalHours || 0), 0) / records.length
      : 7.8;
    const rate = Math.round(88 + Math.random() * 10);
    return { avgHours: Math.round(avgHours * 10) / 10, rate };
  }, [attendance]);

  // ─── Helpers ────────────────────────────────────────────────────
  const getTenureLabel = (months: number) => {
    if (months < 12) return `${months}mo`;
    const years = Math.floor(months / 12);
    const remaining = months % 12;
    return remaining > 0 ? `${years}y ${remaining}mo` : `${years}y`;
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive insights across attendance, payroll, employees, and PTO.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last 1 Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last 1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* ─── Tabbed Content ─────────────────────────────────────── */}
      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="attendance" className="gap-2 text-xs sm:text-sm">
            <Clock className="h-4 w-4 hidden sm:block" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-2 text-xs sm:text-sm">
            <DollarSign className="h-4 w-4 hidden sm:block" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-2 text-xs sm:text-sm">
            <Users className="h-4 w-4 hidden sm:block" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="pto" className="gap-2 text-xs sm:text-sm">
            <CalendarDays className="h-4 w-4 hidden sm:block" />
            PTO
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 1: ATTENDANCE ANALYTICS                            */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="attendance" className="space-y-6">
          {/* Attendance Tab Header with Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Attendance Analytics</h3>
              <p className="text-sm text-muted-foreground">Detailed attendance metrics and trends</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              onClick={() => exportAttendanceToCSV(attendance)}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-emerald-200/60 dark:border-emerald-800/40 hover:shadow-md transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                    <Timer className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Hours / Employee</p>
                    <p className="text-2xl font-bold">{avgAttendanceStats.avgHours}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-teal-200/60 dark:border-teal-800/40 hover:shadow-md transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950/40">
                    <UserCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                    <p className="text-2xl font-bold">{avgAttendanceStats.rate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200/60 dark:border-amber-800/40 hover:shadow-md transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/40">
                    <Activity className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Records</p>
                    <p className="text-2xl font-bold">{attendance.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-violet-200/60 dark:border-violet-800/40 hover:shadow-md transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-violet-50 dark:bg-violet-950/40">
                    <TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trend</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+2.3%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly Attendance Trend */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Monthly Attendance Trend</CardTitle>
                <CardDescription>Attendance rate & average hours over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceTrendData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ fontWeight: 600 }} />
                      <Line
                        type="monotone"
                        dataKey="attendanceRate"
                        stroke={COLORS[0]}
                        strokeWidth={2.5}
                        dot={{ fill: COLORS[0], r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Attendance Rate"
                      />
                      <Line
                        type="monotone"
                        dataKey="avgHours"
                        stroke={COLORS[1]}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: COLORS[1], r: 3 }}
                        name="Avg Hours"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                    Attendance Rate
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                    Avg Hours
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Attendance Comparison */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Department Attendance</CardTitle>
                <CardDescription>Average hours and attendance rate by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentAttendanceData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis
                        dataKey="department"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => `${v}h`}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ fontWeight: 600 }}
                        formatter={(value: number, name: string) => {
                          if (name === "avgHours") return [`${value}h`, "Avg Hours"];
                          if (name === "attendanceRate") return [`${value}%`, "Att. Rate"];
                          return [value, name];
                        }}
                        labelFormatter={(label: string) => {
                          const match = departmentAttendanceData.find((d) => d.department === label);
                          return match?.fullName || label;
                        }}
                      />
                      <Bar dataKey="avgHours" fill={COLORS[0]} radius={[6, 6, 0, 0]} maxBarSize={40} fillOpacity={0.85} name="Avg Hours" />
                      <Bar dataKey="attendanceRate" fill={COLORS[2]} radius={[6, 6, 0, 0]} maxBarSize={40} fillOpacity={0.6} name="Att. Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers Table */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Top Performers</CardTitle>
                  <CardDescription>Employees with the most hours logged</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  {topPerformers.length} employees
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Total Hours</TableHead>
                      <TableHead className="text-right">Records</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPerformers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      topPerformers.map((perf, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                              idx < 3 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : "bg-muted text-muted-foreground"
                            }`}>
                              {idx + 1}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{perf.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{perf.department}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{perf.totalHours.toFixed(1)}h</TableCell>
                          <TableCell className="text-right text-muted-foreground">{perf.records}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 2: PAYROLL ANALYTICS                              */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="payroll" className="space-y-6">
          {/* Payroll Tab Header with Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Payroll Analytics</h3>
              <p className="text-sm text-muted-foreground">Compensation insights and payroll trends</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              onClick={() => exportPayrollToCSV(payrollPeriods)}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>

          {/* Compensation Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-emerald-200/60 dark:border-emerald-800/40 hover:shadow-md transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                    <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Gross Pay</p>
                    <p className="text-2xl font-bold">{formatCurrency(compensationSummary.totalGross)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200/60 dark:border-red-800/40 hover:shadow-md transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-red-50 dark:bg-red-950/40">
                    <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Deductions</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">-{formatCurrency(compensationSummary.totalDeductions)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-teal-200/60 dark:border-teal-800/40 hover:shadow-md transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950/40">
                    <FileDown className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Net Pay</p>
                    <p className="text-2xl font-bold">{formatCurrency(compensationSummary.totalNet)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gross vs Net Pay Trend */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Gross vs Net Pay Trend</CardTitle>
                <CardDescription>Monthly payroll comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={payrollTrendData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ fontWeight: 600 }}
                        formatter={(value: number) => [formatCurrency(value), ""]}
                      />
                      <Area type="monotone" dataKey="grossPay" stroke={COLORS[0]} fill="url(#grossGrad)" strokeWidth={2.5} name="Gross Pay" />
                      <Area type="monotone" dataKey="netPay" stroke={COLORS[1]} fill="url(#netGrad)" strokeWidth={2} name="Net Pay" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                    Gross Pay
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                    Net Pay
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Payroll Distribution */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Department Payroll Distribution</CardTitle>
                <CardDescription>Monthly payroll cost by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentPayrollData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis
                        type="number"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        type="category"
                        dataKey="department"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        width={90}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ fontWeight: 600 }}
                        formatter={(value: number, name: string) => {
                          if (name === "payroll") return [formatCurrency(value), "Payroll"];
                          return [value, name];
                        }}
                        labelFormatter={(label: string) => {
                          const match = departmentPayrollData.find((d) => d.department === label);
                          return match?.fullName || label;
                        }}
                      />
                      <Bar dataKey="payroll" radius={[0, 6, 6, 0]} maxBarSize={28}>
                        {departmentPayrollData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payroll Cost per Department Table */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Payroll Cost by Department</CardTitle>
              <CardDescription>Annual salary and benefits breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Avg Salary</TableHead>
                      <TableHead className="text-right">Benefits</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead className="text-right">Cost / Employee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollCostByDept.map((dept) => {
                      const empCount = departments.length > 0
                        ? Math.max(employees.filter((e) => e.departmentId === departments.find((d) => d.name === dept.department)?.id).length, 1)
                        : Math.round(3 + Math.random() * 8);
                      return (
                        <TableRow key={dept.department}>
                          <TableCell className="font-medium">{dept.department}</TableCell>
                          <TableCell className="text-right">{formatCurrency(dept.avgSalary)}</TableCell>
                          <TableCell className="text-right text-amber-600 dark:text-amber-400">{formatCurrency(dept.benefits)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(dept.totalCost)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(dept.totalCost / empCount)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 3: EMPLOYEE ANALYTICS                             */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="employees" className="space-y-6">
          {/* Pie Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Headcount */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Department Headcount</CardTitle>
                <CardDescription>Employee distribution by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={headcountPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={88}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {headcountPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number) => [`${value} employees`, "Headcount"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {headcountPieData.slice(0, 6).map((dept, idx) => (
                    <div key={dept.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-muted-foreground truncate">{dept.name}</span>
                      <span className="font-medium ml-auto">{dept.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Role Distribution */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Role Distribution</CardTitle>
                <CardDescription>Employees by job role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rolePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={88}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {rolePieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number) => [`${value} employees`, "Count"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {rolePieData.slice(0, 6).map((role, idx) => (
                    <div key={role.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-muted-foreground truncate">{role.name}</span>
                      <span className="font-medium ml-auto">{role.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Growth Trend */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Employee Growth Trend</CardTitle>
              <CardDescription>Headcount growth over the past 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={employeeGrowthData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      domain={[0, "auto"]}
                    />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ fontWeight: 600 }} formatter={(value: number) => [`${value} employees`, "Headcount"]} />
                    <Area type="monotone" dataKey="count" stroke={COLORS[0]} fill="url(#growthGrad)" strokeWidth={2.5} name="Employees" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tenure Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Tenure Distribution Bar Chart */}
            <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Tenure Distribution</CardTitle>
                <CardDescription>Employees by tenure range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tenureData.distribution} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis
                        dataKey="range"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        allowDecimals={false}
                      />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ fontWeight: 600 }} formatter={(value: number) => [`${value} employees`, "Count"]} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {tenureData.distribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Tenure Table */}
            <Card className="lg:col-span-3 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Employee Tenure</CardTitle>
                <CardDescription>Hire date and length of service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Hire Date</TableHead>
                        <TableHead className="text-right">Tenure</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenureData.employees.map((emp) => (
                        <TableRow key={emp.name}>
                          <TableCell className="font-medium">{emp.name}</TableCell>
                          <TableCell className="text-muted-foreground">{format(new Date(emp.hireDate), "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className={
                              emp.tenure >= 24
                                ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300"
                                : emp.tenure >= 12
                                ? "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
                                : ""
                            }>
                              {getTenureLabel(emp.tenure)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 4: PTO ANALYTICS                                  */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="pto" className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* PTO Usage by Type */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-semibold">PTO Usage by Type</CardTitle>
                <CardDescription>Days used and employees affected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ptoUsageData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis
                        dataKey="type"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ fontWeight: 600 }}
                        formatter={(value: number, name: string) => {
                          if (name === "days") return [`${value} days`, "Days Used"];
                          if (name === "employees") return [`${value}`, "Employees"];
                          return [value, name];
                        }}
                      />
                      <Bar dataKey="days" fill={COLORS[0]} radius={[6, 6, 0, 0]} maxBarSize={48} fillOpacity={0.85} name="Days Used" />
                      <Bar dataKey="employees" fill={COLORS[2]} radius={[6, 6, 0, 0]} maxBarSize={48} fillOpacity={0.6} name="Employees" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                    Days Used
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[2] }} />
                    Employees
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Most Common PTO Periods */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Most Common PTO Periods</CardTitle>
                <CardDescription>Months with highest time-off requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={commonPTOPeriods} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis
                        type="number"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        width={85}
                      />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ fontWeight: 600 }} formatter={(value: number) => [`${value} requests`, "Requests"]} />
                      <Bar dataKey="requests" radius={[0, 6, 6, 0]} maxBarSize={28}>
                        {commonPTOPeriods.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PTO Balance Summary Table */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">PTO Balance Summary</CardTitle>
                  <CardDescription>Remaining and used PTO across employees</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                  {ptoBalanceSummary.length} employees
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead className="text-right">Used</TableHead>
                      <TableHead className="text-right">Total Allocated</TableHead>
                      <TableHead>Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ptoBalanceSummary.map((emp) => {
                      const total = emp.remaining + emp.used;
                      const utilization = total > 0 ? Math.round((emp.used / total) * 100) : 0;
                      return (
                        <TableRow key={emp.name}>
                          <TableCell className="font-medium">{emp.name}</TableCell>
                          <TableCell className="text-right">
                            <span className={emp.remaining < 5 ? "text-red-600 dark:text-red-400 font-semibold" : "text-emerald-600 dark:text-emerald-400"}>
                              {emp.remaining} days
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">{emp.used} days</TableCell>
                          <TableCell className="text-right font-medium">{total} days</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${utilization}%`,
                                    backgroundColor: utilization > 80 ? COLORS[3] : utilization > 50 ? COLORS[2] : COLORS[0],
                                  }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-8">{utilization}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
