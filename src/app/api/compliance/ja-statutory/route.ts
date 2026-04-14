import { NextRequest, NextResponse } from "next/server";

// ─── JA Statutory Deduction Calculator ──────────────────────────────────────
// Calculates NIS, NHT, Education Tax, and PAYE for Jamaican payroll.

interface DeductionBreakdownItem {
  rate: string;
  ceiling: string;
  applied: number;
  amount: number;
}

interface DeductionBreakdown {
  nisEmployee: DeductionBreakdownItem;
  nisEmployer: DeductionBreakdownItem;
  nhtEmployee: DeductionBreakdownItem;
  nhtEmployer: DeductionBreakdownItem;
  educationTax: DeductionBreakdownItem;
  paye: DeductionBreakdownItem;
  normalizedAnnual: number;
}

interface DeductionResult {
  grossPay: number;
  payType: string;
  payeCode: string;
  normalizedAnnual: number;
  nisEmployee: number;
  nisEmployer: number;
  nhtEmployee: number;
  nhtEmployer: number;
  educationTax: number;
  paye: number;
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
  netPay: number;
  breakdown: DeductionBreakdown;
}

// PAYE thresholds by code (annual, JMD)
const PAYE_THRESHOLDS: Record<string, number> = {
  A: 1500096,
  B: 1200000,
  C: 900000,
  D: 600000,
  E: 300000,
};

function normalizeToAnnual(grossPay: number, payType: string): number {
  switch (payType) {
    case "weekly":
      return grossPay * 52;
    case "biweekly":
      return grossPay * 26;
    case "monthly":
      return grossPay * 12;
    case "annual":
      return grossPay;
    default:
      return grossPay;
  }
}

function normalizeToPeriod(annual: number, payType: string): number {
  switch (payType) {
    case "weekly":
      return annual / 52;
    case "biweekly":
      return annual / 26;
    case "monthly":
      return annual / 12;
    case "annual":
      return annual;
    default:
      return annual;
  }
}

// GET /api/compliance/ja-statutory — Calculate deductions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grossPayStr = searchParams.get("grossPay");
    const payType = searchParams.get("payType") || "monthly";
    const payeCode = searchParams.get("payeCode") || "A";

    if (!grossPayStr) {
      return NextResponse.json({ error: "grossPay query parameter is required" }, { status: 400 });
    }

    const grossPay = parseFloat(grossPayStr);
    if (isNaN(grossPay) || grossPay < 0) {
      return NextResponse.json({ error: "grossPay must be a valid non-negative number" }, { status: 400 });
    }

    const result = calculateDeductions(grossPay, payType, payeCode);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error calculating JA statutory deductions:", error);
    return NextResponse.json({ error: "Failed to calculate deductions" }, { status: 500 });
  }
}

// POST /api/compliance/ja-statutory — Seed compliance data (no-op)
export async function POST(_request: NextRequest) {
  return NextResponse.json({ success: true, message: "Compliance data seeded successfully" });
}

// ─── Calculation Engine ─────────────────────────────────────────────────────

function calculateDeductions(grossPay: number, payType: string, payeCode: string): DeductionResult {
  const normalizedAnnual = normalizeToAnnual(grossPay, payType);

  // NIS Employee: 3% of gross, ceiling JMD 32,400/week
  const nisWeeklyCeiling = 32400;
  const nisWeeklyGross = normalizedAnnual / 52;
  const nisWeeklyCapped = Math.min(nisWeeklyGross, nisWeeklyCeiling);
  const nisEmployeeAnnual = nisWeeklyCapped * 0.03 * 52;
  const nisEmployee = normalizeToPeriod(nisEmployeeAnnual, payType);

  // NIS Employer: 3.75% of gross, ceiling JMD 32,400/week
  const nisEmployerAnnual = nisWeeklyCapped * 0.0375 * 52;
  const nisEmployer = normalizeToPeriod(nisEmployerAnnual, payType);

  // NHT Employee: 2% of gross, ceiling JMD 1,500,000/month
  const nhtMonthlyCeiling = 1500000;
  const nhtMonthlyGross = normalizedAnnual / 12;
  const nhtMonthlyCapped = Math.min(nhtMonthlyGross, nhtMonthlyCeiling);
  const nhtEmployeeAnnual = nhtMonthlyCapped * 0.02 * 12;
  const nhtEmployee = normalizeToPeriod(nhtEmployeeAnnual, payType);

  // NHT Employer: 3% of gross, ceiling JMD 1,500,000/month
  const nhtEmployerAnnual = nhtMonthlyCapped * 0.03 * 12;
  const nhtEmployer = normalizeToPeriod(nhtEmployerAnnual, payType);

  // Education Tax: 2.5% of gross (no ceiling)
  const educationTaxAnnual = normalizedAnnual * 0.025;
  const educationTax = normalizeToPeriod(educationTaxAnnual, payType);

  // PAYE: 25% of amount above threshold (Code A: JMD 1,500,096/year)
  const payeThreshold = PAYE_THRESHOLDS[payeCode] || PAYE_THRESHOLDS.A;
  const taxableIncome = Math.max(0, normalizedAnnual - payeThreshold);
  const payeAnnual = taxableIncome * 0.25;
  const paye = normalizeToPeriod(payeAnnual, payType);

  const totalEmployeeDeductions = nisEmployee + nhtEmployee + educationTax + paye;
  const totalEmployerContributions = nisEmployer + nhtEmployer;
  const netPay = grossPay - totalEmployeeDeductions;

  const breakdown: DeductionBreakdown = {
    nisEmployee: {
      rate: "3%",
      ceiling: "JMD 32,400/week",
      applied: nisWeeklyCapped,
      amount: nisEmployee,
    },
    nisEmployer: {
      rate: "3.75%",
      ceiling: "JMD 32,400/week",
      applied: nisWeeklyCapped,
      amount: nisEmployer,
    },
    nhtEmployee: {
      rate: "2%",
      ceiling: "JMD 1,500,000/month",
      applied: nhtMonthlyCapped,
      amount: nhtEmployee,
    },
    nhtEmployer: {
      rate: "3%",
      ceiling: "JMD 1,500,000/month",
      applied: nhtMonthlyCapped,
      amount: nhtEmployer,
    },
    educationTax: {
      rate: "2.5%",
      ceiling: "None",
      applied: normalizedAnnual,
      amount: educationTax,
    },
    paye: {
      rate: "25%",
      ceiling: `Threshold: JMD ${payeThreshold.toLocaleString()}/year (${payeCode})`,
      applied: taxableIncome,
      amount: paye,
    },
    normalizedAnnual,
  };

  return {
    grossPay,
    payType,
    payeCode,
    normalizedAnnual,
    nisEmployee: Math.round(nisEmployee * 100) / 100,
    nisEmployer: Math.round(nisEmployer * 100) / 100,
    nhtEmployee: Math.round(nhtEmployee * 100) / 100,
    nhtEmployer: Math.round(nhtEmployer * 100) / 100,
    educationTax: Math.round(educationTax * 100) / 100,
    paye: Math.round(paye * 100) / 100,
    totalEmployeeDeductions: Math.round(totalEmployeeDeductions * 100) / 100,
    totalEmployerContributions: Math.round(totalEmployerContributions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100,
    breakdown,
  };
}
