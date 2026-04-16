// ─── Benefits View Tests ────────────────────────────────────────────
// Covers: r5-benefits

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BenefitsView } from "@/components/hrm/benefits-view";
import { useAppStore } from "@/store/app";

beforeEach(() => {
  vi.clearAllMocks();
  useAppStore.setState({
    currentUserId: "user-1",
    employees: [
      { id: "user-1", employeeId: "EMP001", firstName: "Jane", lastName: "Doe", email: "jane@test.com", role: "admin", status: "active", hireDate: "2024-01-15", departmentId: "d1", payType: "salary", payRate: 50000, overtimeRate: 1.5 },
    ],
  });
});

describe("BenefitsView", () => {
  it("should render the Benefits heading", () => {
    render(<BenefitsView />);
    const headings = screen.getAllByText(/Benefits/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should render stat cards", () => {
    render(<BenefitsView />);
    const enrollments = screen.getAllByText(/Active Enrollments/i);
    expect(enrollments.length).toBeGreaterThan(0);
    const totalVal = screen.getAllByText(/Total Benefits Value/i);
    expect(totalVal.length).toBeGreaterThan(0);
  });

  it("should show monthly cost stat", () => {
    render(<BenefitsView />);
    const cost = screen.getAllByText(/Monthly Cost/i);
    expect(cost.length).toBeGreaterThan(0);
  });

  it("should display coverage score", () => {
    render(<BenefitsView />);
    const score = screen.getAllByText(/Coverage Score/i);
    expect(score.length).toBeGreaterThan(0);
  });

  it("should have benefit category tabs", () => {
    render(<BenefitsView />);
    const healthTabs = screen.getAllByText(/Health/i);
    expect(healthTabs.length).toBeGreaterThan(0);
    const financialTabs = screen.getAllByText(/Financial/i);
    expect(financialTabs.length).toBeGreaterThan(0);
  });

  it("should render quick action buttons", () => {
    render(<BenefitsView />);
    const enrollBtns = screen.getAllByText(/Enroll/i);
    expect(enrollBtns.length).toBeGreaterThan(0);
    const claimBtns = screen.getAllByText(/Claim/i);
    expect(claimBtns.length).toBeGreaterThan(0);
  });

  it("should display download summary action", () => {
    render(<BenefitsView />);
    const downloadBtns = screen.getAllByText(/Download/i);
    expect(downloadBtns.length).toBeGreaterThan(0);
  });

  it("should display enrollment timeline", () => {
    render(<BenefitsView />);
    const enrollment = screen.getAllByText(/Enrollment/i);
    expect(enrollment.length).toBeGreaterThan(0);
  });

  it("should render Benefits Health Score", () => {
    render(<BenefitsView />);
    const scores = screen.getAllByText(/92/);
    expect(scores.length).toBeGreaterThan(0);
  });

  it("should use responsive grid for stat cards", () => {
    render(<BenefitsView />);
    const grids = document.querySelectorAll("[class*='grid-cols']");
    expect(grids.length).toBeGreaterThan(0);
  });
});
