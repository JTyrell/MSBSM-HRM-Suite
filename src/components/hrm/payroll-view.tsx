"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app";
import { formatCurrency } from "@/lib/payroll";
import type { PayrollPeriod, PayrollRecord, Employee } from "@/store/app";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Users,
  Play,
  CheckCircle2,
  Calendar,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Receipt,
  ShieldCheck,
  Banknote,
  Wallet,
  BadgeCheck,
  Eye,
  Loader2,
  Download,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { exportPayrollToCSV } from "@/lib/export";

// ======================== TYPES ========================

interface PayrollRunResult {
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  flaggedCount: number;
}

interface PayrollSummary {
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  flaggedRecords: number;
}

// ======================== HELPERS ========================

function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "approved":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
          <CheckCircle2 className="size-3 mr-1" />
          Approved
        </Badge>
      );
    case "paid":
      return (
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 border-0">
          <Banknote className="size-3 mr-1" />
          Paid
        </Badge>
      );
    case "flagged":
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
          <AlertTriangle className="size-3 mr-1" />
          Flagged
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">
          <Clock className="size-3 mr-1" />
          Pending
        </Badge>
      );
  }
}

function getPeriodStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "completed":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
          Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 border-0">
          <Loader2 className="size-3 mr-1 animate-spin" />
          Processing
        </Badge>
      );
    case "draft":
      return (
        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">
          Draft
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-0">
          Approved
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ======================== SUB-COMPONENTS ========================

// ---- Summary Cards ----

function SummaryCards({ summary }: { summary: PayrollSummary }) {
  const cards = [
    {
      title: "Total Gross Pay",
      value: formatCurrency(summary.totalGrossPay),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      title: "Total Net Pay",
      value: formatCurrency(summary.totalNetPay),
      icon: Wallet,
      color: "text-teal-600",
      bg: "bg-teal-50",
      border: "border-teal-200",
    },
    {
      title: "Total Deductions",
      value: formatCurrency(summary.totalDeductions),
      icon: TrendingDown,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
    {
      title: "Flagged Records",
      value: summary.flaggedRecords.toString(),
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`${card.border} hover:shadow-md transition-shadow`}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold tracking-tight ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div className={`${card.bg} p-3 rounded-xl`}>
                <card.icon className={`size-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---- Payroll Run Wizard ----

function PayrollRunWizard({ onRunComplete }: { onRunComplete: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PayrollRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [periodName, setPeriodName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function resetForm() {
    setPeriodName("");
    setStartDate("");
    setEndDate("");
    setResult(null);
    setError(null);
    setProgress(0);
    setShowForm(false);
  }

  async function handleRunPayroll() {
    if (!periodName || !startDate || !endDate) {
      setError("All fields are required.");
      return;
    }

    setIsRunning(true);
    setError(null);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const res = await fetch("/api/payroll/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodName, startDate, endDate }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to run payroll");
      }

      const data: PayrollRunResult = await res.json();
      setResult(data);
      onRunComplete();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 p-2 rounded-lg">
            <Play className="size-5 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Payroll Run Wizard</CardTitle>
            <CardDescription>
              Process a new payroll run for a specific period
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!showForm && !result && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Select a pay period and run payroll processing for all eligible
                employees.
              </p>
              <p className="text-xs text-muted-foreground">
                Payroll calculations include federal/state taxes, SS, Medicare,
                health insurance, and 401(k).
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Play className="size-4 mr-2" />
              Run New Payroll
            </Button>
          </div>
        )}

        {showForm && !result && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="periodName">Period Name</Label>
                <Input
                  id="periodName"
                  placeholder="e.g. January 2025"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                <AlertTriangle className="size-4 inline mr-2" />
                {error}
              </div>
            )}

            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Processing payroll...
                  </span>
                  <span className="font-medium text-emerald-600">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                onClick={handleRunPayroll}
                disabled={isRunning}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="size-4 mr-2" />
                    Start Payroll Run
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isRunning}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BadgeCheck className="size-5 text-emerald-600" />
                <p className="font-semibold text-emerald-700">
                  Payroll Run Complete
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-emerald-600/70 font-medium">
                    Employees Processed
                  </p>
                  <p className="text-lg font-bold text-emerald-700">
                    {result.totalEmployees}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-600/70 font-medium">
                    Total Gross Pay
                  </p>
                  <p className="text-lg font-bold text-emerald-700">
                    {formatCurrency(result.totalGrossPay)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-600/70 font-medium">
                    Total Net Pay
                  </p>
                  <p className="text-lg font-bold text-emerald-700">
                    {formatCurrency(result.totalNetPay)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-600/70 font-medium">
                    Flagged Records
                  </p>
                  <p className="text-lg font-bold text-amber-600">
                    {result.flaggedCount}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={resetForm}>
              Run Another Payroll
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Payroll Periods Table ----

function PayrollPeriodsTable({
  periods,
  onSelectPeriod,
  selectedPeriodId,
}: {
  periods: PayrollPeriod[];
  onSelectPeriod: (period: PayrollPeriod) => void;
  selectedPeriodId: string | null;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpand(periodId: string) {
    setExpandedId((prev) => (prev === periodId ? null : periodId));
  }

  if (periods.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="size-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">No payroll periods yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Run your first payroll to see period data here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Payroll Periods</CardTitle>
        <CardDescription>
          Click a period to view detailed payroll records
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[420px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8"></TableHead>
                <TableHead>Period Name</TableHead>
                <TableHead className="text-right">Start Date</TableHead>
                <TableHead className="text-right">End Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Employees</TableHead>
                <TableHead className="text-right">Gross Pay</TableHead>
                <TableHead className="text-right">Net Pay</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((period) => {
                const totalGross =
                  period.records?.reduce((sum, r) => sum + r.grossPay, 0) ?? 0;
                const totalNet =
                  period.records?.reduce((sum, r) => sum + r.netPay, 0) ?? 0;
                const empCount = period.records?.length ?? 0;
                const isExpanded = expandedId === period.id;

                return (
                  <>
                    <TableRow
                      key={period.id}
                      className={`cursor-pointer transition-colors ${
                        selectedPeriodId === period.id
                          ? "bg-emerald-50/60 hover:bg-emerald-50/80"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => onSelectPeriod(period)}
                    >
                      <TableCell className="p-2 w-8">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(period.id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-3.5" />
                          ) : (
                            <ChevronRight className="size-3.5" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {period.name}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {period.startDate
                          ? format(parseISO(period.startDate), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {period.endDate
                          ? format(parseISO(period.endDate), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {getPeriodStatusBadge(period.status)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {empCount}
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-700">
                        {formatCurrency(totalGross)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-teal-700">
                        {formatCurrency(totalNet)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPeriod(period);
                          }}
                        >
                          <Eye className="size-3.5 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && period.records && period.records.length > 0 && (
                      <TableRow key={`${period.id}-detail`} className="bg-muted/20 hover:bg-muted/20">
                        <TableCell colSpan={9} className="p-4">
                          <div className="ml-6">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              Employee Records
                            </p>
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead>Employee</TableHead>
                                  <TableHead className="text-right">
                                    Hours
                                  </TableHead>
                                  <TableHead className="text-right">Gross</TableHead>
                                  <TableHead className="text-right">
                                    Deductions
                                  </TableHead>
                                  <TableHead className="text-right">Net</TableHead>
                                  <TableHead className="text-center">
                                    Status
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {period.records.map((record) => (
                                  <TableRow key={record.id}>
                                    <TableCell className="font-medium text-sm">
                                      {record.employee
                                        ? `${record.employee.firstName} ${record.employee.lastName}`
                                        : record.employeeId}
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                      {record.totalHours.toFixed(1)}h
                                    </TableCell>
                                    <TableCell className="text-right text-sm font-medium">
                                      {formatCurrency(record.grossPay)}
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-orange-600">
                                      {formatCurrency(record.totalDeductions)}
                                    </TableCell>
                                    <TableCell className="text-right text-sm font-medium text-teal-700">
                                      {formatCurrency(record.netPay)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {getStatusBadge(record.status)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Deduction Breakdown ----

function DeductionBreakdown({ record }: { record: PayrollRecord }) {
  const deductions = [
    { label: "Federal Tax", value: record.federalTax },
    { label: "State Tax", value: record.stateTax },
    { label: "Social Security", value: record.socialSecurity },
    { label: "Medicare", value: record.medicare },
    { label: "Health Insurance", value: record.healthInsurance },
    { label: "401(k)", value: record.retirement401k },
    { label: "Other Deductions", value: record.otherDeductions },
  ].filter((d) => d.value > 0);

  if (deductions.length === 0) return null;

  return (
    <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-4 mt-3">
      <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">
        Deduction Breakdown
      </p>
      <div className="space-y-1.5">
        {deductions.map((d) => (
          <div
            key={d.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-medium text-orange-700 tabular-nums">
              {formatCurrency(d.value)}
            </span>
          </div>
        ))}
        <Separator className="my-1.5 bg-orange-200/60" />
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Total Deductions</span>
          <span className="text-orange-800 tabular-nums">
            {formatCurrency(record.totalDeductions)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Payroll Detail View ----

function PayrollDetailView({
  period,
  onApprove,
}: {
  period: PayrollPeriod;
  onApprove: (recordId: string) => void;
}) {
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  if (!period) return null;

  const records = period.records ?? [];

  const totalGross = records.reduce((sum, r) => sum + r.grossPay, 0);
  const totalDeductions = records.reduce(
    (sum, r) => sum + r.totalDeductions,
    0
  );
  const totalNet = records.reduce((sum, r) => sum + r.netPay, 0);
  const totalRegHours = records.reduce(
    (sum, r) => sum + r.regularHours,
    0
  );
  const totalOTHours = records.reduce((sum, r) => sum + r.overtimeHours, 0);

  async function handleApprove(recordId: string) {
    setApprovingId(recordId);
    try {
      const res = await fetch("/api/payroll/approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId }),
      });
      if (res.ok) {
        onApprove(recordId);
      }
    } catch {
      // Handle silently
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{period.name} — Detail</CardTitle>
            <CardDescription>
              {period.startDate
                ? `${format(parseISO(period.startDate), "MMM d, yyyy")} — ${format(parseISO(period.endDate), "MMM d, yyyy")}`
                : "No dates"}{" "}
              &middot; {records.length} employee{records.length !== 1 && "s"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getPeriodStatusBadge(period.status)}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              onClick={() => exportPayrollToCSV([period])}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Totals bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-emerald-50/60 border border-emerald-100 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Employees</p>
            <p className="font-bold text-emerald-700">{records.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Reg Hours</p>
            <p className="font-bold tabular-nums">{totalRegHours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">OT Hours</p>
            <p className="font-bold tabular-nums text-amber-600">
              {totalOTHours.toFixed(1)}h
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Gross Pay</p>
            <p className="font-bold text-emerald-700 tabular-nums">
              {formatCurrency(totalGross)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Net Pay</p>
            <p className="font-bold text-teal-700 tabular-nums">
              {formatCurrency(totalNet)}
            </p>
          </div>
        </div>

        {/* Records table */}
        <div className="max-h-[480px] overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/40">
                <TableHead className="w-8"></TableHead>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Reg Hours</TableHead>
                <TableHead className="text-right">OT Hours</TableHead>
                <TableHead className="text-right">Gross Pay</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Pay</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => {
                const isExpanded = expandedRecordId === record.id;
                return (
                  <>
                    <TableRow
                      key={record.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() =>
                        setExpandedRecordId((prev) =>
                          prev === record.id ? null : record.id
                        )
                      }
                    >
                      <TableCell className="p-2 w-8">
                        {isExpanded ? (
                          <ChevronDown className="size-3.5" />
                        ) : (
                          <ChevronRight className="size-3.5" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.employee
                          ? `${record.employee.firstName} ${record.employee.lastName}`
                          : record.employeeId}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {record.regularHours.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-amber-600">
                        {record.overtimeHours.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums text-emerald-700">
                        {formatCurrency(record.grossPay)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-orange-600">
                        {formatCurrency(record.totalDeductions)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums text-teal-700">
                        {formatCurrency(record.netPay)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell>
                        {record.status?.toLowerCase() === "flagged" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(record.id);
                            }}
                            disabled={approvingId === record.id}
                          >
                            {approvingId === record.id ? (
                              <Loader2 className="size-3 mr-1 animate-spin" />
                            ) : (
                              <ShieldCheck className="size-3 mr-1" />
                            )}
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow
                        key={`${record.id}-detail`}
                        className="hover:bg-muted/10"
                      >
                        <TableCell colSpan={9} className="p-4 bg-muted/10">
                          <div className="ml-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white border rounded-lg p-4">
                                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                                  Earnings
                                </p>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      Regular Hours ({record.regularHours.toFixed(1)}h)
                                    </span>
                                    <span className="font-medium tabular-nums">
                                      {formatCurrency(
                                        record.regularHours *
                                          (record.employee?.payRate ?? 0)
                                      )}
                                    </span>
                                  </div>
                                  {record.overtimeHours > 0 && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        Overtime ({record.overtimeHours.toFixed(1)}h)
                                      </span>
                                      <span className="font-medium tabular-nums">
                                        {formatCurrency(
                                          record.overtimeHours *
                                            (record.employee?.payRate ?? 0) *
                                            (record.employee?.overtimeRate ?? 1.5)
                                        )}
                                      </span>
                                    </div>
                                  )}
                                  <Separator />
                                  <div className="flex justify-between text-sm font-semibold">
                                    <span>Gross Pay</span>
                                    <span className="text-emerald-700 tabular-nums">
                                      {formatCurrency(record.grossPay)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <DeductionBreakdown record={record} />
                            </div>
                            <Separator className="my-3" />
                            <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                              <span className="font-semibold text-teal-800">
                                Net Pay
                              </span>
                              <span className="text-xl font-bold text-teal-700 tabular-nums">
                                {formatCurrency(record.netPay)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Payroll Analytics Chart ----

function PayrollAnalyticsChart({ periods }: { periods: PayrollPeriod[] }) {
  const chartData = periods
    .filter((p) => p.records && p.records.length > 0)
    .map((p) => {
      const gross = p.records!.reduce((sum, r) => sum + r.grossPay, 0);
      const net = p.records!.reduce((sum, r) => sum + r.netPay, 0);
      const deductions = p.records!.reduce(
        (sum, r) => sum + r.totalDeductions,
        0
      );
      return {
        name: p.name.length > 15 ? p.name.substring(0, 15) + "..." : p.name,
        gross: Math.round(gross),
        net: Math.round(net),
        deductions: Math.round(deductions),
      };
    });

  // Deduction category aggregation
  const deductionCategories: Record<string, number> = {};
  periods.forEach((p) => {
    p.records?.forEach((r) => {
      if (r.federalTax > 0)
        deductionCategories["Federal Tax"] =
          (deductionCategories["Federal Tax"] ?? 0) + r.federalTax;
      if (r.stateTax > 0)
        deductionCategories["State Tax"] =
          (deductionCategories["State Tax"] ?? 0) + r.stateTax;
      if (r.socialSecurity > 0)
        deductionCategories["Social Security"] =
          (deductionCategories["Social Security"] ?? 0) + r.socialSecurity;
      if (r.medicare > 0)
        deductionCategories["Medicare"] =
          (deductionCategories["Medicare"] ?? 0) + r.medicare;
      if (r.healthInsurance > 0)
        deductionCategories["Health Ins."] =
          (deductionCategories["Health Ins."] ?? 0) + r.healthInsurance;
      if (r.retirement401k > 0)
        deductionCategories["401(k)"] =
          (deductionCategories["401(k)"] ?? 0) + r.retirement401k;
    });
  });

  const deductionData = Object.entries(deductionCategories).map(
    ([name, value]) => ({
      name,
      amount: Math.round(value),
    })
  );

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="size-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">
            No data available for analytics
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Run payroll to see charts and trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  const customTooltipStyle = {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Gross vs Net Pay */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gross vs Net Pay by Period</CardTitle>
          <CardDescription>
            Comparison of gross earnings and net take-home pay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar
                  dataKey="gross"
                  name="Gross Pay"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="net"
                  name="Net Pay"
                  fill="#14b8a6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Deduction Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deduction Categories</CardTitle>
          <CardDescription>
            Total deductions broken down by category across all periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deductionData}
                layout="vertical"
                barSize={18}
                margin={{ left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  type="number"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar
                  dataKey="amount"
                  name="Amount"
                  fill="#f97316"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Employee Pay Stub View ----

function EmployeePayStubView() {
  const { currentUserId, payrollPeriods } = useAppStore();

  const employeePeriods = payrollPeriods.filter((p) =>
    p.records?.some((r) => r.employeeId === currentUserId)
  );

  if (employeePeriods.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Receipt className="size-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">
            No pay stubs available
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Pay stubs will appear here after you have been included in a payroll
            run.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {employeePeriods.map((period) => {
        const record = period.records?.find(
          (r) => r.employeeId === currentUserId
        );
        if (!record) return null;

        return (
          <Card key={period.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{period.name}</CardTitle>
                  <CardDescription>
                    {period.startDate
                      ? `${format(parseISO(period.startDate), "MMM d, yyyy")} — ${format(parseISO(period.endDate), "MMM d, yyyy")}`
                      : "No dates"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Receipt className="size-4 text-emerald-600" />
                  {getStatusBadge(record.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Earnings Section */}
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                  Earnings
                </p>
                <div className="bg-emerald-50/40 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Regular ({record.regularHours.toFixed(1)} hrs)
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(record.grossPay - (record.grossPay * record.overtimeHours) / (record.totalHours || 1))}
                    </span>
                  </div>
                  {record.overtimeHours > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Overtime ({record.overtimeHours.toFixed(1)} hrs)
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatCurrency(
                          (record.grossPay * record.overtimeHours) /
                            (record.totalHours || 1)
                        )}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-sm font-bold">
                    <span>Gross Pay</span>
                    <span className="text-emerald-700 tabular-nums">
                      {formatCurrency(record.grossPay)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Taxes Section */}
              <div>
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">
                  Taxes
                </p>
                <div className="bg-orange-50/40 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Federal Tax</span>
                    <span className="tabular-nums">
                      {formatCurrency(record.federalTax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">State Tax</span>
                    <span className="tabular-nums">
                      {formatCurrency(record.stateTax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Social Security</span>
                    <span className="tabular-nums">
                      {formatCurrency(record.socialSecurity)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Medicare</span>
                    <span className="tabular-nums">
                      {formatCurrency(record.medicare)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions Section */}
              {(record.healthInsurance > 0 ||
                record.retirement401k > 0 ||
                record.otherDeductions > 0) && (
                <div>
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
                    Deductions
                  </p>
                  <div className="bg-purple-50/40 rounded-lg p-3 space-y-1.5">
                    {record.healthInsurance > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Health Insurance
                        </span>
                        <span className="tabular-nums">
                          {formatCurrency(record.healthInsurance)}
                        </span>
                      </div>
                    )}
                    {record.retirement401k > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">401(k)</span>
                        <span className="tabular-nums">
                          {formatCurrency(record.retirement401k)}
                        </span>
                      </div>
                    )}
                    {record.otherDeductions > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Other Deductions
                        </span>
                        <span className="tabular-nums">
                          {formatCurrency(record.otherDeductions)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Net Pay */}
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg p-4 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">Net Pay</p>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatCurrency(record.netPay)}
                    </p>
                  </div>
                  <Banknote className="size-8 text-teal-200" />
                </div>
                <div className="mt-2 flex items-center gap-1 text-teal-100 text-xs">
                  <span>
                    Total Deductions: {formatCurrency(record.totalDeductions)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ======================== MAIN COMPONENT ========================

export function PayrollView() {
  const { payrollPeriods, setPayrollPeriods, employees } = useAppStore();
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("payroll");

  // Compute summary from store data
  const summary: PayrollSummary = {
    totalGrossPay: payrollPeriods.reduce(
      (sum, p) =>
        sum + (p.records?.reduce((s, r) => s + r.grossPay, 0) ?? 0),
      0
    ),
    totalNetPay: payrollPeriods.reduce(
      (sum, p) =>
        sum + (p.records?.reduce((s, r) => s + r.netPay, 0) ?? 0),
      0
    ),
    totalDeductions: payrollPeriods.reduce(
      (sum, p) =>
        sum + (p.records?.reduce((s, r) => s + r.totalDeductions, 0) ?? 0),
      0
    ),
    flaggedRecords: payrollPeriods.reduce(
      (sum, p) =>
        sum +
        (p.records?.filter((r) => r.status?.toLowerCase() === "flagged")
          .length ?? 0),
      0
    ),
  };

  const fetchPeriods = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/payroll");
      if (res.ok) {
        const data = await res.json();
        setPayrollPeriods(data);
      }
    } catch {
      // Use cached store data on error
    } finally {
      setIsLoading(false);
    }
  }, [setPayrollPeriods]);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  function handleRunComplete() {
    fetchPeriods();
  }

  function handleSelectPeriod(period: PayrollPeriod) {
    setSelectedPeriod(period);
    setActiveTab("payroll");
  }

  function handleApprove(recordId: string) {
    // Update the record status in the store locally
    setPayrollPeriods(
      payrollPeriods.map((p) => {
        if (selectedPeriod && p.id === selectedPeriod.id) {
          return {
            ...p,
            records: p.records?.map((r) =>
              r.id === recordId ? { ...r, status: "approved" } : r
            ),
          };
        }
        return p;
      })
    );
    // Also update selected period
    if (selectedPeriod) {
      setSelectedPeriod({
        ...selectedPeriod,
        records: selectedPeriod.records?.map((r) =>
          r.id === recordId ? { ...r, status: "approved" } : r
        ),
      });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <FileText className="size-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
            <p className="text-muted-foreground text-sm">
              Manage payroll runs, view records, and track compensation
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-emerald-50/80 p-1">
          <TabsTrigger value="payroll" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="size-4 mr-1.5" />
            Payroll Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ArrowRight className="size-4 mr-1.5" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="paystubs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Receipt className="size-4 mr-1.5" />
            My Pay Stubs
          </TabsTrigger>
        </TabsList>

        {/* Payroll Management Tab */}
        <TabsContent value="payroll" className="space-y-4 mt-4">
          {/* Run Wizard */}
          <PayrollRunWizard onRunComplete={handleRunComplete} />

          {/* Periods Table */}
          <PayrollPeriodsTable
            periods={payrollPeriods}
            onSelectPeriod={handleSelectPeriod}
            selectedPeriodId={selectedPeriod?.id ?? null}
          />

          {/* Detail View */}
          {selectedPeriod && (
            <PayrollDetailView
              period={selectedPeriod}
              onApprove={handleApprove}
            />
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <PayrollAnalyticsChart periods={payrollPeriods} />
        </TabsContent>

        {/* Pay Stubs Tab */}
        <TabsContent value="paystubs" className="mt-4">
          <EmployeePayStubView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
