// ─── Main Page Tests ────────────────────────────────────────────────
// Covers: All tasks (main page integration)

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import { useAppStore } from "@/store/app";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();

  // Pre-initialize the store so the loading screen is bypassed
  useAppStore.setState({
    currentUserId: "user-1",
    currentView: "dashboard",
    employees: [
      { id: "user-1", employeeId: "EMP001", firstName: "Jane", lastName: "Doe", email: "jane@test.com", role: "admin", status: "active", hireDate: "2024-01-15", departmentId: "d1", payType: "salary", payRate: 50000, overtimeRate: 1.5 },
    ],
    departments: [],
    geofences: [],
    attendance: [],
    payrollPeriods: [],
    ptoRequests: [],
    notifications: [],
    isLoading: false,
  });

  mockFetch.mockImplementation((url: string) => {
    if (url.includes("/api/seed")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          employees: [
            { id: "user-1", employeeId: "EMP001", firstName: "Jane", lastName: "Doe", email: "jane@test.com", role: "admin", status: "active", hireDate: "2024-01-15", departmentId: "d1", payType: "salary", payRate: 50000, overtimeRate: 1.5 },
          ],
        }),
      });
    }
    if (url.includes("/api/notifications")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ notifications: [] }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe("HomePage", () => {
  it("should render the initializing screen text for MSBM-HR Suite", () => {
    // Before initialization
    render(<HomePage />);
    const suiteTexts = screen.getAllByText(/MSBM/i);
    expect(suiteTexts.length).toBeGreaterThan(0);
  });

  it("should show version v13.0 after loading", async () => {
    render(<HomePage />);
    await waitFor(() => {
      const versions = screen.getAllByText(/v13\.0/i);
      expect(versions.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it("should render MSBM-HR heading in sidebar", async () => {
    render(<HomePage />);
    await waitFor(() => {
      const headings = screen.getAllByText(/MSBM-HR/i);
      expect(headings.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  // ─── Navigation Items ──────────────────────────────────────────
  it("should render Dashboard nav item", async () => {
    render(<HomePage />);
    await waitFor(() => {
      expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it("should render key navigation items from all tasks", async () => {
    render(<HomePage />);
    await waitFor(() => {
      // From r4-shift-management
      expect(screen.getAllByText("Shifts").length).toBeGreaterThan(0);
      // From 7-performance-reviews
      expect(screen.getAllByText("Reviews").length).toBeGreaterThan(0);
      // From r5-benefits
      expect(screen.getAllByText("Benefits").length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it("should render more navigation items", async () => {
    render(<HomePage />);
    await waitFor(() => {
      // From r6-team-analytics
      expect(screen.getAllByText("Team Analytics").length).toBeGreaterThan(0);
      // From 11-training-expenses
      expect(screen.getAllByText("Training").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Expenses").length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it("should render AI Assistant and Settings nav items", async () => {
    render(<HomePage />);
    await waitFor(() => {
      expect(screen.getAllByText("AI Assistant").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Settings").length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  // ─── User Menu ─────────────────────────────────────────────────
  it("should display current user name", async () => {
    render(<HomePage />);
    await waitFor(() => {
      // Name might be split across elements
      const janes = screen.getAllByText(/Jane/i);
      expect(janes.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  // ─── Reset Demo button ─────────────────────────────────────────
  it("should have a Reset Demo button", async () => {
    render(<HomePage />);
    await waitFor(() => {
      const resetBtns = screen.getAllByText(/Reset Demo/i);
      expect(resetBtns.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  // ─── Mobile Menu ────────────────────────────────────────────────
  it("should have a hamburger menu button for mobile", async () => {
    render(<HomePage />);
    await waitFor(() => {
      const menuButton = document.querySelector("button.lg\\:hidden");
      expect(menuButton).toBeTruthy();
    }, { timeout: 5000 });
  });

  // ─── Responsive: Desktop Sidebar ───────────────────────────────
  it("should have a desktop sidebar hidden on mobile", async () => {
    render(<HomePage />);
    await waitFor(() => {
      const desktopSidebar = document.querySelector("aside.hidden.lg\\:flex");
      expect(desktopSidebar).toBeTruthy();
    }, { timeout: 5000 });
  });

  // ─── Active view indicator ─────────────────────────────────────
  it("should show active view indicator in sidebar", async () => {
    render(<HomePage />);
    await waitFor(() => {
      const activeIndicator = screen.getAllByText("Active");
      expect(activeIndicator.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  // ─── Copyright ─────────────────────────────────────────────────
  it("should show copyright info", async () => {
    render(<HomePage />);
    await waitFor(() => {
      const copyright = screen.getAllByText(/© 2026 MSBM Group/);
      expect(copyright.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });
});
