// ─── Dashboard View Tests ───────────────────────────────────────────
// Covers: 7-dashboard-enhance + 8-quick-actions + r4-new-features

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardView } from "@/components/hrm/dashboard-view";
import { useAppStore } from "@/store/app";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  useAppStore.setState({
    employees: [
      { id: "1", employeeId: "EMP001", firstName: "Jane", lastName: "Doe", email: "jane@test.com", role: "admin", status: "active", hireDate: "2024-01-15", departmentId: "d1", payType: "salary", payRate: 50000, overtimeRate: 1.5 },
      { id: "2", employeeId: "EMP002", firstName: "John", lastName: "Smith", email: "john@test.com", role: "employee", status: "active", hireDate: "2025-06-01", departmentId: "d2", payType: "hourly", payRate: 25, overtimeRate: 1.5 },
      { id: "3", employeeId: "EMP003", firstName: "Alice", lastName: "Brown", email: "alice@test.com", role: "manager", status: "on_leave", hireDate: "2023-03-10", departmentId: "d1", payType: "salary", payRate: 65000, overtimeRate: 1.5 },
    ],
    attendance: [
      { id: "a1", employeeId: "1", geofenceId: "g1", clockIn: new Date().toISOString(), clockInLat: 18.0, clockInLng: -76.8, status: "active", totalHours: 4 },
    ],
    ptoRequests: [
      { id: "p1", employeeId: "2", type: "vacation", startDate: "2026-07-01", endDate: "2026-07-05", daysCount: 5, status: "pending" },
    ],
    departments: [
      { id: "d1", name: "Engineering", code: "ENG" },
      { id: "d2", name: "Marketing", code: "MKT" },
    ],
    payrollPeriods: [],
    currentView: "dashboard",
  });

  mockFetch.mockImplementation((url: string) => {
    if (url.includes("/api/activity-feed")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          activities: [
            { id: "act-1", type: "attendance", title: "Jane Doe", description: "Clocked in at 9:00 AM", timestamp: new Date().toISOString(), department: "Engineering", icon: "clock" },
          ],
          whosOut: [],
        }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ records: [], requests: [], employees: [], departments: [], periods: [] }) });
  });
});

describe("DashboardView", () => {
  it("should render the Dashboard heading", async () => {
    render(<DashboardView />);
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });

  it("should render stat cards after loading", async () => {
    render(<DashboardView />);
    expect(await screen.findByText("Total Employees")).toBeInTheDocument();
    expect(screen.getByText("Clocked In Today")).toBeInTheDocument();
    expect(screen.getByText("Pending PTO Requests")).toBeInTheDocument();
    expect(screen.getByText("Monthly Payroll Total")).toBeInTheDocument();
  });

  it("should display correct total active employees count", async () => {
    render(<DashboardView />);
    // 2 active employees out of 3 (one on_leave)
    expect(await screen.findByText("2")).toBeInTheDocument();
  });

  // ─── Quick Actions Toolbar (Task 8) ────────────────────────────
  it("should render Quick Actions toolbar", async () => {
    render(<DashboardView />);
    const quickActions = await screen.findAllByText(/Quick Actions/i);
    expect(quickActions.length).toBeGreaterThan(0);
  });

  it("should render quick action buttons", async () => {
    render(<DashboardView />);
    await screen.findAllByText(/Quick Actions/i);
    expect(screen.getByText("Clock In")).toBeInTheDocument();
    expect(screen.getByText("Request Time Off")).toBeInTheDocument();
    expect(screen.getByText("View Pay Stub")).toBeInTheDocument();
    expect(screen.getByText("My Reviews")).toBeInTheDocument();
    // Use getAllByText for labels that may appear in nav too
    const announcements = screen.getAllByText("Announcements");
    expect(announcements.length).toBeGreaterThan(0);
    const reports = screen.getAllByText("Reports");
    expect(reports.length).toBeGreaterThan(0);
    expect(screen.getByText("Ask AI")).toBeInTheDocument();
  });

  it("should navigate when a quick action is clicked", async () => {
    const user = userEvent.setup();
    render(<DashboardView />);
    const clockInBtn = await screen.findByText("Clock In");
    await user.click(clockInBtn);
    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalled();
  });

  // ─── World Clock (Task r4-new-features) ────────────────────────
  it("should render World Clock widget", async () => {
    render(<DashboardView />);
    expect(await screen.findByText("World Clock")).toBeInTheDocument();
  });

  it("should display 4 timezone cities", async () => {
    render(<DashboardView />);
    await screen.findByText("World Clock");
    expect(screen.getByText("Kingston")).toBeInTheDocument();
    expect(screen.getByText("New York")).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("Toronto")).toBeInTheDocument();
  });

  it("should display timezone labels", async () => {
    render(<DashboardView />);
    await screen.findByText("World Clock");
    expect(screen.getByText("MSBM HQ")).toBeInTheDocument();
    expect(screen.getByText("USA East")).toBeInTheDocument();
    expect(screen.getByText("UK/Europe")).toBeInTheDocument();
    expect(screen.getByText("Canada")).toBeInTheDocument();
  });

  it("should show Live indicator on World Clock", async () => {
    render(<DashboardView />);
    const liveTexts = await screen.findAllByText("Live");
    expect(liveTexts.length).toBeGreaterThan(0);
  });

  // ─── Employee Quick Stats (Task r4-new-features) ───────────────
  it("should render Employee Quick Stats section", async () => {
    render(<DashboardView />);
    expect(await screen.findByText("Employee Quick Stats")).toBeInTheDocument();
  });

  it("should show quick stat labels", async () => {
    render(<DashboardView />);
    await screen.findByText("Employee Quick Stats");
    expect(screen.getByText("Total Active")).toBeInTheDocument();
    expect(screen.getByText("On Leave")).toBeInTheDocument();
  });

  // ─── Upcoming Events (Task 7-dashboard-enhance) ────────────────
  it("should render Upcoming Events section", async () => {
    render(<DashboardView />);
    const titles = await screen.findAllByText(/Upcoming Events/i);
    expect(titles.length).toBeGreaterThan(0);
  });

  // ─── Charts ────────────────────────────────────────────────────
  it("should render Weekly Attendance chart", async () => {
    render(<DashboardView />);
    expect(await screen.findByText("Weekly Attendance")).toBeInTheDocument();
  });

  it("should render Department Distribution chart", async () => {
    render(<DashboardView />);
    expect(await screen.findByText("Department Distribution")).toBeInTheDocument();
  });

  // ─── Loading State ─────────────────────────────────────────────
  it("should show loading skeletons initially", () => {
    useAppStore.setState({ employees: [], attendance: [], departments: [] });
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<DashboardView />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  // ─── Responsive Layout ─────────────────────────────────────────
  it("should use responsive grid for stat cards", async () => {
    render(<DashboardView />);
    await screen.findByText("Total Employees");
    const gridContainer = document.querySelector("[class*='grid-cols-1'][class*='grid-cols-4'], [class*='grid'][class*='grid-cols']");
    expect(gridContainer).toBeTruthy();
  });
});
