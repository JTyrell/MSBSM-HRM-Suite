// ─── Training View Tests ────────────────────────────────────────────
// Covers: 11-training-expenses (Training & Learning Management)

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrainingView } from "@/components/hrm/training-view";
import { useAppStore } from "@/store/app";

beforeEach(() => {
  vi.clearAllMocks();
  useAppStore.setState({
    currentUserId: "user-1",
    employees: [
      { id: "user-1", employeeId: "EMP001", firstName: "Jane", lastName: "Doe", email: "jane@test.com", role: "admin", status: "active", hireDate: "2024-01-15", departmentId: "d1", payType: "salary", payRate: 50000, overtimeRate: 1.5 },
      { id: "user-2", employeeId: "EMP002", firstName: "John", lastName: "Smith", email: "john@test.com", role: "employee", status: "active", hireDate: "2024-06-01", departmentId: "d2", payType: "hourly", payRate: 25, overtimeRate: 1.5 },
    ],
  });
});

describe("TrainingView", () => {
  it("should render the Training heading", () => {
    render(<TrainingView />);
    const headings = screen.getAllByText(/Training|Learning/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should render stat cards", () => {
    render(<TrainingView />);
    const totalCourses = screen.getAllByText(/Total Courses/i);
    expect(totalCourses.length).toBeGreaterThan(0);
    const completed = screen.getAllByText(/Completed/i);
    expect(completed.length).toBeGreaterThan(0);
  });

  it("should show In Progress stat", () => {
    render(<TrainingView />);
    const inProgress = screen.getAllByText(/In Progress/i);
    expect(inProgress.length).toBeGreaterThan(0);
  });

  it("should display Learning Hours stat", () => {
    render(<TrainingView />);
    const learningHours = screen.getAllByText(/Learning Hours/i);
    expect(learningHours.length).toBeGreaterThan(0);
  });

  it("should display course cards", () => {
    render(<TrainingView />);
    const courses = screen.getAllByText(/Workplace Safety|Anti-Harassment|Data Privacy/i);
    expect(courses.length).toBeGreaterThan(0);
  });

  it("should display category badges", () => {
    render(<TrainingView />);
    const compliance = screen.getAllByText(/Compliance/i);
    expect(compliance.length).toBeGreaterThan(0);
  });

  it("should display difficulty levels", () => {
    render(<TrainingView />);
    const difficulties = screen.getAllByText(/Beginner|Intermediate|Advanced/i);
    expect(difficulties.length).toBeGreaterThan(0);
  });

  it("should have course tabs", () => {
    render(<TrainingView />);
    const tabs = screen.getAllByText(/Courses|All Courses/i);
    expect(tabs.length).toBeGreaterThan(0);
  });

  it("should display My Learning tab", () => {
    render(<TrainingView />);
    const myLearning = screen.getAllByText(/My Learning/i);
    expect(myLearning.length).toBeGreaterThan(0);
  });

  it("should display Leaderboard tab", () => {
    render(<TrainingView />);
    const leaderboard = screen.getAllByText(/Leaderboard/i);
    expect(leaderboard.length).toBeGreaterThan(0);
  });

  it("should have a search input", () => {
    render(<TrainingView />);
    const searchInput = document.querySelector("input[type='text'], input[placeholder*='Search'], input[placeholder*='search'], input:not([type])");
    expect(searchInput).toBeTruthy();
  });

  it("should use responsive grid for course cards", () => {
    render(<TrainingView />);
    const grids = document.querySelectorAll("[class*='grid-cols']");
    expect(grids.length).toBeGreaterThan(0);
  });
});
