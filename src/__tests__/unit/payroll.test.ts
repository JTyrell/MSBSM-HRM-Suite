// ─── Payroll Utility Tests ──────────────────────────────────────────
// Covers: Payroll calculation engine and formatCurrency

import { describe, it, expect } from "vitest";
import { calculatePayroll, formatCurrency, type PayrollCalculationInput } from "@/lib/payroll";

describe("formatCurrency", () => {
  it("should format positive amounts with $ and 2 decimals", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("should format zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("should format negative amounts", () => {
    expect(formatCurrency(-500)).toBe("-$500.00");
  });

  it("should format large amounts with commas", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000.00");
  });

  it("should round to 2 decimal places", () => {
    expect(formatCurrency(99.999)).toBe("$100.00");
  });

  it("should format small amounts correctly", () => {
    expect(formatCurrency(0.01)).toBe("$0.01");
  });
});

describe("calculatePayroll", () => {
  const baseInput: PayrollCalculationInput = {
    regularHours: 80,
    overtimeHours: 0,
    payRate: 25,
    overtimeRate: 1.5,
    taxFilingStatus: "single",
    taxAllowances: 0,
    healthInsurance: 150,
    retirement401k: 100,
    otherDeductions: 0,
  };

  it("should calculate correct gross pay for regular hours only", () => {
    const result = calculatePayroll(baseInput);
    expect(result.regularPay).toBe(2000); // 80 * 25
    expect(result.overtimePay).toBe(0);
    expect(result.grossPay).toBe(2000);
    expect(result.totalHours).toBe(80);
  });

  it("should calculate overtime pay correctly", () => {
    const input = { ...baseInput, overtimeHours: 10, overtimeRate: 1.5 };
    const result = calculatePayroll(input);
    expect(result.overtimePay).toBe(375); // 10 * 25 * 1.5
    expect(result.grossPay).toBe(2375); // 2000 + 375
    expect(result.totalHours).toBe(90);
  });

  it("should calculate Social Security deduction (6.2%)", () => {
    const result = calculatePayroll(baseInput);
    expect(result.socialSecurity).toBe(124); // 2000 * 0.062
  });

  it("should calculate Medicare deduction (1.45%)", () => {
    const result = calculatePayroll(baseInput);
    expect(result.medicare).toBe(29); // 2000 * 0.0145
  });

  it("should include health insurance and 401k in total deductions", () => {
    const result = calculatePayroll(baseInput);
    expect(result.healthInsurance).toBe(150);
    expect(result.retirement401k).toBe(100);
    // Total deductions should include all: federal + state + SS + Medicare + health + 401k
    expect(result.totalDeductions).toBeGreaterThan(150 + 100 + 124 + 29);
  });

  it("should calculate net pay as gross minus total deductions", () => {
    const result = calculatePayroll(baseInput);
    expect(result.netPay).toBeCloseTo(result.grossPay - result.totalDeductions, 2);
  });

  it("should handle married filing status (different tax brackets)", () => {
    const single = calculatePayroll({ ...baseInput, taxFilingStatus: "single" });
    const married = calculatePayroll({ ...baseInput, taxFilingStatus: "married" });
    // Married filing should typically have lower federal tax
    expect(married.federalTax).toBeLessThanOrEqual(single.federalTax);
  });

  it("should reduce federal tax by $500 per allowance", () => {
    const noAllowance = calculatePayroll({ ...baseInput, taxAllowances: 0 });
    const twoAllowances = calculatePayroll({ ...baseInput, taxAllowances: 2 });
    expect(twoAllowances.federalTax).toBeLessThan(noAllowance.federalTax);
  });

  it("should handle zero hours gracefully", () => {
    const input = { ...baseInput, regularHours: 0, overtimeHours: 0 };
    const result = calculatePayroll(input);
    expect(result.grossPay).toBe(0);
    expect(result.totalHours).toBe(0);
    expect(result.regularPay).toBe(0);
  });

  it("should round all monetary values to 2 decimal places", () => {
    const input = { ...baseInput, payRate: 33.33, regularHours: 77 };
    const result = calculatePayroll(input);
    // Check that all monetary fields have at most 2 decimal digits
    expect(Number(result.grossPay.toFixed(2))).toBe(result.grossPay);
    expect(Number(result.socialSecurity.toFixed(2))).toBe(result.socialSecurity);
    expect(Number(result.medicare.toFixed(2))).toBe(result.medicare);
    expect(Number(result.netPay.toFixed(2))).toBe(result.netPay);
  });

  it("should include other deductions in total", () => {
    const input = { ...baseInput, otherDeductions: 75 };
    const result = calculatePayroll(input);
    const withoutOther = calculatePayroll(baseInput);
    expect(result.totalDeductions).toBe(withoutOther.totalDeductions + 75);
  });
});
