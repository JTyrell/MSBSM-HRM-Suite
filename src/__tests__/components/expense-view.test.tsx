// ─── Expense View Tests ─────────────────────────────────────────────
// Covers: 11-training-expenses (Expense Reimbursement)

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExpenseView } from "@/components/hrm/expense-view";
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

describe("ExpenseView", () => {
  it("should render the Expenses heading", () => {
    render(<ExpenseView />);
    const headings = screen.getAllByText(/Expense/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should render Submit Expense button", () => {
    render(<ExpenseView />);
    const submitBtns = screen.getAllByText(/Submit|New Expense|Add/i);
    expect(submitBtns.length).toBeGreaterThan(0);
  });

  it("should display stat cards", () => {
    render(<ExpenseView />);
    const stats = screen.getAllByText(/Total Submitted/i);
    expect(stats.length).toBeGreaterThan(0);
  });

  it("should show Pending stat", () => {
    render(<ExpenseView />);
    const pending = screen.getAllByText(/Pending/i);
    expect(pending.length).toBeGreaterThan(0);
  });

  it("should show Approved stat", () => {
    render(<ExpenseView />);
    const approved = screen.getAllByText(/Approved/i);
    expect(approved.length).toBeGreaterThan(0);
  });

  it("should display expense tabs", () => {
    render(<ExpenseView />);
    const allExpenses = screen.getAllByText(/All Expenses/i);
    expect(allExpenses.length).toBeGreaterThan(0);
    const myExpenses = screen.getAllByText(/My Expenses/i);
    expect(myExpenses.length).toBeGreaterThan(0);
  });

  it("should display Approvals tab for admin/manager", () => {
    render(<ExpenseView />);
    const approvals = screen.getAllByText(/Approvals/i);
    expect(approvals.length).toBeGreaterThan(0);
  });

  it("should display expense type badges", () => {
    render(<ExpenseView />);
    const types = screen.getAllByText(/Travel|Meals|Office|Software|Training|Miscellaneous/i);
    expect(types.length).toBeGreaterThan(0);
  });

  it("should display status badges", () => {
    render(<ExpenseView />);
    const statuses = screen.getAllByText(/Pending|Approved|Rejected|Processing/i);
    expect(statuses.length).toBeGreaterThan(0);
  });

  it("should show dollar amounts", () => {
    render(<ExpenseView />);
    const amounts = screen.getAllByText(/\$/);
    expect(amounts.length).toBeGreaterThan(0);
  });

  it("should have responsive layout", () => {
    render(<ExpenseView />);
    const grids = document.querySelectorAll("[class*='grid-cols']");
    expect(grids.length).toBeGreaterThan(0);
  });
});
