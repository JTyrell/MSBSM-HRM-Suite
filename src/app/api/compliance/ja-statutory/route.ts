import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── JA Statutory Deduction Calculator ──────────────────────────────
// Now pulls rates from the statutory_rates table in Supabase
// so rate changes don't require code changes.

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
  ratesEffectiveFrom?: string;
}

function normalizeToAnnual(grossPay: number, payType: string): number {
  switch (payType) {
    case "weekly": return grossPay * 52;
    case "biweekly": return grossPay * 26;
    case "monthly": return grossPay * 12;
    case "annual": return grossPay;
    default: return grossPay;
  }
}

function normalizeToPeriod(annual: number, payType: string): number {
  switch (payType) {
    case "weekly": return annual / 52;
    case "biweekly": return annual / 26;
    case "monthly": return annual / 12;
    case "annual": return annual;
    default: return annual;
  }
}

// GET /api/compliance/ja-statutory — Calculate deductions using DB rates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grossPayStr = searchParams.get("grossPay");
    const payType = searchParams.get("payType") || "monthly";
    const payeCode = searchParams.get("payeCode") || "A";
    const effectiveDate = searchParams.get("effectiveDate"); // For historical lookups

    if (!grossPayStr) {
      return NextResponse.json({ error: "grossPay query parameter is required" }, { status: 400 });
    }

    const grossPay = parseFloat(grossPayStr);
    if (isNaN(grossPay) || grossPay < 0) {
      return NextResponse.json({ error: "grossPay must be a valid non-negative number" }, { status: 400 });
    }

    // Fetch rates from the DB
    const supabase = await createClient();
    const targetDate = effectiveDate || new Date().toISOString().split("T")[0];

    const { data: rates, error } = await supabase
      .from("statutory_rates")
      .select("*")
      .lte("effective_from", targetDate)
      .order("effective_from", { ascending: false });

    if (error) throw error;

    // Build rate map (latest rate for each key)
    const rateMap: Record<string, { value: number; ceiling: number | null; period: string | null; effectiveFrom: string }> = {};
    for (const rate of rates || []) {
      if (!rateMap[rate.rate_key]) {
        rateMap[rate.rate_key] = {
          value: rate.rate_value,
          ceiling: rate.ceiling_value,
          period: rate.ceiling_period,
          effectiveFrom: rate.effective_from,
        };
      }
    }

    // Use DB rates or fall back to hardcoded defaults
    const nisEmployeeRate = rateMap.nis_employee?.value ?? 0.03;
    const nisEmployerRate = rateMap.nis_employer?.value ?? 0.0375;
    const nisWeeklyCeiling = rateMap.nis_employee?.ceiling ?? 32400;
    const nhtEmployeeRate = rateMap.nht_employee?.value ?? 0.02;
    const nhtEmployerRate = rateMap.nht_employer?.value ?? 0.03;
    const nhtMonthlyCeiling = rateMap.nht_employee?.ceiling ?? 1500000;
    const educationTaxRate = rateMap.education_tax?.value ?? 0.025;
    const payeRate = rateMap.paye_rate?.value ?? 0.25;
    const payeThresholdKey = `paye_threshold_${payeCode.toLowerCase()}`;
    const payeThreshold = rateMap[payeThresholdKey]?.value ?? 1500096;
    const ratesEffectiveFrom = rateMap.nis_employee?.effectiveFrom;

    const result = calculateDeductions(
      grossPay, payType, payeCode,
      { nisEmployeeRate, nisEmployerRate, nisWeeklyCeiling, nhtEmployeeRate, nhtEmployerRate, nhtMonthlyCeiling, educationTaxRate, payeRate, payeThreshold },
      ratesEffectiveFrom
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error calculating JA statutory deductions:", error);
    return NextResponse.json({ error: "Failed to calculate deductions" }, { status: 500 });
  }
}

// POST /api/compliance/ja-statutory — No-op (rates are seeded via migrations)
export async function POST(_request: NextRequest) {
  return NextResponse.json({ success: true, message: "Compliance data managed via Supabase migrations" });
}

// ─── Calculation Engine ─────────────────────────────────────────────

interface Rates {
  nisEmployeeRate: number;
  nisEmployerRate: number;
  nisWeeklyCeiling: number;
  nhtEmployeeRate: number;
  nhtEmployerRate: number;
  nhtMonthlyCeiling: number;
  educationTaxRate: number;
  payeRate: number;
  payeThreshold: number;
}

function calculateDeductions(
  grossPay: number, payType: string, payeCode: string,
  rates: Rates, ratesEffectiveFrom?: string
): DeductionResult {
  const normalizedAnnual = normalizeToAnnual(grossPay, payType);

  // NIS Employee
  const nisWeeklyGross = normalizedAnnual / 52;
  const nisWeeklyCapped = Math.min(nisWeeklyGross, rates.nisWeeklyCeiling);
  const nisEmployeeAnnual = nisWeeklyCapped * rates.nisEmployeeRate * 52;
  const nisEmployee = normalizeToPeriod(nisEmployeeAnnual, payType);

  // NIS Employer
  const nisEmployerAnnual = nisWeeklyCapped * rates.nisEmployerRate * 52;
  const nisEmployer = normalizeToPeriod(nisEmployerAnnual, payType);

  // NHT Employee
  const nhtMonthlyGross = normalizedAnnual / 12;
  const nhtMonthlyCapped = Math.min(nhtMonthlyGross, rates.nhtMonthlyCeiling);
  const nhtEmployeeAnnual = nhtMonthlyCapped * rates.nhtEmployeeRate * 12;
  const nhtEmployee = normalizeToPeriod(nhtEmployeeAnnual, payType);

  // NHT Employer
  const nhtEmployerAnnual = nhtMonthlyCapped * rates.nhtEmployerRate * 12;
  const nhtEmployer = normalizeToPeriod(nhtEmployerAnnual, payType);

  // Education Tax (no ceiling)
  const educationTaxAnnual = normalizedAnnual * rates.educationTaxRate;
  const educationTax = normalizeToPeriod(educationTaxAnnual, payType);

  // PAYE
  const taxableIncome = Math.max(0, normalizedAnnual - rates.payeThreshold);
  const payeAnnual = taxableIncome * rates.payeRate;
  const paye = normalizeToPeriod(payeAnnual, payType);

  const totalEmployeeDeductions = nisEmployee + nhtEmployee + educationTax + paye;
  const totalEmployerContributions = nisEmployer + nhtEmployer;
  const netPay = grossPay - totalEmployeeDeductions;

  const breakdown: DeductionBreakdown = {
    nisEmployee: { rate: `${rates.nisEmployeeRate * 100}%`, ceiling: `JMD ${rates.nisWeeklyCeiling.toLocaleString()}/week`, applied: nisWeeklyCapped, amount: nisEmployee },
    nisEmployer: { rate: `${rates.nisEmployerRate * 100}%`, ceiling: `JMD ${rates.nisWeeklyCeiling.toLocaleString()}/week`, applied: nisWeeklyCapped, amount: nisEmployer },
    nhtEmployee: { rate: `${rates.nhtEmployeeRate * 100}%`, ceiling: `JMD ${rates.nhtMonthlyCeiling.toLocaleString()}/month`, applied: nhtMonthlyCapped, amount: nhtEmployee },
    nhtEmployer: { rate: `${rates.nhtEmployerRate * 100}%`, ceiling: `JMD ${rates.nhtMonthlyCeiling.toLocaleString()}/month`, applied: nhtMonthlyCapped, amount: nhtEmployer },
    educationTax: { rate: `${rates.educationTaxRate * 100}%`, ceiling: "None", applied: normalizedAnnual, amount: educationTax },
    paye: { rate: `${rates.payeRate * 100}%`, ceiling: `Threshold: JMD ${rates.payeThreshold.toLocaleString()}/year (${payeCode})`, applied: taxableIncome, amount: paye },
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
    ratesEffectiveFrom,
  };
}
