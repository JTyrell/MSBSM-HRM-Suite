"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  Calculator,
  BookOpen,
  CheckCircle2,
  FileText,
  Scale,
  ShieldCheck,
  AlertTriangle,
  BadgeCheck,
  XCircle,
  Search,
  Users,
  Landmark,
  Clock,
  Heart,
  Megaphone,
} from "lucide-react";

// ─── Interfaces ──────────────────────────────────────────────────

interface DeductionResult {
  grossPay: number;
  payType: string;
  payeCode: string;
  nisEmployee: number;
  nisEmployer: number;
  nhtEmployee: number;
  nhtEmployer: number;
  educationTax: number;
  payeTax: number;
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
  netPay: number;
  breakdown: {
    nisRate: string;
    nisEmployerRate: string;
    nhtRate: string;
    nhtEmployerRate: string;
    educationRate: string;
    payeRate: string;
    payeThreshold: string;
    nisCeilingWeekly: string;
    nhtCeilingMonthly: string;
    normalizedAnnual: number;
  };
}

interface ValidationItem {
  value: string;
  type: "TRN" | "NIS";
  isValid: boolean;
  message: string;
}

// ─── Helpers ────────────────────────────────────────────────────

function formatJMD(amount: number): string {
  return `JMD ${amount.toLocaleString("en-JM", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Jamaican Statutory Rates ───────────────────────────────────

const JA_RATES = {
  nis: {
    employee: "3%",
    employer: "3.75%",
    ceilingWeekly: "JMD 23,880",
    ceilingAnnual: "JMD 1,241,760",
  },
  nht: {
    employee: "2%",
    employer: "3%",
    ceilingMonthly: "JMD 32,000",
    ceilingAnnual: "JMD 384,000",
  },
  educationTax: { rate: "2.5%" },
  paye: {
    rate: "25%",
    threshold: "JMD 1,500,096/year",
    thresholdRaw: 1500096,
  },
};

// ─── PAYE Tax Code Descriptions ─────────────────────────────────

const PAYE_CODES: Record<string, string> = {
  A: "Standard — No special allowances",
  B: "Tax-free threshold applied",
  C: "Additional pension deduction",
  D: "Reduced threshold (part-year resident)",
  E: "Enhanced threshold (senior citizen 60+)",
};

// ─── Labor Law Sections ─────────────────────────────────────────

const LABOR_LAW_SECTIONS = [
  {
    title: "Maximum Shift Length",
    icon: Clock,
    color: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    summary:
      "Ordinary working hours shall not exceed 8 hours per day or 40 hours per week for most employees.",
    details: [
      "8-hour maximum per day (10 hours for certain industrial workers)",
      "40-hour maximum per week (standard 5-day work week)",
      "Overtime applies beyond standard hours at 1.5x normal rate",
      "Sunday/Public Holiday work compensated at 2x normal rate",
    ],
  },
  {
    title: "Meal & Rest Breaks",
    icon: Heart,
    color: "bg-teal-50 dark:bg-teal-950/40",
    iconColor: "text-teal-600 dark:text-teal-400",
    summary:
      "Employees working more than 6 hours are entitled to a meal break of at least 30 minutes.",
    details: [
      "Minimum 30-minute meal break after 6 consecutive hours",
      "Employer not required to pay for meal break unless employee is required to remain on premises",
      "Additional 10-minute rest breaks may be provided per 4-hour work period",
      "Break scheduling at the employer's discretion within the shift",
    ],
  },
  {
    title: "Overtime Compensation",
    icon: Landmark,
    color: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    summary:
      "Hours worked in excess of standard hours must be compensated at 1.5x the normal hourly rate.",
    details: [
      "Time-and-a-half (1.5x) for hours exceeding daily/weekly standard",
      "Double-time (2x) for Sunday and Public Holiday work",
      "Overtime consent — employee may refuse overtime in most cases",
      "Employers must maintain accurate overtime records",
    ],
  },
  {
    title: "Sick Leave Entitlement",
    icon: ShieldCheck,
    color: "bg-rose-50 dark:bg-rose-950/40",
    iconColor: "text-rose-600 dark:text-rose-400",
    summary:
      "Employees with at least 1 year of service are entitled to 10 working days of paid sick leave per year.",
    details: [
      "10 working days per year (after 12 months of continuous service)",
      "Medical certificate required for absences exceeding 2 consecutive days",
      "Unused sick leave does not carry over to the next year",
      "Sick leave is paid at the employee's normal rate of pay",
    ],
  },
  {
    title: "Maternity Leave",
    icon: Heart,
    color: "bg-pink-50 dark:bg-pink-950/40",
    iconColor: "text-pink-600 dark:text-pink-400",
    summary:
      "Female employees are entitled to 12 weeks of maternity leave with at least 8 weeks paid.",
    details: [
      "Total 12 weeks of maternity leave (at least 8 weeks post-delivery)",
      "Minimum 8 weeks paid at full rate for qualifying employees",
      "Must notify employer in writing at least 3 months before expected date",
      "Protection from dismissal during pregnancy and maternity leave",
    ],
  },
  {
    title: "Termination Notice Period",
    icon: Megaphone,
    color: "bg-violet-50 dark:bg-violet-950/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    summary:
      "Minimum notice periods apply based on length of service, ranging from 2 weeks to 12 weeks.",
    details: [
      "Less than 6 months service — 2 weeks notice",
      "6 months to 2 years — 4 weeks notice",
      "2 to 5 years — 6 weeks notice",
      "5 to 10 years — 8 weeks notice",
      "Over 10 years — 12 weeks notice",
      "Payment in lieu of notice may be offered by the employer",
    ],
  },
];

// ─── Mock Compliance Employees ──────────────────────────────────

const COMPLIANCE_EMPLOYEES = [
  { name: "Donovan Brown", trn: "123-456-789", nis: "12-345678-9", nht: "Active", department: "Human Resources" },
  { name: "Shanice Clarke", trn: "234-567-890", nis: "23-456789-0", nht: "Active", department: "Accounting" },
  { name: "Omar Johnson", trn: "345-678-901", nis: "34-567890-1", nht: "Active", department: "Marketing" },
  { name: "Lisa Thompson", trn: "456-789-012", nis: "45-678901-2", nht: "Pending", department: "Maintenance/Support" },
  { name: "Andre Williams", trn: "567-890-123", nis: "56-789012-3", nht: "Active", department: "Centre of Excellence" },
  { name: "Nicole Davis", trn: "678-901-234", nis: "67-890123-4", nht: "Active", department: "Administrative Staff" },
  { name: "Marcus Small", trn: "789-012-345", nis: "78-901234-5", nht: "Expired", department: "PSU" },
  { name: "Patricia Morgan", trn: "890-123-456", nis: "89-012345-6", nht: "Active", department: "Graduate Programmes" },
  { name: "Kemar Campbell", trn: "901-234-567", nis: "90-123456-7", nht: "Active", department: "Office of Executive Director" },
  { name: "Angela Reid", trn: "112-233-445", nis: "11-223344-5", nht: "Pending", department: "Documentation Centre" },
  { name: "Dwayne Taylor", trn: "223-344-556", nis: "22-334455-6", nht: "Active", department: "Human Resources" },
  { name: "Sasha Morgan", trn: "334-455-667", nis: "33-445566-7", nht: "Active", department: "Accounting" },
  { name: "Ricardo Allen", trn: "445-566-778", nis: "44-556677-8", nht: "Expired", department: "Marketing" },
  { name: "Tanesha Henry", trn: "556-677-889", nis: "55-667788-9", nht: "Active", department: "Maintenance/Support" },
  { name: "Clifton Green", trn: "667-788-990", nis: "66-778899-0", nht: "Active", department: "Centre of Excellence" },
];

// ─── Mock Remittance Data ───────────────────────────────────────

const REMITTANCE_DATA = [
  { month: "Jan 2025", nis: 285600, nht: 192000, education: 93750, paye: 312500 },
  { month: "Feb 2025", nis: 291200, nht: 196000, education: 95600, paye: 318700 },
  { month: "Mar 2025", nis: 288400, nht: 194400, education: 94800, paye: 316000 },
  { month: "Apr 2025", nis: 295100, nht: 198000, education: 97000, paye: 323400 },
  { month: "May 2025", nis: 290800, nht: 195200, education: 95500, paye: 318300 },
  { month: "Jun 2025", nis: 293500, nht: 197600, education: 96400, paye: 321300 },
];

// ─── Calculator Logic ──────────────────────────────────────────

function calculateJADeductions(
  grossPay: number,
  payType: string,
  payeCode: string
): DeductionResult {
  // Normalize to annual
  let normalizedAnnual: number;
  const weeklyGross: number =
    payType === "weekly"
      ? grossPay
      : payType === "biweekly"
      ? grossPay / 2
      : payType === "monthly"
      ? grossPay / 4.333
      : grossPay / 52;

  const monthlyGross: number =
    payType === "monthly"
      ? grossPay
      : payType === "biweekly"
      ? grossPay * 2.166
      : payType === "weekly"
      ? grossPay * 4.333
      : grossPay / 12;

  normalizedAnnual =
    payType === "annual"
      ? grossPay
      : payType === "monthly"
      ? grossPay * 12
      : payType === "biweekly"
      ? grossPay * 26
      : grossPay * 52;

  // NIS: 3% employee / 3.75% employer, ceiling JMD 23,880/week
  const nisCeilingWeekly = 23880;
  const nisSubjectWeekly = Math.min(weeklyGross, nisCeilingWeekly);
  const nisAnnualSubject = nisSubjectWeekly * 52;
  const nisEmployee = nisAnnualSubject * 0.03;
  const nisEmployer = nisAnnualSubject * 0.0375;

  // NHT: 2% employee / 3% employer, ceiling JMD 32,000/month
  const nhtCeilingMonthly = 32000;
  const nhtSubjectMonthly = Math.min(monthlyGross, nhtCeilingMonthly);
  const nhtAnnualSubject = nhtSubjectMonthly * 12;
  const nhtEmployee = nhtAnnualSubject * 0.02;
  const nhtEmployer = nhtAnnualSubject * 0.03;

  // Education Tax: 2.5% of gross
  const educationTax = normalizedAnnual * 0.025;

  // PAYE: 25% above threshold JMD 1,500,096/year
  const payeThreshold = 1500096;
  let payeTax = 0;
  let effectiveThreshold = payeThreshold;
  if (payeCode === "E") {
    effectiveThreshold = payeThreshold * 1.15; // Senior citizen enhanced
  } else if (payeCode === "D") {
    effectiveThreshold = payeThreshold * 0.75; // Part-year resident
  } else if (payeCode === "B") {
    effectiveThreshold = payeThreshold * 1.0;
  }
  const taxableIncome = Math.max(0, normalizedAnnual - effectiveThreshold);
  payeTax = taxableIncome * 0.25;

  const totalEmployeeDeductions = nisEmployee + nhtEmployee + educationTax + payeTax;
  const totalEmployerContributions = nisEmployer + nhtEmployer;
  const netPay = normalizedAnnual - totalEmployeeDeductions;

  return {
    grossPay,
    payType,
    payeCode,
    nisEmployee: Math.round(nisEmployee * 100) / 100,
    nisEmployer: Math.round(nisEmployer * 100) / 100,
    nhtEmployee: Math.round(nhtEmployee * 100) / 100,
    nhtEmployer: Math.round(nhtEmployer * 100) / 100,
    educationTax: Math.round(educationTax * 100) / 100,
    payeTax: Math.round(payeTax * 100) / 100,
    totalEmployeeDeductions: Math.round(totalEmployeeDeductions * 100) / 100,
    totalEmployerContributions: Math.round(totalEmployerContributions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100,
    breakdown: {
      nisRate: "3%",
      nisEmployerRate: "3.75%",
      nhtRate: "2%",
      nhtEmployerRate: "3%",
      educationRate: "2.5%",
      payeRate: "25%",
      payeThreshold: formatJMD(effectiveThreshold) + "/year",
      nisCeilingWeekly: formatJMD(nisCeilingWeekly) + "/week",
      nhtCeilingMonthly: formatJMD(nhtCeilingMonthly) + "/month",
      normalizedAnnual: Math.round(normalizedAnnual * 100) / 100,
    },
  };
}

// ─── TRN/NIS Validators ─────────────────────────────────────────

function validateTRN(value: string): ValidationItem {
  const cleaned = value.replace(/[\s\-]/g, "");
  if (cleaned.length !== 9) {
    return {
      value,
      type: "TRN",
      isValid: false,
      message: "TRN must be exactly 9 digits (format: XXX-XXX-XXX)",
    };
  }
  if (!/^\d{9}$/.test(cleaned)) {
    return {
      value,
      type: "TRN",
      isValid: false,
      message: "TRN must contain only numeric digits",
    };
  }
  const formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}`;
  return {
    value: formatted,
    type: "TRN",
    isValid: true,
    message: "Valid TRN format",
  };
}

function validateNIS(value: string): ValidationItem {
  const cleaned = value.replace(/[\s\-]/g, "");
  if (cleaned.length !== 9) {
    return {
      value,
      type: "NIS",
      isValid: false,
      message: "NIS must be exactly 9 digits (format: XX-XXXXXX-X)",
    };
  }
  if (!/^\d{9}$/.test(cleaned)) {
    return {
      value,
      type: "NIS",
      isValid: false,
      message: "NIS must contain only numeric digits",
    };
  }
  const formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 8)}-${cleaned.slice(8, 9)}`;
  return {
    value: formatted,
    type: "NIS",
    isValid: true,
    message: "Valid NIS format",
  };
}

// ─── Main Component ─────────────────────────────────────────────

export function JAComplianceView() {
  const [grossPay, setGrossPay] = useState<string>("150000");
  const [payType, setPayType] = useState<string>("monthly");
  const [payeCode, setPayeCode] = useState<string>("A");
  const [validationInput, setValidationInput] = useState<string>("");
  const [validationType, setValidationType] = useState<"TRN" | "NIS">("TRN");
  const [validationResults, setValidationResults] = useState<ValidationItem[]>([]);
  const [batchInput, setBatchInput] = useState<string>("");
  const [batchType, setBatchType] = useState<"TRN" | "NIS">("TRN");

  // Calculator result
  const result: DeductionResult = useMemo(() => {
    const pay = parseFloat(grossPay) || 0;
    return calculateJADeductions(pay, payType, payeCode);
  }, [grossPay, payType, payeCode]);

  // Single validation
  const handleValidateSingle = () => {
    if (!validationInput.trim()) return;
    const res =
      validationType === "TRN"
        ? validateTRN(validationInput)
        : validateNIS(validationInput);
    setValidationResults([res]);
  };

  // Batch validation
  const handleBatchValidate = () => {
    if (!batchInput.trim()) return;
    const lines = batchInput
      .split(/[\n,;]+/)
      .map((l) => l.trim())
      .filter(Boolean);
    const results = lines.map((line) =>
      batchType === "TRN" ? validateTRN(line) : validateNIS(line)
    );
    setValidationResults(results);
  };

  // Summary stats for compliance
  const complianceStats = useMemo(() => {
    const active = COMPLIANCE_EMPLOYEES.filter((e) => e.nht === "Active").length;
    const pending = COMPLIANCE_EMPLOYEES.filter((e) => e.nht === "Pending").length;
    const expired = COMPLIANCE_EMPLOYEES.filter((e) => e.nht === "Expired").length;
    const totalRemittance = REMITTANCE_DATA.reduce((sum, r) => sum + r.nis + r.nht + r.education + r.paye, 0);
    return { total: COMPLIANCE_EMPLOYEES.length, active, pending, expired, totalRemittance };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-emerald-600 dark:text-emerald-400">JA</span>{" "}
            Statutory Compliance Engine
          </h1>
          <p className="text-sm text-muted-foreground">
            Jamaican payroll deductions, tax rates, TRN/NIS validation, and labor law reference
          </p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Jamaica Statutory
        </Badge>
      </div>

      {/* ─── Tabbed Content ─────────────────────────────────────── */}
      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="calculator" className="gap-1.5 text-xs sm:text-sm">
            <Calculator className="h-4 w-4 hidden sm:block" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="rates" className="gap-1.5 text-xs sm:text-sm">
            <BookOpen className="h-4 w-4 hidden sm:block" />
            Rates
          </TabsTrigger>
          <TabsTrigger value="validator" className="gap-1.5 text-xs sm:text-sm">
            <BadgeCheck className="h-4 w-4 hidden sm:block" />
            TRN/NIS
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5 text-xs sm:text-sm">
            <FileText className="h-4 w-4 hidden sm:block" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="labor" className="gap-1.5 text-xs sm:text-sm">
            <Scale className="h-4 w-4 hidden sm:block" />
            Labor Law
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 1: CALCULATOR                                      */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <Card className="lg:col-span-1 border-emerald-200/60 dark:border-emerald-800/40">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Payroll Calculator
                </CardTitle>
                <CardDescription>
                  Enter employee gross pay to compute statutory deductions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gross Pay (JMD)</label>
                  <Input
                    type="number"
                    value={grossPay}
                    onChange={(e) => setGrossPay(e.target.value)}
                    placeholder="Enter gross pay amount"
                    className="border-emerald-300 focus-visible:ring-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pay Type</label>
                  <Select value={payType} onValueChange={setPayType}>
                    <SelectTrigger className="w-full border-emerald-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">PAYE Tax Code</label>
                  <Select value={payeCode} onValueChange={setPayeCode}>
                    <SelectTrigger className="w-full border-emerald-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYE_CODES).map(([code, desc]) => (
                        <SelectItem key={code} value={code}>
                          <span className="font-mono font-semibold">{code}</span>{" "}
                          — {desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-2 space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium">Normalized Annual:</span>{" "}
                    {formatJMD(result.breakdown.normalizedAnnual)}
                  </p>
                  <p>
                    <span className="font-medium">Tax Code {payeCode}:</span>{" "}
                    {PAYE_CODES[payeCode]}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="lg:col-span-2 border-teal-200/60 dark:border-teal-800/40">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  Deduction Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Net Pay Highlight */}
                <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                  <p className="text-sm font-medium opacity-90">Net Annual Pay</p>
                  <p className="text-3xl font-bold tracking-tight">
                    {formatJMD(result.netPay)}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    Gross: {formatJMD(result.breakdown.normalizedAnnual)} | Deductions:{" "}
                    {formatJMD(result.totalEmployeeDeductions)}
                  </p>
                </div>

                {/* Employee Deductions */}
                <div>
                  <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-3">
                    Employee Deductions
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "NIS (3%)", amount: result.nisEmployee, note: `Ceiling: ${result.breakdown.nisCeilingWeekly}` },
                      { label: "NHT (2%)", amount: result.nhtEmployee, note: `Ceiling: ${result.breakdown.nhtCeilingMonthly}` },
                      { label: "Education Tax (2.5%)", amount: result.educationTax, note: "No ceiling" },
                      { label: `PAYE (25%)`, amount: result.payeTax, note: `Threshold: ${result.breakdown.payeThreshold}` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div>
                          <span className="text-sm">{item.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">{item.note}</span>
                        </div>
                        <span className="text-sm font-mono font-semibold">
                          {formatJMD(item.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">Total Employee Deductions</span>
                      <span className="text-sm font-mono font-bold text-red-600 dark:text-red-400">
                        -{formatJMD(result.totalEmployeeDeductions)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Employer Contributions */}
                <div>
                  <h3 className="text-sm font-semibold text-teal-700 dark:text-teal-400 mb-3">
                    Employer Contributions
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "NIS (3.75%)", amount: result.nisEmployer },
                      { label: "NHT (3%)", amount: result.nhtEmployer },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm">{item.label}</span>
                        <span className="text-sm font-mono font-semibold">
                          {formatJMD(item.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">Total Employer Contributions</span>
                      <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">
                        {formatJMD(result.totalEmployerContributions)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Take-Home Ratio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Take-Home Ratio</span>
                    <span className="font-semibold">
                      {result.breakdown.normalizedAnnual > 0
                        ? ((result.netPay / result.breakdown.normalizedAnnual) * 100).toFixed(1)
                        : "0"}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      result.breakdown.normalizedAnnual > 0
                        ? (result.netPay / result.breakdown.normalizedAnnual) * 100
                        : 0
                    }
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 2: RATES REFERENCE                                 */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="rates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Jamaican Statutory Deduction Rates (Current)
              </CardTitle>
              <CardDescription>
                Reference table of all statutory deduction rates effective for the current fiscal year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50 dark:bg-emerald-950/30">
                    <TableHead className="font-semibold">Deduction</TableHead>
                    <TableHead className="font-semibold">Employee Rate</TableHead>
                    <TableHead className="font-semibold">Employer Rate</TableHead>
                    <TableHead className="font-semibold">Ceiling</TableHead>
                    <TableHead className="font-semibold">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">NIS (National Insurance)</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                        {JA_RATES.nis.employee}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                        {JA_RATES.nis.employer}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{JA_RATES.nis.ceilingWeekly}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">Applied to gross weekly earnings, capped at ceiling</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">NHT (National Housing Trust)</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                        {JA_RATES.nht.employee}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                        {JA_RATES.nht.employer}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{JA_RATES.nht.ceilingMonthly}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">Applied to gross monthly earnings, capped at ceiling</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Education Tax</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        {JA_RATES.educationTax.rate}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">N/A</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">No ceiling</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">Employer-paid; historically deducted from employee pay</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">PAYE (Pay As You Earn)</TableCell>
                    <TableCell>
                      <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                        {JA_RATES.paye.rate}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">N/A</span>
                    </TableCell>
                    <TableCell className="text-xs">{JA_RATES.paye.threshold}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">25% on taxable income above annual threshold</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">HEART / NHT / NIS Combined</TableCell>
                    <TableCell>
                      <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                        7.5%–10%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                        6.75%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">Varies</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">Total statutory burden depends on pay level</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* PAYE Tax Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">PAYE Tax Codes Reference</CardTitle>
              <CardDescription>
                Description of available PAYE tax codes used in payroll calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-teal-50 dark:bg-teal-950/30">
                    <TableHead className="font-semibold w-24">Code</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Threshold Effect</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(PAYE_CODES).map(([code, desc]) => {
                    const thresholdNote =
                      code === "A"
                        ? "Standard threshold applies"
                        : code === "B"
                        ? "Standard threshold applies"
                        : code === "C"
                        ? "Standard threshold with pension deduction"
                        : code === "D"
                        ? "75% of standard threshold"
                        : code === "E"
                        ? "115% of standard threshold (senior)"
                        : "Standard threshold applies";
                    return (
                      <TableRow key={code}>
                        <TableCell>
                          <Badge className="font-mono bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                            {code}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{desc}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{thresholdNote}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 3: TRN/NIS VALIDATOR                                */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="validator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Single Validator */}
            <Card className="border-emerald-200/60 dark:border-emerald-800/40">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Single Validator
                </CardTitle>
                <CardDescription>
                  Validate a single TRN or NIS number for correct format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={validationType} onValueChange={(v: "TRN" | "NIS") => setValidationType(v)}>
                  <SelectTrigger className="w-full border-emerald-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRN">TRN — Tax Registration Number</SelectItem>
                    <SelectItem value="NIS">NIS — National Insurance Scheme</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    value={validationInput}
                    onChange={(e) => setValidationInput(e.target.value)}
                    placeholder={
                      validationType === "TRN"
                        ? "Enter TRN (e.g., 123-456-789)"
                        : "Enter NIS (e.g., 12-345678-9)"
                    }
                    className="flex-1 border-emerald-300 focus-visible:ring-emerald-400"
                  />
                  <Button
                    onClick={handleValidateSingle}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {validationResults.length === 1 && (
                  <div
                    className={`p-4 rounded-xl border ${
                      validationResults[0].isValid
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                        : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {validationResults[0].isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <span className="text-sm font-semibold">
                        {validationResults[0].isValid ? "Valid" : "Invalid"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {validationResults[0].type}: {validationResults[0].value}
                    </p>
                    <p className="text-xs mt-1">{validationResults[0].message}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Batch Validator */}
            <Card className="border-teal-200/60 dark:border-teal-800/40">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  Batch Validator
                </CardTitle>
                <CardDescription>
                  Validate multiple TRN or NIS numbers at once (one per line, comma, or semicolon separated)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={batchType} onValueChange={(v: "TRN" | "NIS") => setBatchType(v)}>
                  <SelectTrigger className="w-full border-teal-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRN">TRN — Tax Registration Number</SelectItem>
                    <SelectItem value="NIS">NIS — National Insurance Scheme</SelectItem>
                  </SelectContent>
                </Select>
                <textarea
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder={
                    batchType === "TRN"
                      ? "123-456-789\n234-567-890\n345-678-901"
                      : "12-345678-9\n23-456789-0\n34-567890-1"
                  }
                  rows={5}
                  className="flex w-full rounded-md border border-teal-300 bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleBatchValidate}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Validate All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setValidationResults([]);
                      setBatchInput("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Results */}
          {validationResults.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Batch Results ({validationResults.length} items)
                </CardTitle>
                <CardDescription>
                  {validationResults.filter((v) => v.isValid).length} valid,{" "}
                  {validationResults.filter((v) => !v.isValid).length} invalid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {validationResults.map((v, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        v.isValid
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                          : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                      }`}
                    >
                      {v.isValid ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium font-mono">{v.value}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              v.type === "TRN"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                : "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300"
                            }`}
                          >
                            {v.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{v.message}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[10px] ${
                          v.isValid
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                        }`}
                      >
                        {v.isValid ? "Valid" : "Invalid"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 4: COMPLIANCE REPORTS                               */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="reports" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-emerald-200/60 dark:border-emerald-800/40">
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                    <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Employees</p>
                    <p className="text-xl font-bold">{complianceStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-teal-200/60 dark:border-teal-800/40">
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/40">
                    <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">NHT Active</p>
                    <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                      {complianceStats.active}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200/60 dark:border-amber-800/40">
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">NHT Pending</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {complianceStats.pending}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200/60 dark:border-red-800/40">
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950/40">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">NHT Expired</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                      {complianceStats.expired}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Compliance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Employee Compliance Status</CardTitle>
              <CardDescription>
                TRN, NIS, and NHT compliance status for all {complianceStats.total} employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-emerald-50 dark:bg-emerald-950/30">
                      <TableHead className="font-semibold">Employee</TableHead>
                      <TableHead className="font-semibold">Department</TableHead>
                      <TableHead className="font-semibold">TRN</TableHead>
                      <TableHead className="font-semibold">NIS</TableHead>
                      <TableHead className="font-semibold">NHT Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {COMPLIANCE_EMPLOYEES.map((emp) => (
                      <TableRow key={emp.trn}>
                        <TableCell className="font-medium text-sm">{emp.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{emp.department}</TableCell>
                        <TableCell className="font-mono text-xs">{emp.trn}</TableCell>
                        <TableCell className="font-mono text-xs">{emp.nis}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              emp.nht === "Active"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                : emp.nht === "Pending"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                            }`}
                          >
                            {emp.nht}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 6-Month Remittance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">6-Month Remittance Summary</CardTitle>
              <CardDescription>
                Total statutory contributions remitted over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-teal-50 dark:bg-teal-950/30">
                      <TableHead className="font-semibold">Month</TableHead>
                      <TableHead className="font-semibold text-right">NIS</TableHead>
                      <TableHead className="font-semibold text-right">NHT</TableHead>
                      <TableHead className="font-semibold text-right">Education Tax</TableHead>
                      <TableHead className="font-semibold text-right">PAYE</TableHead>
                      <TableHead className="font-semibold text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {REMITTANCE_DATA.map((row) => {
                      const total = row.nis + row.nht + row.education + row.paye;
                      return (
                        <TableRow key={row.month}>
                          <TableCell className="font-medium text-sm">{row.month}</TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatJMD(row.nis)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatJMD(row.nht)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatJMD(row.education)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatJMD(row.paye)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-semibold">
                            {formatJMD(total)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-emerald-50 dark:bg-emerald-950/30 font-semibold">
                      <TableCell className="text-sm">6-Month Total</TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatJMD(REMITTANCE_DATA.reduce((s, r) => s + r.nis, 0))}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatJMD(REMITTANCE_DATA.reduce((s, r) => s + r.nht, 0))}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatJMD(REMITTANCE_DATA.reduce((s, r) => s + r.education, 0))}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatJMD(REMITTANCE_DATA.reduce((s, r) => s + r.paye, 0))}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-emerald-600 dark:text-emerald-400">
                        {formatJMD(complianceStats.totalRemittance)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB 5: LABOR LAW REFERENCE                              */}
        {/* ═══════════════════════════════════════════════════════ */}
        <TabsContent value="labor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Jamaican Labour Law Quick Reference
              </CardTitle>
              <CardDescription>
                Key provisions of the Labour Relations and Industrial Disputes Act and related legislation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LABOR_LAW_SECTIONS.map((section) => {
                  const IconComp = section.icon;
                  return (
                    <Card
                      key={section.title}
                      className="border-border/50 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center justify-center h-10 w-10 rounded-xl ${section.color}`}
                          >
                            <IconComp
                              className={`h-5 w-5 ${section.iconColor}`}
                            />
                          </div>
                          <h3 className="text-sm font-semibold">{section.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {section.summary}
                        </p>
                        <ul className="space-y-1.5">
                          {section.details.map((detail, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
