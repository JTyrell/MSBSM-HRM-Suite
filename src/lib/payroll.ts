// Payroll calculation engine

export interface PayrollCalculationInput {
  regularHours: number;
  overtimeHours: number;
  payRate: number;
  overtimeRate: number;
  taxFilingStatus: string;
  taxAllowances: number;
  healthInsurance: number;
  retirement401k: number;
  otherDeductions: number;
}

export interface PayrollResult {
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  regularPay: number;
  overtimePay: number;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  healthInsurance: number;
  retirement401k: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
}

// 2024 Federal tax brackets (simplified)
const FEDERAL_BRACKETS_SINGLE = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

const FEDERAL_BRACKETS_MARRIED = [
  { min: 0, max: 23200, rate: 0.10 },
  { min: 23200, max: 94300, rate: 0.12 },
  { min: 94300, max: 201050, rate: 0.22 },
  { min: 201050, max: 383900, rate: 0.24 },
  { min: 383900, max: 487450, rate: 0.32 },
  { min: 487450, max: 731200, rate: 0.35 },
  { min: 731200, max: Infinity, rate: 0.37 },
];

// State tax rates (simplified - using average rates)
const STATE_TAX_RATES: Record<string, number> = {
  default: 0.05,
  CA: 0.0930,
  TX: 0.0,
  FL: 0.0,
  NY: 0.0685,
  IL: 0.0495,
  PA: 0.0307,
  OH: 0.0399,
  GA: 0.0549,
  NC: 0.045,
  NJ: 0.1075,
  WA: 0.0,
};

function calculateFederalTax(annualGross: number, filingStatus: string, allowances: number): number {
  const brackets =
    filingStatus === "married" ? FEDERAL_BRACKETS_MARRIED : FEDERAL_BRACKETS_SINGLE;

  let tax = 0;
  for (const bracket of brackets) {
    if (annualGross <= bracket.min) break;
    const taxable = Math.min(annualGross, bracket.max) - bracket.min;
    tax += taxable * bracket.rate;
  }

  // Apply standard deduction based on filing status
  const standardDeduction = filingStatus === "married" ? 29200 : 14600;
  const deductionSavings = standardDeduction * 0.12; // simplified
  tax = Math.max(0, tax - deductionSavings);

  // Reduce by allowances
  tax = Math.max(0, tax - allowances * 500);

  return Math.round(tax * 100) / 100;
}

function calculateStateTax(annualGross: number, state: string = "default"): number {
  const rate = STATE_TAX_RATES[state] || STATE_TAX_RATES["default"];
  return Math.round(annualGross * rate * 100) / 100;
}

function calculateSocialSecurity(grossPay: number): number {
  const wageBase = 168600; // 2024 SS wage base
  const rate = 0.062;
  return Math.round(Math.min(grossPay, wageBase) * rate * 100) / 100;
}

function calculateMedicare(grossPay: number): number {
  const rate = 0.0145;
  let tax = grossPay * rate;
  // Additional Medicare tax for high earners
  if (grossPay > 200000) {
    tax += (grossPay - 200000) * 0.009;
  }
  return Math.round(tax * 100) / 100;
}

/**
 * Calculate payroll for a single employee for a pay period
 */
export function calculatePayroll(input: PayrollCalculationInput): PayrollResult {
  const regularPay = input.regularHours * input.payRate;
  const overtimePay = input.overtimeHours * input.payRate * input.overtimeRate;
  const grossPay = regularPay + overtimePay;
  const totalHours = input.regularHours + input.overtimeHours;

  // Annualize for tax calculation (assuming bi-weekly = 26 pay periods)
  const annualGross = grossPay * 26;

  const federalTax = calculateFederalTax(annualGross, input.taxFilingStatus, input.taxAllowances);
  const stateTax = calculateStateTax(annualGross);
  const socialSecurity = calculateSocialSecurity(grossPay);
  const medicare = calculateMedicare(grossPay);

  const totalDeductions =
    federalTax + stateTax + socialSecurity + medicare +
    input.healthInsurance + input.retirement401k + input.otherDeductions;

  const netPay = grossPay - totalDeductions;

  return {
    regularHours: Math.round(input.regularHours * 100) / 100,
    overtimeHours: Math.round(input.overtimeHours * 100) / 100,
    totalHours: Math.round(totalHours * 100) / 100,
    regularPay: Math.round(regularPay * 100) / 100,
    overtimePay: Math.round(overtimePay * 100) / 100,
    grossPay: Math.round(grossPay * 100) / 100,
    federalTax: Math.round(federalTax * 100) / 100,
    stateTax: Math.round(stateTax * 100) / 100,
    socialSecurity: Math.round(socialSecurity * 100) / 100,
    medicare: Math.round(medicare * 100) / 100,
    healthInsurance: input.healthInsurance,
    retirement401k: input.retirement401k,
    otherDeductions: input.otherDeductions,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100,
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}
