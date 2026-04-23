// ─── Role-Based Access Integration Tests ─────────────────────────────
// Verifies UI variations across components based on user role.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useAppStore } from "@/store/app";

// Components to test
import { ExpenseView } from "@/components/hrm/expense-view";
import { PerformanceReviewsView } from "@/components/hrm/performance-reviews-view";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ reviews: [], expenses: [] }),
  });
  
  // Base State setup
  useAppStore.setState({
    employees: [
      { id: "emp-admin", employeeId: "620000001", firstName: "Admin", lastName: "User", email: "admin@uwi.edu", role: "admin", status: "active", hireDate: "2024-01-01" },
      { id: "emp-hr", employeeId: "620000002", firstName: "HR", lastName: "User", email: "hr@uwi.edu", role: "hr", status: "active", hireDate: "2024-01-01" },
      { id: "emp-manager", employeeId: "620000003", firstName: "Manager", lastName: "User", email: "manager@uwi.edu", role: "manager", status: "active", hireDate: "2024-01-01", departmentId: "d1" },
      { id: "emp-employee", employeeId: "620000004", firstName: "Employee", lastName: "User", email: "emp@uwi.edu", role: "employee", status: "active", hireDate: "2024-01-01", departmentId: "d1" },
    ],
    expenses: [],
    performanceReviews: [],
    departments: [{ id: "d1", name: "Engineering", code: "ENG" }],
  });
});

describe("Role-Based Access: ExpenseView", () => {
  it("shows Approvals tab for admin role", () => {
    useAppStore.setState({ currentUserId: "emp-admin" });
    render(<ExpenseView />);
    // Testing specific UI logic that should be visible to Admins
    expect(screen.getByRole("tab", { name: /approvals/i })).toBeInTheDocument();
  });

  it("shows Approvals tab for manager role", () => {
    useAppStore.setState({ currentUserId: "emp-manager" });
    render(<ExpenseView />);
    expect(screen.getByRole("tab", { name: /approvals/i })).toBeInTheDocument();
  });

  it("hides Approvals tab for employee role", () => {
    useAppStore.setState({ currentUserId: "emp-employee" });
    render(<ExpenseView />);
    expect(screen.queryByRole("tab", { name: /approvals/i })).not.toBeInTheDocument();
  });
});

describe("Role-Based Access: PerformanceReviewsView", () => {
  it("allows HR and Admins to create new reviews", async () => {
    // Admin
    useAppStore.setState({ currentUserId: "emp-admin" });
    const { unmount: unmountAdmin } = render(<PerformanceReviewsView />);
    expect(await screen.findByRole("button", { name: /create review/i })).toBeInTheDocument();
    unmountAdmin();

    // HR
    useAppStore.setState({ currentUserId: "emp-hr" });
    render(<PerformanceReviewsView />);
    expect(await screen.findByRole("button", { name: /create review/i })).toBeInTheDocument();
  });

  it("allows Managers to create new reviews", async () => {
    useAppStore.setState({ currentUserId: "emp-manager" });
    render(<PerformanceReviewsView />);
    expect(await screen.findByRole("button", { name: /create review/i })).toBeInTheDocument();
  });

  it("hides create review button for employees", async () => {
    useAppStore.setState({ currentUserId: "emp-employee" });
    render(<PerformanceReviewsView />);
    
    // Wait for the loading screen to disappear
    await waitFor(() => {
      expect(screen.queryByText(/loading reviews/i)).not.toBeInTheDocument();
    });
    
    expect(screen.queryByRole("button", { name: /create review/i })).not.toBeInTheDocument();
  });
});
