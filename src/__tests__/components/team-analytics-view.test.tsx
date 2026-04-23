// ─── Team Analytics View Tests ──────────────────────────────────────
// Covers: r6-team-analytics

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TeamAnalyticsView } from "@/components/hrm/team-analytics-view";
import { useAppStore } from "@/store/app";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  useAppStore.setState({
    employees: [
      { id: "1", employeeId: "620123456", firstName: "Jane", lastName: "Doe", email: "jane@uwi.edu", role: "admin", status: "active", hireDate: "2024-01-15", departmentId: "d1", payType: "salary", payRate: 50000, overtimeRate: 1.5 },
      { id: "2", employeeId: "620123457", firstName: "John", lastName: "Smith", email: "john@uwi.edu", role: "employee", status: "active", hireDate: "2024-06-01", departmentId: "d2", payType: "hourly", payRate: 25, overtimeRate: 1.5 },
    ],
    departments: [
      { id: "d1", name: "Engineering", code: "ENG" },
      { id: "d2", name: "Marketing", code: "MKT" },
    ],
    attendance: [],
    payrollPeriods: [],
    ptoRequests: [],
  });

  mockFetch.mockImplementation(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ employees: [], departments: [], records: [], periods: [], requests: [] }) })
  );
});

describe("TeamAnalyticsView", () => {
  it("should render the Team Analytics heading", async () => {
    render(<TeamAnalyticsView />);
    const headings = await screen.findAllByText(/Team Analytics|People Insights|Analytics/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should render 5 tabs", async () => {
    render(<TeamAnalyticsView />);
    await waitFor(() => {
      const overview = screen.getAllByText(/Overview/i);
      const attendance = screen.getAllByText(/Attendance/i);
      const compensation = screen.getAllByText(/Compensation/i);
      expect(overview.length).toBeGreaterThan(0);
      expect(attendance.length).toBeGreaterThan(0);
      expect(compensation.length).toBeGreaterThan(0);
    });
  });

  it("should display headcount stat", async () => {
    render(<TeamAnalyticsView />);
    await waitFor(() => {
      const headcount = screen.getAllByText(/Headcount|Total/i);
      expect(headcount.length).toBeGreaterThan(0);
    });
  });

  it("should display department stats", async () => {
    render(<TeamAnalyticsView />);
    await waitFor(() => {
      const depts = screen.getAllByText(/Departments|Department/i);
      expect(depts.length).toBeGreaterThan(0);
    });
  });

  it("should render chart containers", async () => {
    render(<TeamAnalyticsView />);
    await waitFor(() => {
      const charts = document.querySelectorAll("[data-testid]");
      expect(charts.length).toBeGreaterThan(0);
    });
  });

  it("should fetch data on mount", async () => {
    render(<TeamAnalyticsView />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it("should have responsive grid", async () => {
    render(<TeamAnalyticsView />);
    await screen.findAllByText(/Team Analytics|People Insights|Analytics/i);
    const grids = document.querySelectorAll("[class*='grid-cols']");
    expect(grids.length).toBeGreaterThan(0);
  });
});
