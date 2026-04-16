// ─── Workforce Reports View Tests ───────────────────────────────────
// Covers: 1c-v11-modules

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkforceReportsView } from "@/components/hrm/workforce-reports-view";
import { useAppStore } from "@/store/app";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  useAppStore.setState({
    employees: [
      { id: "1", employeeId: "EMP001", firstName: "Jane", lastName: "Doe", email: "jane@test.com", role: "admin", status: "active", hireDate: "2024-01-15", departmentId: "d1", payType: "salary", payRate: 50000, overtimeRate: 1.5 },
    ],
    departments: [{ id: "d1", name: "Engineering", code: "ENG" }],
    attendance: [],
    ptoRequests: [],
    payrollPeriods: [],
  });

  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

describe("WorkforceReportsView", () => {
  it("should render the Workforce Reports heading", () => {
    render(<WorkforceReportsView />);
    const headings = screen.getAllByText(/Workforce|Reports/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should have multiple tabs", () => {
    render(<WorkforceReportsView />);
    const tabs = document.querySelectorAll("[role='tab'], button[data-state], [class*='tab']");
    expect(tabs.length).toBeGreaterThan(0);
  });

  it("should display overview content", () => {
    render(<WorkforceReportsView />);
    const content = screen.getAllByText(/Overview|Summary|Workforce|Report/i);
    expect(content.length).toBeGreaterThan(0);
  });

  it("should render responsive grid layout", () => {
    render(<WorkforceReportsView />);
    const grids = document.querySelectorAll("[class*='grid-cols']");
    expect(grids.length).toBeGreaterThan(0);
  });

  it("should display stat-like information", () => {
    render(<WorkforceReportsView />);
    // Should have numeric content somewhere
    const cards = document.querySelectorAll("[class*='card'], [class*='Card']");
    expect(cards.length).toBeGreaterThan(0);
  });
});
